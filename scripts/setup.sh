#!/bin/bash

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION=""

# Install required node version
export REGISTRY_REPO="npm-topic"
export REGISTRY="${ARTIFACTORY_URL}/api/npm/${REGISTRY_REPO}"
setup_service node v12.22.12
# NOTE: Using yarn@1.18 to avoid error: "expected workspace package to exist..."
# https://github.com/yarnpkg/yarn/issues/7807. Yarn version locked to 1.18 using
# "yarn policies set-version 1.18.0". Use the cacert bundled with centos as okta
# root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.18.0 /etc/pki/tls/certs/ca-bundle.crt

cd ${OKTA_HOME}/${REPO}

if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"
  npm config set strict-ssl false

  if ! yarn add -DW --no-lockfile https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-auth-js/-/@okta/okta-auth-js-${AUTHJS_VERSION}.tgz ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi

  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
