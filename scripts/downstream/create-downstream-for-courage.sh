#!/bin/bash -xe

setup_service node v14.18.0

# download okta-ui artifact version if empty and assign to upstream_artifact_version
if [[ -z "${upstream_artifact_version}" ]]; then
  local upstream_publish_receipt;
  pushd ${OKTA_HOME}/okta-ui > /dev/null
    download_job_data global publish_receipt upstream_publish_receipt okta-ui ${upstream_artifact_sha}
  popd > /dev/null
  echo "okta-ui publish receipt: ${upstream_publish_receipt}"

  # Get the Courage version
  local -r courage_version="$(echo ${upstream_publish_receipt} | cut -d'@' -f3)"

  echo "courage version: ${courage_version}"
fi


# Install top-level dependencies
echo "installing top-level dependencies"
pushd ${OKTA_HOME}/okta-signin-widget > /dev/null
  yarn install
popd > /dev/null

# Update and build courage-for-signin-widget
pushd ${OKTA_HOME}/okta-signin-widget/packages/@okta/courage-for-signin-widget > /dev/null

  yarn add -D @okta/courage@${courage_version} --force
  yarn build

popd > /dev/null
