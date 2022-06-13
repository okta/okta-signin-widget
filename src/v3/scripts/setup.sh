#!/bin/bash

export REGISTRY_REPO="npm-topic"
export REGISTRY="${ARTIFACTORY_URL}/api/npm/${REGISTRY_REPO}"

# install node
setup_service node "v14.19.0"

# install yarn, note: use the cacert bundled with centos as okta root ca is
# self-signed and cause issues downloading from yarn
setup_service yarn "1.22.17" "/etc/pki/tls/certs/ca-bundle.crt"

# nav to project
pushd "${OKTA_HOME}/${REPO}"

# install dependencies
if ! yarn install ; then
  echo "failed: yarn install"
  exit ${FAILED_SETUP}
fi

# nav out
popd
