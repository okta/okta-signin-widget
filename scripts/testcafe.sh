#!/bin/bash
export CHROME_HEADLESS=true
setup_service google-chrome-stable 83.0.4103.61-1

source $OKTA_HOME/$REPO/scripts/setup.sh

if ! yarn test:testcafe-ci; then
  echo "testcafe tests failed! Exiting..."
  exit ${FAILURE}
fi

exit ${SUCCESS};
