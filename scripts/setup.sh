#!/bin/bash
set -eo pipefail

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION=""

# Install required node version
export REGISTRY_REPO="npm-topic"
export REGISTRY="${ARTIFACTORY_URL}/api/npm/${REGISTRY_REPO}"

if ! setup_service node v14.18.2 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
if ! setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt &> /dev/null; then
  echo "Failed to install yarn"
  exit ${FAILED_SETUP}
fi

cd ${OKTA_HOME}/${REPO}

if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"
  npm config set strict-ssl false

  if ! yarn add -W --force --no-lockfile https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-auth-js/-/@okta/okta-auth-js-${AUTHJS_VERSION}.tgz ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi
  
  MATCH="$(yarn why @okta/okta-auth-js | grep ${AUTHJS_VERSION})"
  echo ${MATCH}
  if [ -z "$MATCH" ]; then
    echo "AUTHJS_VERSION was not installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi
  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
