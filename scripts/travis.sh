#!/bin/bash

# if this build was triggered as cron job, run e2e tests on iOS
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
    DD=$(date +%d)
    # Run iOS tests on even days, android tests on odd
    if [ $((DD%2)) -eq 0 ];
    then
        export SAUCE_PLATFORM_NAME="iOS";
    else
        export SAUCE_PLATFORM_NAME="android";
    fi
    yarn test:e2e
else
    yarn $TEST_SUITE
fi
