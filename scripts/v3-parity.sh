#!/bin/bash
export CHROME_HEADLESS=true
setup_service google-chrome-stable 83.0.4103.61-1

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

# TODO target specs enabled in v3
# ENABLED_TESTS=$(cat <<-END
# test/testcafe/spec/IdentifyWithPassword_spec.js
# test/testcafe/spec/Identify_spec.js
# END
# )

if ! yarn test:parity-ci; then
	echo "testcafe tests failed! Exiting..."
	exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
