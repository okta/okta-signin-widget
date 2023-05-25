#!/bin/bash -xe

# download dockolith artifact version if empty and assign to upstream_artifact_version
if [[ -z "${upstream_artifact_version}" ]]; then
  pushd ${OKTA_HOME}/dockolith > /dev/null
    download_job_data global artifact_version upstream_artifact_version dockolith ${upstream_artifact_sha}
  popd > /dev/null
  echo "dockolith version that will be tested: ${upstream_artifact_version}"
fi

pushd ${OKTA_HOME}/okta-signin-widget/scripts > /dev/null

  # Get the dockolith version to use
  DOCKOLITH_VERSION="$(echo ${upstream_artifact_version} | cut -d'@' -f3)"

  # Update setup script
  echo "Update dockolith version in scripts/monolith/install-dockolith.sh to ${DOCKOLITH_VERSION}"
  sed -i "s/\(DOCKOLITH_DOWNSTREAM\=\).*/\1\"${DOCKOLITH_VERSION}\"/g" monolith/install-dockolith.sh

popd > /dev/null
