#!/bin/bash -xe

setup_service node v14.18.2
setup_service yarn 1.22.19

# download okta-ui artifact version if empty and assign to upstream_artifact_version
if [[ -z "${upstream_artifact_version}" ]]; then
  local upstream_publish_receipt="";
  pushd ${OKTA_HOME}/okta-ui > /dev/null
    download_job_data global publish_receipt upstream_publish_receipt okta-ui ${upstream_artifact_sha}
  popd > /dev/null
  echo "okta-ui publish receipt: ${upstream_publish_receipt}"

  # Get the Courage version
  local -r courage_version=$(echo "$upstream_publish_receipt" | grep "@okta/courage" | sed 's/.*@//')
  if [ -z ${courage_version} ]; then
      echo "No courage version was published from this build. Cannot generate downstream branch."
      exit ${BUILD_FAILURE}
  fi

  echo "courage version: ${courage_version}"
fi

# Update courage version and install internal dependencies
echo "Updating courage version in courage-for-signin-widget to: ${courage_version}"
pushd ${OKTA_HOME}/okta-signin-widget/packages/@okta/courage-for-signin-widget > /dev/null
  yarn add -D @okta/courage@${courage_version} --force
  yarn install
popd > /dev/null


# Install top-level (public) dependencies, also needed for a build
echo "installing top-level dependencies"

pushd ${OKTA_HOME}/okta-signin-widget > /dev/null
  yarn install
popd > /dev/null

# Build courage-for-signin-widget
pushd ${OKTA_HOME}/okta-signin-widget/packages/@okta/courage-for-signin-widget > /dev/null
  yarn build
popd > /dev/null
