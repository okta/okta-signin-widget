#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/src/v3/build2/reports/vrt"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

setup_service google-chrome-stable 121.0.6167.85-1

echo 'Starting vrt get base screenshots suite'
if ! yarn workspace v3 test:vrt-update-screenshots --no-color; then
	echo "vrt get base screenshots failed! Exiting..."
	exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
