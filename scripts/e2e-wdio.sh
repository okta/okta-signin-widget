#!/bin/bash
export CI=true

source $OKTA_HOME/$REPO/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

# This file contains all the env vars we need for e2e tests
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/export-test-credentials.sh $OKTA_HOME/$REPO/scripts/export-test-credentials.sh
source $OKTA_HOME/$REPO/scripts/export-test-credentials.sh

# We use the below OIE enabled org and clients for OIE tests
export WIDGET_TEST_SERVER=https://oie-widget-tests.sigmanetcorp.us
export WIDGET_SPA_CLIENT_ID=0oa3mtlnedKzXMeto0g7
export WIDGET_WEB_CLIENT_ID=0oa3mvgsvrEdck9GO0g7

export ORG_OIE_ENABLED=true

if ! yarn test:e2e:wdio; then
  echo "e2e wdio tests failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
