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


exit $SUCCESS
