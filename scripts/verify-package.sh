#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

export PATH="${PATH}:$(yarn global bin)"
export TEST_SUITE_TYPE="build"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/verify-package"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

# Build
if ! yarn build:release; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

mkdir -p test-reports/verify-package

pushd dist
npm pack --dry-run --json > ../test-reports/verify-package/pack-report.json
popd

if ! node ./scripts/buildtools verify-package 2> ./test-reports/verify-package/error.log
then
  value=`cat ./test-reports/verify-package/error.log`
  log_custom_message "Verification Failed" "${value}"
  echo "verification failed! Exiting..."
  exit ${TEST_FAILURE}
fi

# Validate the dist package dependencies

# Move node_modules out of the way so that we devDependencies don't cause false positives
mv node_modules node_modules2

# Verify minimum supported version of node

EXPECTED_NODE_VERSION=12.22.0

function install_node() {
    nvm install ${EXPECTED_NODE_VERSION}
    nvm use ${EXPECTED_NODE_VERSION}
    nvm unalias default
    nvm alias "default" "${EXPECTED_NODE_VERSION}"
    npm config set prefix=/root/.nvm/versions/node/v${EXPECTED_NODE_VERSION}/bin
    export PATH=$(echo ${PATH} | sed "s/node\/v[[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+\/bin/node\/v${EXPECTED_NODE_VERSION}\/bin/")

  node -v
    if [[ "$(node -v)" != "v${EXPECTED_NODE_VERSION}" ]]; then
        return 1
    else
        return 0
    fi
}

if ! install_node; then
  echo "setup_service returned non-zero exit code";
  node --version
fi

# Verify minimum supported version of yarn
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.7.0 /etc/pki/tls/certs/ca-bundle.crt

pushd test/package/tsc
if ! (yarn && yarn test); then
  echo "TSC package verification failed! Exiting..."
  exit ${TEST_FAILURE}
fi
popd

pushd test/package/cjs
if ! (yarn && yarn test); then
  echo "CommonJS bundle verification failed! Exiting..."
  exit ${TEST_FAILURE}
fi
popd

pushd test/package/esm
if ! (yarn && yarn test); then
  echo "ESM bundle verification failed! Exiting..."
  exit ${TEST_FAILURE}
fi
popd

exit $SUCCESS
