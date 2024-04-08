#!/bin/bash

source $OKTA_HOME/$REPO/.bacon/setup.sh

if ! yarn lint ; then
  echo "Lint failed"
  exit ${FAILED_SETUP}
fi
