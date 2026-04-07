#!/usr/bin/env python3
"""
apply_upstream.py — extract the CRX, apply safe file updates, merge manifest.json,
and update provider-registry.js with any new Claude model IDs.

Expects to be run from the repo root after check_upstream.py has confirmed a sync
is needed.

Reads:  upstream.crx, manifest.json, provider-registry.js
Writes: upstream_unpacked/ (temp), manifest.json, provider-registry.js
"""
import copy
import io
import json
import os
import re
import shutil
import struct
import zipfile

# Files that belong to BrowserKing and must never be overwritten by upstream
PROTECTED_FILES = {
    "api-adapter.js",
    "brand-overlay.js",
    "claude_icon.svg",
    "icon-128.png",
    "options-provider-tab.js",
    "provider-config.js",
    "provider-registry.js",
    "provider-settings.html",
    "provider-settings.js",
    "sidepanel-provider-menu.js",
    "theme-init.js",
    "ui-branding.js",
    "voice-input.js",
    "README.md",
    ".gitignore",
}


# ── CRX helpers ──────────────────────────────────────────────────────────────

def crx_to_zip_offset(data: bytes) -> int:
    magic = data[:4]
    if magic == b"Cr24":
        header_size = struct.unpack_from("<I", data, 8)[0]
        return 12 + header_size
    if magic[:2] == b"PK":
        return 0
    raise ValueError(f"Unknown CRX format: {magic!r}")


def extract_crx(crx_path: str, dest: str) -> int:
    with open(crx_path, "rb") as f:
        data = f.read()
    offset = crx_to_zip_offset(data)
    with zipfile.ZipFile(io.BytesIO(data[offset:])) as zf:
        zf.extractall(dest)
        count = len(zf.namelist())
    print(f"Extracted {count} files to {dest}/")
    return count


# ── File diff / copy ─────────────────────────────────────────────────────────

def apply_file_updates(upstream_dir: str, repo_root: str) -> list[str]:
    """Copy changed upstream files to repo_root, skipping protected files."""
    changed: list[str] = []
    for dirpath, _dirs, filenames in os.walk(upstream_dir):
        for filename in filenames:
            src = os.path.join(dirpath, filename)
            rel = os.path.relpath(src, upstream_dir)

            # Skip .git internals
            if rel.startswith(".git"):
                continue
            # Skip BrowserKing-specific files
            if rel in PROTECTED_FILES:
                print(f"  SKIP (protected): {rel}")
                continue

            dest = os.path.join(repo_root, rel)
            os.makedirs(os.path.dirname(dest), exist_ok=True)

            # Only copy if content differs
            if os.path.exists(dest):
                with open(src, "rb") as f:
                    src_bytes = f.read()
                with open(dest, "rb") as f:
                    dest_bytes = f.read()
                if src_bytes == dest_bytes:
                    continue
            else:
                with open(src, "rb") as f:
                    src_bytes = f.read()

            with open(dest, "wb") as f:
                f.write(src_bytes)
            print(f"  UPDATED: {rel}")
            changed.append(rel)

    return changed


# ── manifest.json safe merge ─────────────────────────────────────────────────

def merge_manifest(repo_manifest_path: str, upstream_manifest_path: str) -> None:
    with open(repo_manifest_path) as f:
        current = json.load(f)
    with open(upstream_manifest_path) as f:
        upstream = json.load(f)

    merged = copy.deepcopy(current)

    # Bump version to upstream
    merged["version"] = upstream["version"]

    # Union permissions (never remove existing ones)
    merged["permissions"] = sorted(
        set(current.get("permissions", [])) | set(upstream.get("permissions", []))
    )
    merged["host_permissions"] = sorted(
        set(current.get("host_permissions", [])) | set(upstream.get("host_permissions", []))
    )

    # Take upstream CSP if present
    if "content_security_policy" in upstream:
        merged["content_security_policy"] = upstream["content_security_policy"]

    # Use the higher minimum_chrome_version (compare full dotted version tuples)
    if "minimum_chrome_version" in upstream:
        def _ver_tuple(v: str) -> tuple[int, ...]:
            return tuple(int(x) for x in v.split(".") if x.isdigit())

        cur_min = current.get("minimum_chrome_version", "0")
        up_min = upstream.get("minimum_chrome_version", "0")
        merged["minimum_chrome_version"] = (
            up_min if _ver_tuple(up_min) > _ver_tuple(cur_min) else cur_min
        )

    # Union web_accessible_resources by match-pattern key
    if "web_accessible_resources" in upstream:
        war_map = {
            tuple(sorted(e["matches"])): e
            for e in merged.get("web_accessible_resources", [])
        }
        for entry in upstream.get("web_accessible_resources", []):
            key = tuple(sorted(entry["matches"]))
            if key in war_map:
                war_map[key]["resources"] = sorted(
                    set(war_map[key]["resources"]) | set(entry["resources"])
                )
            else:
                war_map[key] = entry
        merged["web_accessible_resources"] = list(war_map.values())

    # Always preserve BrowserKing identity fields
    for field in ("name", "description", "icons"):
        if field in current:
            merged[field] = current[field]

    with open(repo_manifest_path, "w") as f:
        json.dump(merged, f, indent=3, ensure_ascii=False)
        f.write("\n")

    print(f"manifest.json merged — version: {merged['version']}")


# ── provider-registry.js model update ────────────────────────────────────────

def _make_label(model_id: str) -> str:
    # Expected format: claude-{tier}-{major}[-{minor}][-{YYYYMMDD}]
    # Examples: claude-sonnet-4-5-20250929, claude-opus-4-1, claude-haiku-4
    m = re.match(
        r"^claude-(opus|sonnet|haiku)-([\d]+)(?:-([\d]+))?(?:-(\d{8}))?$", model_id
    )
    if m:
        kind = m.group(1).capitalize()
        major, minor, date = m.group(2), m.group(3), m.group(4)
        ver = f"{major}.{minor}" if minor else major
        return f"Claude {kind} {ver}" + (f" ({date})" if date else "")
    return model_id.replace("claude-", "Claude ").replace("-", " ").title()


def update_provider_registry(upstream_dir: str, registry_path: str) -> list[str]:
    """Scan upstream JS for new Claude model IDs and append them to provider-registry.js."""
    upstream_models: set[str] = set()
    for dirpath, _dirs, filenames in os.walk(upstream_dir):
        for filename in filenames:
            if not filename.endswith(".js"):
                continue
            fpath = os.path.join(dirpath, filename)
            try:
                with open(fpath, encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except Exception:
                continue
            upstream_models.update(
                re.findall(r"claude-(?:opus|sonnet|haiku)-[\d][\w@.-]*", content)
            )

    dated = sorted(m for m in upstream_models if re.search(r"-\d{8}", m))
    generic = sorted(
        m
        for m in upstream_models
        if not re.search(r"-\d{8}", m)
        and re.match(r"^claude-(?:opus|sonnet|haiku)-[\d]", m)
    )
    print(f"Dated upstream models : {dated}")
    print(f"Generic upstream models: {generic}")

    with open(registry_path, encoding="utf-8") as f:
        registry = f.read()

    existing = set(re.findall(r"createModel\('([^']+)'", registry))

    new_entries = [
        (mid, _make_label(mid)) for mid in dated + generic if mid not in existing
    ]

    if not new_entries:
        print("No new Claude models to add.")
        return []

    anthropic_start = registry.find("anthropic: {")
    if anthropic_start == -1:
        print("WARNING: Cannot find anthropic provider block — skipping model update.")
        return []

    # Find the closing ] of the models array within the anthropic block
    models_start = registry.find("models: [", anthropic_start)
    depth, i = 0, models_start + len("models: [")
    while i < len(registry):
        if registry[i] == "[":
            depth += 1
        elif registry[i] == "]":
            if depth == 0:
                break
            depth -= 1
        i += 1

    new_lines = "".join(
        f"        createModel('{mid}', '{lbl}', {{ supportsVision: true }}),\n"
        for mid, lbl in new_entries
    )
    registry = registry[:i] + new_lines + registry[i:]

    with open(registry_path, "w", encoding="utf-8") as f:
        f.write(registry)

    added = [mid for mid, _ in new_entries]
    print(f"Added {len(added)} model(s) to provider-registry.js: {added}")
    return added


# ── entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    upstream_dir = "upstream_unpacked"

    print("=== Extracting CRX ===")
    extract_crx("upstream.crx", upstream_dir)

    print("\n=== Applying file updates ===")
    apply_file_updates(upstream_dir, ".")

    print("\n=== Merging manifest.json ===")
    merge_manifest("manifest.json", os.path.join(upstream_dir, "manifest.json"))

    print("\n=== Updating provider-registry.js ===")
    update_provider_registry(upstream_dir, "provider-registry.js")

    print("\n✅ apply_upstream.py complete.")


if __name__ == "__main__":
    main()
