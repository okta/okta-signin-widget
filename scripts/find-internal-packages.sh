#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

if ! NODE_TLS_REJECT_UNAUTHORIZED=0 yarn find-internal-packages; then
  exit ${TEST_FAILURE}
fi
