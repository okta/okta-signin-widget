#!/bin/bash

# download okta-auth-js artifact version if empty and assign to upstream_artifact_version
if [[ -z "${upstream_artifact_version}" ]]; then
  pushd ${OKTA_HOME}/okta-auth-js > /dev/null
    download_job_data global artifact_version upstream_artifact_version okta-auth-js ${upstream_artifact_sha}
  popd > /dev/null
  echo "okta-auth-js version that will be tested: ${upstream_artifact_version}"
fi

pushd ${OKTA_HOME}/okta-signin-widget/scripts > /dev/null

# Get the AuthJS version to use
AUTHJS_VERSION="$(echo ${upstream_artifact_version} | cut -d'@' -f3)"

# Update setup script
echo "Update okta-auth-js version in scripts/setup.sh to ${AUTHJS_VERSION}"
sed -i "s/\(AUTHJS_VERSION\=\).*/\1\"${AUTHJS_VERSION}\"/g" setup.sh

popd > /dev/null

# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
# setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

# # Also install it so that package.json is updated
# npm config set strict-ssl false
# if ! yarn add -DW https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-auth-js/-/@okta/okta-auth-js-${AUTHJS_VERSION}.tgz ; then
#   echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
#   exit ${FAILED_SETUP}
# fi