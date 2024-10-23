#!/bin/bash
set -eo pipefail
export CI=true

source $OKTA_HOME/$REPO/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1
setup_service xvfb start 1366x768x16

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

get_terminus_secret "/" WIDGET_BASIC_USER WIDGET_BASIC_USER
get_terminus_secret "/" WIDGET_BASIC_PASSWORD WIDGET_BASIC_PASSWORD
get_terminus_secret "/" WIDGET_BASIC_USER_2 WIDGET_BASIC_USER_2
get_terminus_secret "/" WIDGET_BASIC_PASSWORD_2 WIDGET_BASIC_PASSWORD_2
get_terminus_secret "/" WIDGET_BASIC_USER_3 WIDGET_BASIC_USER_3
get_terminus_secret "/" WIDGET_BASIC_PASSWORD_3 WIDGET_BASIC_PASSWORD_3
get_terminus_secret "/" WIDGET_BASIC_USER_4 WIDGET_BASIC_USER_4
get_terminus_secret "/" WIDGET_BASIC_PASSWORD_4 WIDGET_BASIC_PASSWORD_4
get_terminus_secret "/" WIDGET_BASIC_USER_5 WIDGET_BASIC_USER_5
get_terminus_secret "/" WIDGET_BASIC_PASSWORD_5 WIDGET_BASIC_PASSWORD_5

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

if ! setup_service node v14.18.2 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

# Run spec tests
export USE_MIN=1
if ! yarn test:e2e:lang; then
  echo "e2e spec tests failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
