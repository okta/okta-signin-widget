#!/bin/bash

# if this build was triggered as cron job, run e2e tests on iOS
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
    export SAUCE_PLATFORM_NAME="iOS";
    yarn test:e2e
else
    yarn $TEST_SUITE
fi
