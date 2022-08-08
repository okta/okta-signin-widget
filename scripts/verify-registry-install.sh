#!/bin/bash

# NOTE: MUST BE RAN *AFTER* THE PUBLISH SUITE

# Install required node version
export REGISTRY="https://artifacts.aue1d.saasure.com/artifactory/npm-topic"

cd ${OKTA_HOME}/${REPO}

setup_service node v12.22.12
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
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
git clone --branch jp-OKTA-516464 https://github.com/okta/samples-js-angular.git test/package/angular-sample
pushd test/package/angular-sample/custom-login

# sample is setup to use npm
if ! npm install; then
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
auth_js_version=$(cat node_modules/@okta/okta-signin-widget/package.json | jq -r '.dependencies."@okta/okta-auth-js"')
if ! npm i @okta/okta-auth-js@${auth_js_version}; then
  echo "install auth-js@${auth_js_version} failed! Exiting..."
  exit ${FAILED_SETUP}
fi

ISSUER=https://oie-signin-widget.okta.com
CLIENT_ID=0oa8lrg7ojTsbJgRQ696

# Run build to verify siw installation
if ! npm run build; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

popd
exit ${PUBLISH_TYPE_AND_RESULT_DIR}