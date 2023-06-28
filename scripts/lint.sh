#!/bin/bash
set -eo pipefail

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="checkstyle"
export TEST_RESULT_FILE_DIR="${REPO}/build2"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

RESTRICTED_URL_SECTION='npm-okta-all\|npm-okta-master'
if grep -q "${RESTRICTED_URL_SECTION}" "${OKTA_HOME}/${REPO}/yarn.lock"; then
  echo "lint failed! yarn.lock contains restricted URL. Exiting..."
  exit 1
fi

# generated code is also linted
if ! yarn codegen; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

if ! yarn lint:report; then
  echo "lint failed! Exiting..."
  # PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL will invoke bacon to parse results and display number of tests
  # and exit with failure, displaying all failed tests in BACON modal.
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit $PUBLISH_TYPE_AND_RESULT_DIR_BUT_SUCCEED_IF_NO_RESULTS;
