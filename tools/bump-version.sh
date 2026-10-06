#!/bin/sh
# Stamps the stylesheet and script links with a version, so browsers always fetch files that match the page.
# Runs automatically before each commit (see .git/hooks/pre-commit); safe to run by hand.
cd "$(dirname "$0")/.." || exit 1
v=$(date +%Y%m%d%H%M%S)
for f in index.html photos/index.html photos/series/index.html projects/*/index.html assets/vox2-charts.js; do
  [ -f "$f" ] || continue
  sed -i '' -E "s#/assets/(site\.css|site\.js|vox2-charts\.js)(\?v=[0-9]+)?#/assets/\1?v=$v#g" "$f"
done
echo "assets stamped v=$v"
