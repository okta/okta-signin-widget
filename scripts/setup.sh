#!/bin/bash
set -eo pipefail

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION="7.5.0-ga22be58"
export INTERNAL_REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-okta-release"
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

if [ -z "$AUTHJS_VERSION" ]; then
  if ! yarn_sync; then
    echo "yarn.lock file is not in sync, see diff below. Please make sure this file is up-to-date by running 'yarn install' at the repo root and checking in yarn.lock changes"
    echo "############## yarn.lock diff starts here ##############"
    git diff *yarn.lock
    echo "############## yarn.lock diff ends here ##############"
    exit ${FAILED_SETUP}
  fi
fi

# Install upstream artifacts
if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"

  yarn global add @okta/siw-platform-scripts@0.7.0

  mv -f ./node_modules/@okta/okta-auth-js ./okta-auth-js-orig
  rm -rf ./src/v3/node_modules/@okta/okta-auth-js

  authjs_semver_g2=$(cat ./package.json | jq '.dependencies["@okta/okta-auth-js"]')
  json=$(cat ./package.json | jq 'del(.dependencies["@okta/okta-auth-js"])')
  printf '%s\n' "${json}" > ./package.json
  json=$(cat ./src/v3/package.json | jq 'del(.dependencies["@okta/okta-auth-js"])')
  printf '%s\n' "${json}" > ./src/v3/package.json

  if ! siw-platform install-artifact -n @okta/okta-auth-js -v ${AUTHJS_VERSION} ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi

  json=$(cat ./src/v3/package.json | jq --arg ver $AUTHJS_VERSION '.dependencies["@okta/okta-auth-js"] = $ver')
  printf '%s\n' "${json}" > ./src/v3/package.json
  json=$(cat ./package.json | jq --arg ver $authjs_semver_g2 '.dependencies["@okta/okta-auth-js"] = $ver')
  printf '%s\n' "${json}" > ./package.json

  mv -f ./node_modules/@okta/okta-auth-js ./src/v3/node_modules/@okta/okta-auth-js
  mv -f ./okta-auth-js-orig ./node_modules/@okta/okta-auth-js

  authjs_ver_g2=$(cat ./node_modules/@okta/okta-auth-js/package.json | jq '.version')
  authjs_ver_g3=$(cat ./src/v3/node_modules/@okta/okta-auth-js/package.json | jq '.version')
  echo "okta-auth-js versions used: ${authjs_ver_g2} for gen 2, ${authjs_ver_g3} for gen 3"


  # Remove any changes to package.json
  git checkout .
  
  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi
