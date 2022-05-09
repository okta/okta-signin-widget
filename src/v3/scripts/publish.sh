#!/bin/bash

export TEST_SUITE_TYPE="build"

PROJECT_DIR="$OKTA_HOME/$REPO"
BUILD_DIR="$PROJECT_DIR/build"
DIST_DIR="$BUILD_DIR/dist"

# nav to project dir
pushd "$PROJECT_DIR"

# setup
source "$PROJECT_DIR/scripts/setup.sh"

# checks whether a cmd is available
check() (
  if ! which $@ >/dev/null; then
    echo "failed: $@ missing"
    exit 1
  else
    echo "success: $@ ok"
  fi
)

# install required dependencies
yarn global add "@okta/ci-append-sha" "@okta/ci-pkginfo"

export PATH="${PATH}:$(yarn global bin)"

check jq
check ci-append-sha
check ci-pkginfo

# build
if yarn build; then
  echo "success: yarn build"
else
  echo "failed: yarn build"
  exit ${TEST_FAILURE}
fi

# copy files
cp -f *.md .npmignore "$BUILD_DIR"
jq ".private=false" "package.json" > "$BUILD_DIR/package.json"

# navigate in
pushd "$BUILD_DIR"

# append a sha to the version in package.json
if ci-append-sha; then
  echo "success: ci-append-sha"
else
  echo "failed: ci-append-sha"
  exit $FAILED_SETUP
fi

# publish to artifactory
# NOTE: "name" in package.json must start with "@okta/" or this cmd fails
npm config set @okta:registry ${REGISTRY}
if npm publish --unsafe-perm; then
  echo "success: npm publish"
else
  echo "failed: npm publish"
  exit $PUBLISH_ARTIFACTORY_FAILURE
fi

# upload artifact version to eng prod s3 to be used by downstream jobs
ARTIFACT_VERSION="$(ci-pkginfo -t pkgname)@$(ci-pkginfo -t pkgsemver)"
echo "$ARTIFACT_VERSION"

jq . package.json

if upload_job_data global artifact_version ${ARTIFACT_VERSION}; then
  echo "success: upload job data to s3"
else
  # only echo the info since the upload is not crucial
  echo "failed: upload job data to s3"
fi

# navigate out
popd

exit $SUCCESS
