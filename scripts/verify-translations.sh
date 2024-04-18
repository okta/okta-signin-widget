#!/bin/bash -v

source $OKTA_HOME/$REPO/scripts/setup.sh

setup_github_token atko-eng
clone_repo i18n atko-eng
pushd "${OKTA_HOME}/i18n"
  git checkout main
popd

cd ${OKTA_HOME}/${REPO}

if ! yarn verify-translations; then
  echo "Verify failed! Exiting..."
  exit ${TEST_FAILURE}
fi

exit $SUCCESS
