#!/usr/bin/env sh

set -e

NODE_ENV=production npm run build

cd dist
echo > .nojekyll

git init
git checkout -B main
git add -A
git commit -m 'deploy'

git push -f git@github.com:driantn/playlist-manager.git main:gh-pages

cd -
