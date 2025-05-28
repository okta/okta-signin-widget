#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/src/v3/build2/reports/unit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

fail_count=0

yarn workspace v3 run codegen

for i in {1..50}; do
  echo "$i | Running test, attempt $i"
  if ! yarn workspace v3 run jest flow-okta-verify-enrollment.test.tsx --no-colors; then
    ((fail_count++))
  fi
  echo "$i | Done with attempt $i"
done

if [ "$fail_count" -gt 0 ]; then
  echo "v3 jest tests failed [[[[ $fail_count ]]]] times! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
# if ! yarn workspace v3 test flow-okta-verify-enrollment.test.tsx --no-colors; then
#   echo "v3 jest tests failed! Exiting..."
#   exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
# fi

exit $PUBLISH_TYPE_AND_RESULT_DIR;
