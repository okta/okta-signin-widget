#!/bin/bash

# if this build was triggered as cron job, run e2e tests on iOS
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
    export SAUCE_PLATFORM_NAME="iOS";
    yarn build:release
    yarn test:e2e
else
    echo ${SAUCE_USERNAME}
    echo ${SAUCE_ACCESS_KEY}
    yarn build:release
    yarn lint
    yarn test
    yarn test:e2e
fi
