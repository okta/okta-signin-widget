#!/bin/bash -x

# Run multiple cleanup commands on trap exit
cleanup_command=""
cleanup() {
  eval "$cleanup_command"
}
trap cleanup EXIT

add_cleanup_command() {
  if [[ -z "$cleanup_command" ]]; then
    cleanup_command="$1"
  else
    cleanup_command="$cleanup_command; $1"
  fi
}

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
INTERNAL_PACKAGES_TO_FAKE=("@okta/typingdna" "@okta/handlebars-inline-precompile" "@okta/okta-i18n-bundles" "@okta/duo" "@okta/qtip")
INTERNAL_PACKAGES=(${INTERNAL_PACKAGES_TO_FAKE[@]} "@okta/courage")
inject_marker="f@@@@@@ke"

# Inject fake packages with same names as ones that are used internally
inject_fake_packages() {
  add_cleanup_command "remove_fake_packages '$(pwd)'"
  echo "Injecting fake packages to $(pwd)"
  for pkg in "${INTERNAL_PACKAGES_TO_FAKE[@]}"
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

# Revert injection of fake packages
remove_fake_packages() {
  echo "Removing fake packages in $1"
  cd "$1"
  for pkg in "${INTERNAL_PACKAGES_TO_FAKE[@]}"
  do
    rm -rf "node_modules/$pkg"
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

join_for_regex() { local IFS="|"; shift; echo "$*" | sed 's/\//\\\//g'; }

# Check that fake packages are NOT present in yarn.lock
check_fake_packages_in_lock() {
  lock_file="yarn.lock"
  names=$(join_for_regex ${INTERNAL_PACKAGES[@]})
  injected_packages=($(cat $lock_file | sed -n -E "s/.*($names)@.*/\1/pg"))
  injected_packages_cnt=${#injected_packages[@]}
  if [ $injected_packages_cnt -ne 0 ]; then
    echo "!!! Internal package names are found in the lock file: ${injected_packages[@]}"
    exit ${TEST_FAILURE}
  fi
}

check_okta_courage() {
  courage_link=$(readlink ./node_modules/@okta/courage)
  expected_src="../../packages/@okta/courage-dist"
  if [ "$courage_link" != "$expected_src" ]; then
    echo "!!! Okta courage links to $courage_link but expected $expected_src"
  fi
}

# Build
inject_fake_packages
check_okta_courage
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

# Must switch the node version back to v14.18.2 due to bug in v16 see https://github.com/npm/cli/pull/5894
if ! setup_service node v14.18.2 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

# ensure registry is configured after node verison is changed
npm config set @okta:registry ${PUBLIC_REGISTRY}
npm config set registry ${PUBLIC_REGISTRY}

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
add_cleanup_command 'restore_node_modules'
restore_node_modules() {
  echo "Restoring node_modules"
  cd "${ORIGINAL_PWD}"
  mv node_modules2 node_modules
}

if [ -n "${TEST_SUITE_ID}" ]; then
  set +e
  # Verify minimum supported version of node
  export PATH=$ORIGINAL_PATH
  setup_service node v14.18.2

  # Verify minimum supported version of yarn
  setup_service yarn 1.22.19
  export PATH="${PATH}:$(yarn global bin)"

  # ensure registry is configured after node verison is changed
  npm config set @okta:registry ${PUBLIC_REGISTRY}
  npm config set registry ${PUBLIC_REGISTRY}

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
