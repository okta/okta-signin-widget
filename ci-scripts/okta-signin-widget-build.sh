#!/bin/bash -vx
JOB_NAME=`basename $0`
LOGDIRECTORY=/tmp/ci-builder
mkdir -p $LOGDIRECTORY
LOGFILE=$LOGDIRECTORY/$JOB_NAME.log
exec > >(tee $LOGFILE)
exec 2>&1
set -e

# Bacon does not pass a parameter, so default to the one we want (deploy)
TASK="${1:-deploy}"

BUILD_TEST_SUITE_ID=D33E21EE-E0D0-401D-8162-56B9A7BA0539
LINT_TEST_SUITE_ID=2D4D1259-92C2-45BA-A74D-E665B7EC17FB
UNIT_TEST_SUITE_ID=12DFDE73-F3D5-4EEB-BF12-DDE72E66DE61
PUBLISH_TEST_SUITE_ID=D2E90D99-59B8-42FB-9B45-E0E10C1369E1

REGISTRY="https://artifacts.aue1d.saasure.com/artifactory/api/npm/npm-okta"

function usage() {
  OUTPUTCODE=$1
  echo """
USAGE:
    ./okta-signin-widget-build.sh {TASK}

    Example:
    ./okta-signin-widget-build.sh build

TASKS:
    help              Prints this guide.
    build             Builds and runs unit tests.
    deploy            Publishes widget to NPM after successful build
                      Requires valid Artifactory credentials.
"""
  [ -z $OUTPUTCODE ] && OUTPUTCODE=0
  exit $OUTPUTCODE
}

function build() {
  start_test_suite ${BUILD_TEST_SUITE_ID}
  if bundle install && npm install && npm run package; then
    echo "Finishing up test suite $BUILD_TEST_SUITE_ID"
    finish_test_suite "build"
  else
    echo "Build failed"
    finish_failed_test_suite "build"
    exit 1
  fi
}

function lint() {
  start_test_suite ${LINT_TEST_SUITE_ID}
  if npm run lint:report; then
    echo "Finishing up test suite $LINT_TEST_SUITE_ID"
    finish_test_suite "checkstyle" "okta-signin-widget/build2/"
  else
    echo "Lint failed"
    finish_failed_test_suite "checkstyle" "okta-signin-widget/build2/"
  fi
}

function unit() {
  start_test_suite ${UNIT_TEST_SUITE_ID}
  if npm test; then
    echo "Finishing up test suite $UNIT_TEST_SUITE_ID"
    finish_test_suite "jsunit" "okta-signin-widget/build2/reports/jasmine/"
  else
    echo "Unit failed"
    finish_failed_test_suite "jsunit" "okta-signin-widget/build2/reports/jasmine/"
  fi
}

function publish() {
  # Always publish a version to our npm registry:
  # If topic branch, will create an alpha prerelease version
  # If master branch, will create a beta prerelease version
  start_test_suite ${PUBLISH_TEST_SUITE_ID}
  echo "Updating the version number, and publishing"
  if npm run ci-update-package -- --branch=${BRANCH} && npm publish --registry ${REGISTRY}; then
    DATALOAD=$(npm run ci-pkginfo:dataload --silent)
    artifactory_curl -X PUT -u ${ARTIFACTORY_USER}:${ARTIFACTORY_PASSWORD} ${DATALOAD} -v -f
    echo "Publish Success"
    finish_test_suite "no-test-suite" "."
  else
    echo "Publish Failed"
    finish_failed_test_suite "no-test-suite" "."
  fi
}

case $TASK in
  help)
    usage
    ;;
  build)
    build
    lint
    unit
    ;;
  deploy)
    build
    lint
    unit
    publish
    ;;
  *)
    usage $TASK
    ;;
esac
