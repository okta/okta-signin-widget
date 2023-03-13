#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh "v16.16.0"

export SAUCE_USERNAME=vijetmahabaleshwar-okta
get_vault_secret_key devex/sauce-labs prodAccessKey SAUCE_ACCESS_KEY

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

yarn saucectl configure -u $SAUCE_USERNAME -a $SAUCE_ACCESS_KEY

if ! yarn test:testcafe-saucelabs-ci; then
  echo "testcafe tests failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
