#!/bin/bash
export CHROME_HEADLESS=true
setup_service google-chrome-stable 121.0.6167.85-1

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

echo 'starting testcafe v2->v3 parity tests for mobile devices'
if ! yarn test:parity-ci-mobile --no-color; then
	echo "testcafe v2->v3 parity tests for mobile devices failed! Exiting..."
	exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
