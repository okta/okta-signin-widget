#!/bin/bash -xe

# Yarn "add" always modifies package.json https://github.com/yarnpkg/yarn/issues/1743
# Make a backup of package.json and restore it after install
# NOTE: export YARN_REGISTRY as env var when running locally
# YARN_REGISTRY={internalRegistry} yarn add @okta/dockolith@1.6.1 -WD --no-lockfile
cp package.json package.json.bak
yarn add -DW --no-lockfile @okta/dockolith@1.6.1
mv package.json.bak package.json



