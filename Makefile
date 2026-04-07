# Makefile — run upstream update checks locally
#
# Usage:
#   make               # same as: make check
#   make fetch         # download the latest Claude for Chrome CRX
#   make check         # fetch + decide whether a sync is needed
#   make apply         # fetch + apply upstream changes (skips if up-to-date)
#   make force-apply   # fetch + force-apply even if version is unchanged

UPSTREAM_CRX_ID := danfohhfmbeahkgpbeibgibfpkhokbfp
CRX_FILE        := upstream.crx

# ── Resolve the latest stable Chrome version ─────────────────────────────────
CHROME_VERSION ?= $(shell \
  python3 -c "\
import urllib.request, json, sys; \
url='https://versionhistory.googleapis.com/v1/chrome/platforms/linux/channels/stable/versions?filter=endtime=none&order_by=version+desc&page_size=1'; \
d=json.load(urllib.request.urlopen(url)); print(d['versions'][0]['version'])" 2>/dev/null \
  || python3 -c "\
import urllib.request, json; \
url='https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=1'; \
d=json.load(urllib.request.urlopen(url)); print(d[0]['version'])" 2>/dev/null \
  || echo "138.0.7204.51")

CRX_URL := https://clients2.google.com/service/update2/crx?response=redirect&prodversion=$(CHROME_VERSION)&acceptformat=crx2,crx3&x=id%3D$(UPSTREAM_CRX_ID)%26uc

.PHONY: all fetch check apply force-apply clean

all: check

## fetch: Download the latest Claude for Chrome CRX to upstream.crx
fetch:
	@echo "Chrome prodversion: $(CHROME_VERSION)"
	@echo "Downloading CRX from: $(CRX_URL)"
	curl -fL -o $(CRX_FILE) "$(CRX_URL)"
	@echo "Downloaded $$(wc -c < $(CRX_FILE) | tr -d ' ') bytes."

## check: Download CRX and report whether a sync is needed (dry-run, no changes)
check: fetch
	python3 .github/scripts/check_upstream.py

## apply: Download CRX and apply upstream changes if a newer version is found
apply: fetch
	python3 .github/scripts/check_upstream.py && python3 .github/scripts/apply_upstream.py

## force-apply: Download CRX and force-apply upstream changes unconditionally
force-apply: fetch
	FORCE_SYNC=true python3 .github/scripts/check_upstream.py
	python3 .github/scripts/apply_upstream.py

## clean: Remove the downloaded CRX and unpacked upstream directory
clean:
	rm -f $(CRX_FILE)
	rm -rf upstream_unpacked/
