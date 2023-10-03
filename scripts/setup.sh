#!/bin/bash
set -eo pipefail

echo "${REGISTRY}"

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION=""

# Install required node version
export REGISTRY_REPO="npm-topic"
export REGISTRY="${ARTIFACTORY_URL}/api/npm/${REGISTRY_REPO}"

function yarn_sync() {
  echo "Checking to see if the yarn.lock file is in sync with given dependencies"
  if test "$( git status --short -- '*yarn.lock' | wc -l )" -ne 0
  then
    return 1
  fi
  echo "yarn sync OK"
  return 0
}

setup_service node-and-yarn "16.19.1" "1.22.19"

cd ${OKTA_HOME}/${REPO}

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

if ! yarn_sync; then
  echo "yarn.lock file is not in sync. Please make sure this file is up-to-date by running 'yarn install' at the repo root and checking in yarn.lock changes"
  exit ${FAILED_SETUP}
fi

# Install upstream artifacts
if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"

  yarn global add @okta/siw-platform-scripts@0.7.0

  if ! siw-platform install-artifact -n @okta/okta-auth-js -v ${AUTHJS_VERSION} ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi

  # Remove any changes to package.json
  git checkout .
  
  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi
