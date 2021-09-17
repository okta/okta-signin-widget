#!/bin/bash
export SAUCE_USERNAME=OktaSignInWidget
get_vault_secret_key devex/sauce-labs accessKey SAUCE_ACCESS_KEY
export TRAVIS_JOB_NUMBER=123 # A random number to start sauce tunnel
export TRAVIS_BUILD_NUMBER=123
export TRAVIS=true # to make sure right version of sauce tunnel is installed in start-sauce-connect.sh

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

# This file contains all the env vars we need for e2e tests
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/export-test-credentials.sh $OKTA_HOME/$REPO/scripts/export-test-credentials.sh
source $OKTA_HOME/$REPO/scripts/export-test-credentials.sh

sh ./scripts/start-sauce-connect.sh

if ! yarn test:e2e:windows; then
  echo "e2e windows saucelabs tests failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
