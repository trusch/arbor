#!/usr/bin/env bash
# Publish the committed HEAD (or the ref given as $1) to GitHub Pages: builds it in a clean temporary checkout, so
# uncommitted work in the tree is never shipped, and force-pushes dist/ as a single commit to the gh-pages branch.
set -euo pipefail
root=$(git rev-parse --show-toplevel)
ref=$(git -C "$root" rev-parse --short "${1:-HEAD}")
tmp=$(mktemp -d)
trap 'git -C "$root" worktree remove --force "$tmp/src" 2>/dev/null || true; rm -rf "$tmp"' EXIT
git -C "$root" worktree add --detach "$tmp/src" "$ref" >/dev/null
ln -s "$(readlink -f "$root/node_modules")" "$tmp/src/node_modules"
(cd "$tmp/src" && npm run build >/dev/null)
cd "$tmp/src/dist"
touch .nojekyll
git init -q -b gh-pages
git add -A
git -c commit.gpgsign=false -c user.name="$(git -C "$root" config user.name)" -c user.email="$(git -C "$root" config user.email)" \
  commit -q -m "Publish $ref"
git push -q --force "$(git -C "$root" remote get-url origin)" gh-pages
echo "published $ref -> gh-pages"
