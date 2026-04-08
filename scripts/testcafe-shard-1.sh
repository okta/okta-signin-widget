#!/bin/bash
export CHROME_HEADLESS=true
setup_service google-chrome-stable 121.0.6167.85-1

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

export SHARD_INDEX=1
export SHARD_TOTAL=3

echo "starting testcafe tests (shard ${SHARD_INDEX}/${SHARD_TOTAL})"
if ! yarn test:testcafe-ci; then
  echo "testcafe tests (shard ${SHARD_INDEX}) failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
