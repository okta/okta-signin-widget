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

yarn add -W --force --no-lockfile @okta/siw-platform-scripts@0.5.0

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Install upstream artifacts
if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"

  if ! yarn run siw-platform install-artifact -n @okta/okta-auth-js -v ${AUTHJS_VERSION} ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi

  # Remove any changes to package.json
  git checkout .
  
  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi
