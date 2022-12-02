#!/bin/bash -xe

setup_service node v14.18.0

# download okta-ui artifact version if empty and assign to upstream_artifact_version
if [[ -z "${upstream_artifact_version}" ]]; then
  pushd ${OKTA_HOME}/okta-ui > /dev/null
    download_job_data global publish_receipt upstream_artifact_version okta-ui ${upstream_artifact_sha}
  popd > /dev/null
  echo "okta-ui version that will be tested: ${upstream_artifact_version}"
fi

# Get the Courage version
local -r courage_version="$(echo ${upstream_artifact_version} | cut -d'@' -f3)"

# Install top-level dependencies
yarn install

# Update and build courage-for-signin-widget
pushd ${OKTA_HOME}/okta-signin-widget/packages/@okta/courage-for-signin-widget > /dev/null

yarn add -D @okta/courage@${courage_version} --force
yarn build

popd > /dev/null
