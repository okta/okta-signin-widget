#!/bin/bash
set -eo pipefail

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION=""
export INTERNAL_REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-okta-all"
export PUBLIC_REGISTRY="https://registry.yarnpkg.com"

function yarn_sync() {
  echo "Checking to see if the yarn.lock file is in sync with given dependencies"
  if test "$( git status --short -- '*yarn.lock' | wc -l )" -ne 0
  then
    return 1
  fi
  echo "yarn sync OK"
  return 0
}

if ! setup_service node v16.19.1 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

if ! setup_service yarn 1.22.19 &> /dev/null; then
  echo "Failed to install yarn"
  exit ${FAILED_SETUP}
fi

cd ${OKTA_HOME}/${REPO}

npm config set @okta:registry ${PUBLIC_REGISTRY}
npm config set registry ${PUBLIC_REGISTRY}

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

npm config set @okta:registry ${INTERNAL_REGISTRY}

if ! yarn_sync; then
  echo "yarn.lock file is not in sync, see diff below. Please make sure this file is up-to-date by running 'yarn install' at the repo root and checking in yarn.lock changes"
  echo "############## yarn.lock diff starts here ##############"
  git diff *yarn.lock
  echo "############## yarn.lock diff ends here ##############"
  exit ${FAILED_SETUP}
fi

# Install upstream artifacts
if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"

  yarn global add @okta/siw-platform-scripts@0.8.0-g364e6e3

  # if ! siw-platform install-artifact -n @okta/okta-auth-js -v ${AUTHJS_VERSION} ; then
  if ! siw-platform install-downstream @okta/okta-auth-js ${AUTHJS_VERSION} ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi

  # Remove any changes to package.json
  # git checkout .
  
  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi
