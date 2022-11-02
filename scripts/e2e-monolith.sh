#!/bin/bash -x

# Monolith version to test against
export MONOLITH_BUILDVERSION="2022.11.0-begin-326-g56172e11cdd9"

export LOCAL_MONOLITH=true
export CI=true
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE
export ORG_OIE_ENABLED=true

set +e
source $OKTA_HOME/$REPO/scripts/setup.sh
set -e
cd $OKTA_HOME/$REPO

# Start monolith
create_log_group "Start Monolith"
source ./scripts/monolith/install-dockolith.sh
source ./scripts/monolith/start.sh
finish_log_group $?

# Create test org and save environment variables in "testenv"
create_log_group "Create Test Org"
# Add widget test host to /etc/hosts
export TEST_ORG_SUBDOMAIN="siw-test-1"
echo "${DOCKER_HOST_CONTAINER_IP} ${TEST_ORG_SUBDOMAIN}.okta1.com" >> /etc/hosts
cat /etc/hosts
source ./scripts/monolith/create-testenv.sh
export ORG_OIE_ENABLED=true
finish_log_group $?

# Build Widget
create_log_group "Build Widget"
if ! yarn build:release; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi
finish_log_group $?

# Setup E2E environment
create_log_group "E2E Setup"
set +e
setup_service google-chrome-stable 89.0.4389.72-1
set -e
finish_log_group $?

# Feature tests are disabled - need to fix issue with email/a18n OKTA-533922
# Run feature tests
export RUN_FEATURE_TESTS=true
create_log_group "Feature E2E"
#get_vault_secret_key devex/auth-js-sdk-vars a18n_api_key A18N_API_KEY
if ! yarn test:e2e; then
  echo "e2e feature tests failed! Exiting..."
  move_logs_tmp_api
  log_extra_dir_as_zip ${TMP_LOGS_LOCATION} run_logs.zip
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
finish_log_group $?
export RUN_FEATURE_TESTS=""

# Run spec tests on OIE
create_log_group "Spec E2E OIE"
if ! yarn test:e2e; then
  echo "e2e spec tests failed! Exiting..."
  
  move_logs_tmp_api
  log_extra_dir_as_zip ${TMP_LOGS_LOCATION} run_logs.zip

  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
finish_log_group $?

# We are not currently running OIDC tests against classic backend
# Run spec tests on Classic
# create_log_group "Spec E2E Classic"
# # Disable OIE
# source ./scripts/monolith/disable-oie.sh
# export ORG_OIE_ENABLED=""
# # Run spec tests
# if ! yarn test:e2e; then
#   echo "e2e spec tests failed! Exiting..."
#   exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
# fi
# finish_log_group $?

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
