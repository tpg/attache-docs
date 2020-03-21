#!/usr/bin/env sh

set -e

vuepress build

cd .vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:tpg/attache.git master:gh-pages

cd -
