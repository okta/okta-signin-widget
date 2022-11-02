#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

if ! yarn find-internal-packages; then
  exit ${TEST_FAILURE}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
