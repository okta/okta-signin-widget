#!/bin/bash

# NOTE: MUST BE RAN *AFTER* THE PUBLISH SUITE

# Install required node version
export REGISTRY="https://artifacts.aue1d.saasure.com/artifactory/npm-topic"

cd ${OKTA_HOME}/${REPO}

setup_service node v14.19.0
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

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

# clone angular sample, using angular sample because angular toolchain is *very* opinionated about modules
git clone --depth 1 https://github.com/okta/samples-js-angular.git test/package/angular-sample
pushd test/package/angular-sample/custom-login

# NOTE: setup_service sets the registry to internal mirror, add certs to chain
export NODE_EXTRA_CA_CERTS="/etc/pki/tls/certs/ca-bundle.crt"

# use npm instead of yarn to test as a community dev
if ! npm i; then
  echo "install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# install the version of @okta/okta-signin-widget from artifactory that was published during the `publish` suite
published_tarball=${REGISTRY}/@okta/okta-signin-widget/-/${artifact_version}.tgz
if ! npm i ${published_tarball}; then
  echo "install ${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# use the same version of auth-js as the widget, otherwise you'll get type errors
auth_js_version=$(jq -r '.dependencies."@okta/okta-auth-js" node_modules/@okta/okta-signin-widget/package.json')
if ! npm i @okta/okta-auth-js@${auth_js_version}; then
  echo "install auth-js@${auth_js_version} failed! Exiting..."
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
