#!/bin/bash

cd ${OKTA_HOME}/okta-core/clients/loginpage
echo "Update okta-signin-widget version to ${upstream_artifact_version}"
yarn upgrade @okta/okta-signin-widget ${upstream_artifact_version}
