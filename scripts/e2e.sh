#!/bin/bash
export CI=true

source $OKTA_HOME/$REPO/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 103.0.5060.53-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

# This file contains all the env vars we need for e2e tests
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/export-test-credentials.sh $OKTA_HOME/$REPO/scripts/export-test-credentials.sh
source $OKTA_HOME/$REPO/scripts/export-test-credentials.sh

# We use the below OIE enabled org and clients for OIE tests
export WIDGET_TEST_SERVER=https://oie-signin-widget.okta.com
export WIDGET_SPA_CLIENT_ID=0oa8lrg7ojTsbJgRQ696
export WIDGET_WEB_CLIENT_ID=0oa8ls36zUZj7oFJ2696

export ORG_OIE_ENABLED=true

# Build
if ! yarn build:release; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

# Run spec tests
if ! yarn test:e2e; then
  echo "e2e spec tests failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

# Run feature tests
export RUN_FEATURE_TESTS=true
get_vault_secret_key devex/auth-js-sdk-vars a18n_api_key A18N_API_KEY
get_vault_secret_key devex/okta-signin-widget test_org_okta_api_key OKTA_CLIENT_TOKEN

if ! yarn test:e2e; then
  echo "e2e feature tests failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
