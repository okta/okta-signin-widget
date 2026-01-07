#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/src/v3/build2/reports/integration"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

# Configure jest-junit to output to integration directory
export JEST_JUNIT_OUTPUT_DIR="${REPO}/src/v3/build2/reports/integration"
export JEST_JUNIT_OUTPUT_NAME="okta-sign-in-widget-jest-junit-result.xml"

if ! yarn workspace v3 test:integration --no-colors; then
  echo "v3 integration tests failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit $PUBLISH_TYPE_AND_RESULT_DIR;
