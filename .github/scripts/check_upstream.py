#!/usr/bin/env python3
"""
check_upstream.py — peek at the upstream CRX and decide whether a sync is needed.

Reads:
  upstream.crx   — downloaded CRX (CRX3 or plain zip)
  git-hash.txt   — records the last-processed upstream version

Writes to $GITHUB_OUTPUT:
  upstream_version  — version string from upstream manifest.json
  last_processed    — version string recorded in git-hash.txt (empty if none)
  should_sync       — "true" if upstream is newer *and* no existing branch/PR,
                      "false" otherwise
  skip_reason       — human-readable reason when should_sync=false
"""
import io
import json
import os
import re
import struct
import subprocess
import sys
import zipfile


def crx_to_zip_offset(data: bytes) -> int:
    """Return the byte offset where the zip payload begins inside a CRX file."""
    magic = data[:4]
    if magic == b"Cr24":  # CRX3
        header_size = struct.unpack_from("<I", data, 8)[0]
        return 12 + header_size
    if magic[:2] == b"PK":  # already a zip / CRX2
        return 0
    raise ValueError(f"Unknown CRX format: {magic!r}")


def read_upstream_version(crx_path: str) -> str:
    with open(crx_path, "rb") as f:
        data = f.read()
    offset = crx_to_zip_offset(data)
    with zipfile.ZipFile(io.BytesIO(data[offset:])) as zf:
        manifest = json.loads(zf.read("manifest.json"))
    return manifest.get("version", "unknown")


def read_last_processed(git_hash_path: str) -> str:
    try:
        with open(git_hash_path) as f:
            for line in f:
                m = re.search(r"upstream extension version:\s*([\d.]+)", line)
                if m:
                    return m.group(1)
    except FileNotFoundError:
        pass
    return ""


def is_sync_pending(upstream_version: str, base_branch: str) -> tuple[bool, str]:
    """Return (pending, reason) — True if a sync branch or open PR already exists."""
    sync_branch = f"sync/upstream-claude-for-chrome-{upstream_version}"

    result = subprocess.run(
        ["git", "ls-remote", "--exit-code", "--heads", "origin", sync_branch],
        capture_output=True,
    )
    if result.returncode == 0:
        return True, f"Branch {sync_branch} already exists remotely."

    result = subprocess.run(
        [
            "gh", "pr", "list",
            "--base", base_branch,
            "--state", "open",
            "--json", "title",
            "--jq", f'.[] | select(.title | contains("v{upstream_version}")) | .title',
        ],
        capture_output=True,
        text=True,
    )
    existing_pr = result.stdout.strip().splitlines()
    if existing_pr:
        return True, f"Open PR already exists for version {upstream_version}: {existing_pr[0]}"

    return False, ""


def write_outputs(**kwargs: str) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT", "")
    if not github_output:
        for k, v in kwargs.items():
            print(f"  {k}={v}")
        return
    with open(github_output, "a") as f:
        for k, v in kwargs.items():
            f.write(f"{k}={v}\n")


def main() -> None:
    force_sync = os.environ.get("FORCE_SYNC", "false").lower() == "true"
    base_branch = os.environ.get("BASE_BRANCH", "periodicUpdates")

    upstream_version = read_upstream_version("upstream.crx")
    last_processed = read_last_processed("git-hash.txt")

    print(f"Upstream CRX version  : {upstream_version}")
    print(f"Last-processed version: {last_processed or '(none)'}")

    if not force_sync:
        # Guard A: same version already recorded
        if upstream_version == last_processed:
            reason = f"Version {upstream_version} already processed — git-hash.txt is up to date."
            print(f"⏭  {reason}")
            write_outputs(
                upstream_version=upstream_version,
                last_processed=last_processed,
                should_sync="false",
                skip_reason=reason,
            )
            return

        # Guard B: sync branch or open PR already exists
        pending, reason = is_sync_pending(upstream_version, base_branch)
        if pending:
            print(f"⏭  {reason}")
            write_outputs(
                upstream_version=upstream_version,
                last_processed=last_processed,
                should_sync="false",
                skip_reason=reason,
            )
            return

    print(f"✅ New upstream version {upstream_version} — proceeding with sync.")
    write_outputs(
        upstream_version=upstream_version,
        last_processed=last_processed,
        should_sync="true",
        skip_reason="",
    )


if __name__ == "__main__":
    main()
