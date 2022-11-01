#!/bin/bash -x

if [ -n "${TEST_SUITE_ID}" ]; then
  ORIGINAL_PATH=$PATH
  source $OKTA_HOME/$REPO/scripts/setup.sh
  export PATH="${PATH}:$(yarn global bin)"
  export TEST_SUITE_TYPE="build"
  export TEST_RESULT_FILE_DIR="${REPO}/test-reports/verify-package"
  echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
  echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE
fi

set -e

# Internal packages to check for potential Dependency Confusion Attack (OKTA-529256)
INETRNAL_PACKAGES=("typingdna" "handlebars-inline-precompile" "okta-i18n-bundles" "duo" "qtip")

# Inject fake packages with same names as ones that are used internally
inject_fake_packages() {
  inject_marker="f@@@@@@ke"
  for pkg in "${INETRNAL_PACKAGES[@]}"
  do
    mkdir -p "node_modules/$pkg"
    package_json=$(cat <<-EOF
      {
        "name": "$pkg",
        "version": "99.0.0",
        "description": "fake $pkg",
        "main": "index.js"
      }
EOF
    )
    index_js=$(cat <<-EOF
      export default function () {
        throw '$inject_marker $pkg';
      };
EOF
    )
    echo "$package_json" > "node_modules/$pkg/package.json"
    echo "$index_js" > "node_modules/$pkg/index.js"
  done
}

# Check that fake packages code does NOT leak in final bundle
check_fake_packages_in_bundle() {
  bundle_file="$1"
  injected_packages=($(cat $bundle_file | sed -n -E "s/.*$inject_marker ([^']+).*/\1/pg"))
  injected_packages_cnt=${#injected_packages[@]}
  if [ $injected_packages_cnt -ne 0 ]; then
    echo "!!! Malicious packages can be injected in the bundle: ${injected_packages[@]}"
    exit ${TEST_FAILURE}
  fi
}

join() { local IFS=$1; shift; echo "$*"; }

# Check that fake packages are NOT present in yarn.lock
check_fake_packages_in_lock() {
  lock_file="yarn.lock"
  names=$(join "|" ${INETRNAL_PACKAGES[@]})
  injected_packages=($(cat $lock_file | sed -n -E "s/.*($names})@.*/\1/pg"))
  injected_packages_cnt=${#injected_packages[@]}
  if [ $injected_packages_cnt -ne 0 ]; then
    echo "!!! Internal package names are found in the lock file: ${injected_packages[@]}"
    exit ${TEST_FAILURE}
  fi
}

# Build
inject_fake_packages
if ! yarn build:release; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi
check_fake_packages_in_bundle "dist/dist/js/okta-sign-in.js"
check_fake_packages_in_lock

if ! yarn lint:cdn; then
  echo "lint failed! Exiting..."
  exit ${TEST_FAILURE}
fi

mkdir -p "test-reports/verify-package"

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

# Set a trap to restore node_modules when script exits
ORIGINAL_PWD="${PWD}"
trap 'restore_node_modules' EXIT
restore_node_modules() {
  echo "Restoring node_modules"
  cd "${ORIGINAL_PWD}"
  mv node_modules2 node_modules
}

if [ -n "${TEST_SUITE_ID}" ]; then
  set +e
  # Verify minimum supported version of node
  export PATH=$ORIGINAL_PATH
  setup_service node v14.18.0

  # Verify minimum supported version of yarn
  # Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
  setup_service yarn 1.7.0 /etc/pki/tls/certs/ca-bundle.crt
  export PATH="${PATH}:$(yarn global bin)"
  set -e
fi

pushd test/package/tsc
if ! (yarn clean && yarn install && yarn test); then
  echo "TSC package verification failed! Exiting..."
  exit ${TEST_FAILURE}
fi
popd

pushd test/package/cjs
inject_fake_packages
if ! (yarn clean && yarn install && yarn test); then
  echo "CommonJS bundle verification failed! Exiting..."
  exit ${TEST_FAILURE}
fi
check_fake_packages_in_bundle "dist/require.js"
check_fake_packages_in_lock
popd

pushd test/package/esm
inject_fake_packages
if ! (yarn clean && yarn install && yarn test); then
  echo "ESM bundle verification failed! Exiting..."
  exit ${TEST_FAILURE}
fi
check_fake_packages_in_bundle "dist/main.js"
check_fake_packages_in_lock
popd
