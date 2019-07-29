#!/bin/bash

setup_service google-chrome-stable 66.0.3359.139-1

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/unit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

if ! yarn test; then
  echo "unit failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit $PUBLISH_TYPE_AND_RESULT_DIR;
