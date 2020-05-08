#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

# Install required dependencies
yarn global add @okta/ci-append-sha
yarn global add @okta/ci-pkginfo

export PATH="${PATH}:$(yarn global bin)"
export TEST_SUITE_TYPE="build"

if [ -n "$action_branch" ];
then
  echo "Publishing from bacon task using branch $action_branch"
  TARGET_BRANCH=$action_branch
else
  echo "Publishing from bacon testSuite using branch $BRANCH"
  TARGET_BRANCH=$BRANCH
fi

if ! ci-append-sha; then
  echo "ci-append-sha failed! Exiting..."
  exit $FAILED_SETUP
fi

### Not able to use 'yarn publish' which failed at
### publish alpha version.
### Didn't figure out root cause but keep using npm.
if ! npm publish --unsafe-perm; then
  echo "npm publish failed! Exiting..."
  exit $PUBLISH_ARTIFACTORY_FAILURE
fi

DATALOAD=$(ci-pkginfo -t dataload)
if ! artifactory_curl -X PUT -u ${ARTIFACTORY_CREDS} ${DATALOAD} -v -f; then
  echo "artifactory_curl failed! Exiting..."
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

exit $SUCCESS
