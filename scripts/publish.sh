#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

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


# Build
if ! yarn build:release; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

pushd ./dist

### Not able to use 'yarn publish' which failed at
### publish alpha version.
### Didn't figure out root cause but keep using npm.
npm config set @okta:registry ${REGISTRY}
if ! npm publish --unsafe-perm; then
  echo "npm publish failed! Exiting..."
  exit $PUBLISH_ARTIFACTORY_FAILURE
fi

# upload artifact version to eng prod s3 to be used by downstream jobs
artifact_version="$(ci-pkginfo -t pkgname)@$(ci-pkginfo -t pkgsemver)"
if upload_job_data global artifact_version ${artifact_version}; then
  echo "Upload okta-signin-widget job data artifact_version=${artifact_version} to s3!"
else
  # only echo the info since the upload is not crucial
  echo "Fail to upload okta-signin-widget job data artifact_version=${artifact_version} to s3!" >&2
fi

FINAL_PUBLISHED_VERSIONS=$(echo "console.log(require('./package.json').version)" | node -)
log_custom_message "Published Version" "${FINAL_PUBLISHED_VERSIONS}"

popd

exit $SUCCESS