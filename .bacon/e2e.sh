#!/bin/bash

source $OKTA_HOME/$REPO/.bacon/setup.sh

setup_service google-chrome-stable 118.0.5993.70-1

export CI=true

if ! yarn workspace @okta/loginpage-playground test:e2e; then
  echo "test failed! Exiting..."
  exit ${TEST_FAILURE}
fi
