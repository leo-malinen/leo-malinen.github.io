#!/usr/bin/env bash
# Re-copy the site out of the scroll-craft build folder and commit it.
# Run from this directory:  bash publish.sh "what changed"
set -e
SRC="../scrollcraft/builds/blue-hour"
[ -d "$SRC" ] || { echo "build folder not found at $SRC"; exit 1; }

cp "$SRC"/index.html "$SRC"/page.css "$SRC"/sweep.js \
   "$SRC"/scrollcraft.js "$SRC"/scrollcraft.css ./
mkdir -p assets && cp "$SRC"/assets/*.webp assets/

# Only the site ships. BRIEF.md, lab/, src/ and node_modules stay behind.
if git diff --quiet && git diff --cached --quiet; then
  echo "nothing changed"; exit 0
fi
git add -A
git commit -m "${1:-Update site}"
echo
echo "committed. push with:  git push"
