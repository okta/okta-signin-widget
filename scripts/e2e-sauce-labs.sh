#!/bin/bash
export SAUCE_USERNAME=OktaSignInWidget
export SAUCE_ACCESS_KEY="$(aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/sauce_access_key /dev/stdout)"
export TRAVIS=true # work-around to run tests on saucelabs instead of chrome
export TRAVIS_JOB_NUMBER=${TEST_SUITE_ID}
export TRAVIS_BUILD_NUMBER=${TEST_SUITE_RESULT_ID}
export SAUCE_CONNECT_VERSION=sc-4.5.3-linux
export SAUCE_CONNECT_BINARY=${SAUCE_CONNECT_VERSION}.tar.gz

cd ${OKTA_HOME}/${REPO}

# Download and start sauce connect
curl -o ${OKTA_HOME}/${REPO}/${SAUCE_CONNECT_BINARY} https://saucelabs.com/downloads/${SAUCE_CONNECT_BINARY}
tar -xzf ${OKTA_HOME}/${REPO}/${SAUCE_CONNECT_BINARY}
${OKTA_HOME}/${REPO}/${SAUCE_CONNECT_VERSION}/bin/sc -u ${SAUCE_USERNAME} -k ${SAUCE_ACCESS_KEY} -i ${TRAVIS_JOB_NUMBER} &

aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/test_credentials ./test_credentials.yaml

pip install yq

WIDGET_ENV_VARS=(WIDGET_TEST_SERVER WIDGET_BASIC_USER WIDGET_BASIC_PASSWORD WIDGET_BASIC_USER_2 WIDGET_BASIC_PASSWORD_2 WIDGET_BASIC_USER_3 WIDGET_BASIC_PASSWORD_3 WIDGET_BASIC_USER_4 WIDGET_BASIC_PASSWORD_4 WIDGET_BASIC_USER_5 WIDGET_BASIC_PASSWORD_5 WIDGET_FB_USER WIDGET_FB_PASSWORD WIDGET_FB_USER_2 WIDGET_FB_PASSWORD_2 WIDGET_FB_USER_3 WIDGET_FB_PASSWORD_3)

for WIDGET_ENV_VAR in "${WIDGET_ENV_VARS[@]}"
do
   export $WIDGET_ENV_VAR=$(cat ./test_credentials.yaml | yq .${WIDGET_ENV_VAR} | tr -d '"')
done

source $OKTA_HOME/$REPO/scripts/setup.sh

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

if ! yarn test:e2e; then
  echo "e2e tests on ${SAUCE_PLATFORM_NAME} failed! Exiting..."
  exit ${FAILURE}
fi

exit ${SUCCESS}
