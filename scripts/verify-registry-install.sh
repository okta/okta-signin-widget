#!/bin/bash

# NOTE: MUST BE RAN *AFTER* THE PUBLISH SUITE

cd ${OKTA_HOME}/${REPO}

# Install required node version
setup_service node v14.18.2
setup_service yarn 1.22.19

# Install required dependencies
yarn global add @okta/ci-append-sha
yarn global add @okta/ci-pkginfo

export PATH="${PATH}:$(yarn global bin)"
export TEST_SUITE_TYPE="build"

# Append a SHA to the version in package.json
if ! ci-append-sha; then
  echo "ci-append-sha failed! Exiting..."
  exit $FAILED_SETUP
fi

# NOTE: hyphen rather than '@'
artifact_version="$(ci-pkginfo -t pkgsemver)"

# clone angular sample, using angular sample because angular toolchain is *very* opinionated about modules
git clone --depth 1 https://github.com/okta/samples-js-angular.git test/package/angular-sample
pushd test/package/angular-sample/custom-login

yarn add -W --force --no-lockfile @okta/siw-platform-scripts@0.8.0

# use npm instead of yarn to test as a community dev
if ! npm i; then
  echo "install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# install the version of @okta/okta-signin-widget from artifactory that was published during the `publish` suite
if ! yarn run siw-platform install-artifact -n @okta/okta-signin-widget -v ${artifact_version}; then
  echo "install @okta/okta-signin-widget@${artifact_version} failed! Exiting..."
  exit ${FAILED_SETUP}
fi

export ISSUER="https://oie-signin-widget.okta.com"
export CLIENT_ID="0oa8lrg7ojTsbJgRQ696"

# Run build to verify siw installation
if ! npm run build; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

popd
exit $SUCCESS
