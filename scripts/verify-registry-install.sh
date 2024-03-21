#!/bin/bash

# NOTE: MUST BE RAN *AFTER* THE PUBLISH SUITE

export PUBLISH_REGISTRY="${ARTIFACTORY_URL}/npm-topic"

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
artifact_version="$(ci-pkginfo -t pkgname)-$(ci-pkginfo -t pkgsemver)"
published_tarball=${PUBLISH_REGISTRY}/@okta/okta-signin-widget/-/${artifact_version}.tgz

# clone angular sample, using angular sample because angular toolchain is *very* opinionated about modules
git clone --depth 1 https://github.com/okta/samples-js-angular.git test/package/angular-sample
pushd test/package/angular-sample/custom-login

# use npm instead of yarn to test as a community dev
if ! npm i; then
  echo "install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# install the version of @okta/okta-signin-widget from artifactory that was published during the `publish` suite
if ! npm i ${published_tarball}; then
  echo "install ${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# install the specific version of auth-js the widget depends on within the sample to prevent potential type errors
auth_js_version=$(cat node_modules/@okta/okta-signin-widget/package.json | jq -r ".dependencies[\"@okta/okta-auth-js\"]")
if ! npm i @okta/okta-auth-js@${auth_js_version}; then
  echo "install @okta/okta-auth-js@${auth_js_version} failed! Exiting..."
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
