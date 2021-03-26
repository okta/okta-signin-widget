#!/bin/bash
export SAUCE_USERNAME=OktaSignInWidget
export SAUCE_ACCESS_KEY="$(aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/signinwidget/sauce_access_key /dev/stdout)"
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

function update_yarn_locks() {
    git checkout -- test/e2e/react-app/yarn.lock

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
}

update_yarn_locks

if ! yarn test:e2e; then
  echo "e2e tests on ${SAUCE_PLATFORM_NAME} failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
