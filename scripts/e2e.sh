#!/bin/bash
export SAUCE_USERNAME=okta-qa
export SAUCE_ACCESS_KEY="$(aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/saucelabs/saucelabs_access_key /dev/stdout)"
export SAUCE_PLATFORM_NAME="iOS";

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
