#!/bin/bash
export SAUCE_USERNAME=okta-qa
export SAUCE_ACCESS_KEY="$(aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/saucelabs/saucelabs_access_key /dev/stdout)"
export SAUCE_PLATFORM_NAME="iOS";
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/test_credentials ./test_credentials.yaml

cat ./test_credentials.yaml

pip install yq

export WIDGET_TEST_SERVER=$(cat ./test_credentials.yaml | yq .WIDGET_TEST_SERVER | tr -d '"')
export WIDGET_BASIC_USER=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_USER | tr -d '"')
export WIDGET_BASIC_PASSWORD=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_PASSWORD | tr -d '"')
export WIDGET_BASIC_USER_2=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_USER_2 | tr -d '"')
export WIDGET_BASIC_PASSWORD_2=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_PASSWORD_2 | tr -d '"')
export WIDGET_BASIC_USER_3=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_USER_3 | tr -d '"')
export WIDGET_BASIC_PASSWORD_3=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_PASSWORD_3 | tr -d '"')
export WIDGET_BASIC_USER_4=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_USER_4 | tr -d '"')
export WIDGET_BASIC_PASSWORD_4=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_PASSWORD_4 | tr -d '"')
export WIDGET_BASIC_USER_5=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_USER_5 | tr -d '"')
export WIDGET_BASIC_PASSWORD_5=$(cat ./test_credentials.yaml | yq .WIDGET_BASIC_PASSWORD_5 | tr -d '"')

setup_service google-chrome-stable 66.0.3359.139-1

cd ${OKTA_HOME}/${REPO}

setup_service grunt

# Install required dependencies
npm install -g @okta/ci-update-package
npm install -g @okta/ci-pkginfo

if ! npm install --no-optional --unsafe-perm; then
  echo "npm install failed! Exiting..."
  exit ${FAILED_SETUP}
fi


if ! npm run test:e2e; then
  echo "e2e tests on iOS failed! Exiting..."
  exit ${FAILURE}
fi

exit ${SUCCESS}
