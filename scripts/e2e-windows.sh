#!/bin/bash
export SAUCE_USERNAME=OktaSignInWidget
export SAUCE_ACCESS_KEY="$(aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/sauce_access_key /dev/stdout)"
export TRAVIS_JOB_NUMBER=123 # A random number to start sauce tunnel
export TRAVIS_BUILD_NUMBER=123
export TRAVIS=true # to make sure right version of sauce tunnel is installed in start-sauce-connect.sh

source $OKTA_HOME/$REPO/scripts/setup.sh

aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/test_credentials ./test_credentials.yaml
pip install yq

WIDGET_ENV_VARS=(WIDGET_TEST_SERVER WIDGET_BASIC_USER WIDGET_BASIC_PASSWORD WIDGET_BASIC_USER_2 WIDGET_BASIC_PASSWORD_2 WIDGET_BASIC_USER_3 WIDGET_BASIC_PASSWORD_3 WIDGET_BASIC_USER_4 WIDGET_BASIC_PASSWORD_4 WIDGET_BASIC_USER_5 WIDGET_BASIC_PASSWORD_5 WIDGET_FB_USER WIDGET_FB_PASSWORD WIDGET_FB_USER_2 WIDGET_FB_PASSWORD_2 WIDGET_FB_USER_3 WIDGET_FB_PASSWORD_3)

for WIDGET_ENV_VAR in "${WIDGET_ENV_VARS[@]}"
do
   export $WIDGET_ENV_VAR=$(cat ./test_credentials.yaml | yq .${WIDGET_ENV_VAR} | tr -d '"')
done

sh ./scripts/start-sauce-connect.sh

if ! yarn test:e2e:windows; then
  echo "e2e windows saucelabs tests failed! Exiting..."
  exit ${FAILURE}
fi

exit ${SUCCESS};
