#!/bin/bash

export TEST_SUITE_TYPE="jsunit"
export TEST_RESULT_FILE_DIR=${REPO}/src/v3/build2/reports/e2e
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

cd ${OKTA_HOME}/${REPO}

setup_service google-chrome-stable 91.0.4472.77-1

function run_e2e() {
  echo "Starting e2e test suite"

  yarn workspace v3 test:e2e
}

export CI=true

if ! run_e2e; then
  echo "e2e test failure!"
  report_results FAILURE publish_type_and_result_dir_but_always_fail
  exit 1
fi

echo "e2e test passed!"
report_results SUCCESS publish_type_and_result_dir_but_succeed_if_no_results