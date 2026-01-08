#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

# Install required dependencies
yarn global add @okta/ci-append-sha
yarn global add @okta/ci-pkginfo

export PATH="${PATH}:$(yarn global bin)"
export TEST_SUITE_TYPE="build"
export PUBLISH_REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-topic"

# Get Sentry auth token from Terminus
get_terminus_secret "/" SENTRY_AUTH_TOKEN SENTRY_AUTH_TOKEN
export SENTRY_ORG="${SENTRY_ORG:-okta-prod}"
export SENTRY_PROJECT="${SENTRY_PROJECT:-okta-loginpage}"

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

# Upload sourcemaps to Sentry
if [ -n "$SENTRY_AUTH_TOKEN" ]; then
  echo "Uploading sourcemaps to Sentry..."
  RELEASE_VERSION="$(ci-pkginfo -t pkgsemver)"
  
  # Upload sourcemaps with release version
  # Note: Debug IDs are already injected during build:release
  yarn sentry-cli sourcemaps upload \
    --org="${SENTRY_ORG}" \
    --project="${SENTRY_PROJECT}" \
    --release="7.40.0-local" \
    ./dist/dist/js
  
  echo "Sourcemaps uploaded successfully for release ${RELEASE_VERSION}"
else
  echo "Warning: SENTRY_AUTH_TOKEN not set, skipping sourcemap upload"
fi

pushd ./dist

### Not able to use 'yarn publish' which failed at
### publish alpha version.
### Didn't figure out root cause but keep using npm.
npm config set @okta:registry ${PUBLISH_REGISTRY}
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