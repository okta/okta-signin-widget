#!/bin/bash -xe

DOCKOLITH_BRANCH=ag-OKTA-535068-email

pushd ./scripts
rm -rf dockolith
git clone --depth 1 -b $DOCKOLITH_BRANCH https://github.com/okta/dockolith.git
popd

# Yarn "add" always modifies package.json https://github.com/yarnpkg/yarn/issues/1743
# Make a backup of package.json and restore it after install
cp package.json package.json.bak
yarn add -DW --no-lockfile file:./scripts/dockolith
mv package.json.bak package.json

