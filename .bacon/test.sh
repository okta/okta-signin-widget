#!/bin/bash

source $OKTA_HOME/$REPO/.bacon/setup.sh

# TODO: enable when test script is available 
# if ! yarn workspace @okta/loginpage-render test; then
#   echo "test failed! Exiting..."
#   exit ${TEST_FAILURE}
# fi