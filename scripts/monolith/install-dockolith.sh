#!/bin/bash

if [[ -z ${DOCKOLITH_VERSION} ]]; then
  # export DOCKOLITH_VERSION=1.6.1
  export DOCKOLITH_VERSION=1.9.0-gd8bf663
fi


# only install if not triggered by upstream build
if [[ -z ${DOCKOLITH_DOWNSTREAM} ]]; then
  setup_service dockolith $DOCKOLITH_VERSION
  # export DOCKOLITH_HOME="$(yarn global dir)/node_modules/@okta/dockolith"
fi

# pushd $(yarn global dir)/node_modules/@okta/dockolith > /dev/null
#   yarn link
# popd > /dev/null

# pushd ${OKTA_HOME}/${REPO} > /dev/null
#   yarn link @okta/dockolith
# popd > /dev/null

dockolith --version
dockolith bootstrap ${OKTA_HOME}/${REPO}
export DOCKOLITH_HOME=$(dockolith home)
