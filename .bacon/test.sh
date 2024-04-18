#!/bin/bash

source $OKTA_HOME/$REPO/.bacon/setup.sh

if ! yarn workspace @okta/loginpage-render test; then
  echo "test failed! Exiting..."
  exit ${TEST_FAILURE}
fi