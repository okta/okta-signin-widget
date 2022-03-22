#!/bin/bash

# Install required node version
export REGISTRY_REPO="npm-topic"
export REGISTRY="${ARTIFACTORY_URL}/api/npm/${REGISTRY_REPO}"
setup_service node v12.13.0
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

cd ${OKTA_HOME}/${REPO}

# DO NOT MERGE - BETA VERSION - DO NOT MERGE
echo "Installing BETA VERSION"

npm config set strict-ssl false

yarn add -DW --no-lockfile https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-auth-js/-/@okta/okta-auth-js-6.3.0-g0a8d702.tgz

echo "BETA VERSION installed"
# End BETA VERSION

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
