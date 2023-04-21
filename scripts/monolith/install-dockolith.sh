#!/bin/bash -xe

if [[ -z ${DOCKOLITH_VERSION} ]]; then
  export DOCKOLITH_VERSION=1.6.1
fi


# only install if not triggered by upstream build
if [[ -z ${DOCKOLITH_DOWNSTREAM} ]]; then
  # Yarn "add" always modifies package.json https://github.com/yarnpkg/yarn/issues/1743
  # Make a backup of package.json and restore it after install
  # NOTE: export YARN_REGISTRY as env var when running locally
  # YARN_REGISTRY={internalRegistry} yarn add @okta/dockolith@1.6.1 -WD --no-lockfile
  # cp package.json package.json.bak
  # yarn add -DW --no-lockfile @okta/dockolith@$DOCKOLITH_VERSION
  # mv package.json.bak package.json

  setup_service dockolith $DOCKOLITH_VERSION
  export DOCKOLITH_HOME="$(yarn global dir)/node_modules/@okta/dockolith"
fi

pushd ${OKTA_HOME}/${REPO} > /dev/null
  yarn link dockolith
popd > /dev/null
