#!/bin/bash -v

if ! setup_service node v16.19.1 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

if ! setup_service yarn 1.22.19 &> /dev/null; then
  echo "Failed to install yarn"
  exit ${FAILED_SETUP}
fi

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
