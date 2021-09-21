#!/bin/bash
export SAUCE_USERNAME=OktaSignInWidget
get_vault_secret_key devex/sauce-labs accessKey SAUCE_ACCESS_KEY
export TRAVIS=true # work-around to run tests on saucelabs instead of chrome
export TRAVIS_JOB_NUMBER=${TEST_SUITE_ID}
export TRAVIS_BUILD_NUMBER=${TEST_SUITE_RESULT_ID}

cd ${OKTA_HOME}/${REPO}
source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

sh ./scripts/start-sauce-connect.sh

# This file contains all the env vars we need for e2e tests
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/export-test-credentials.sh $OKTA_HOME/$REPO/scripts/export-test-credentials.sh
source $OKTA_HOME/$REPO/scripts/export-test-credentials.sh

if ! yarn test:e2e; then
  echo "e2e tests on ${SAUCE_PLATFORM_NAME} failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
