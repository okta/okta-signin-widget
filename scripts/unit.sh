#!/bin/bash
export SAUCE_USERNAME=okta-qa
export SAUCE_ACCESS_KEY="$(aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/saucelabs/saucelabs_access_key /dev/stdout)"
export SAUCE_PLATFORM_NAME="iOS";
export TRAVIS=true # work-around to run tests on saucelabs instead of chrome
export TRAVIS_JOB_NUMBER=${TEST_SUITE_ID}
export TRAVIS_BUILD_NUMBER=${TEST_SUITE_RESULT_ID}
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/test_credentials ./test_credentials.yaml

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

cd ${OKTA_HOME}/${REPO}

setup_service grunt

# Install required dependencies
npm install -g @okta/ci-update-package
npm install -g @okta/ci-pkginfo

if ! npm install --no-optional --unsafe-perm; then
  echo "npm install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

function update_yarn_locks() {
    git checkout -- test/e2e/react-app/yarn.lock
    git checkout -- test/e2e/angular-app/yarn.lock

    YARN_REGISTRY=https://registry.yarnpkg.com
    OKTA_REGISTRY=${ARTIFACTORY_URL}/api/npm/npm-okta-master

    # Yarn does not utilize the npmrc/yarnrc registry configuration
    # if a lockfile is present. This results in `yarn install` problems
    # for private registries. Until yarn@2.0.0 is released, this is our current
    # workaround.
    #
    # Related issues:
    #  - https://github.com/yarnpkg/yarn/issues/5892
    #  - https://github.com/yarnpkg/yarn/issues/3330

    # Replace yarn artifactory with Okta's
    sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" test/e2e/react-app/yarn.lock
    sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" test/e2e/angular-app/yarn.lock
}

update_yarn_locks

if ! npm run test:e2e; then
  echo "e2e tests on iOS failed! Exiting..."
  exit ${FAILURE}
fi

exit ${SUCCESS}
