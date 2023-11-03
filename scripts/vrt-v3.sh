#!/bin/bash

export TEST_SUITE_TYPE="jsunit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

cd ${OKTA_HOME}/${REPO}

setup_service google-chrome-stable 91.0.4472.77-1

function run_vrt() {
  echo "Starting vrt test suite"

  yarn workspace v3 test:vrt --no-color
}

export CI=true

if ! run_vrt; then
  echo "vrt test failure!"
  report_results FAILURE publish_type_and_result_dir_but_always_fail
  exit 1
fi

echo "vrt test passed!"
report_results SUCCESS publish_type_and_result_dir_but_succeed_if_no_results
