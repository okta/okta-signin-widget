#!/bin/bash
export SAUCE_USERNAME=OktaSignInWidget
export SAUCE_ACCESS_KEY="$(aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/sauce_access_key /dev/stdout)"
export TRAVIS_JOB_NUMBER=123 # A random number to start sauce tunnel
export TRAVIS_BUILD_NUMBER=123
export TRAVIS=true # to make sure right version of sauce tunnel is installed in start-sauce-connect.sh

source $OKTA_HOME/$REPO/scripts/setup.sh

# This file contains all the env vars we need for e2e tests
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/export-test-credentials.sh $OKTA_HOME/$REPO/scripts/export-test-credentials.sh
source $OKTA_HOME/$REPO/scripts/export-test-credentials.sh

sh ./scripts/start-sauce-connect.sh

if ! yarn test:e2e:windows; then
  echo "e2e windows saucelabs tests failed! Exiting..."
  exit ${FAILURE}
fi

exit ${SUCCESS};
