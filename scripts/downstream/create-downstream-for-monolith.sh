#!/bin/bash -xe

setup_service node v14.18.0

cd $OKTA_HOME/$REPO

# Get monolith build version based on commit sha
source ./scripts/monolith/install-dockolith.sh
script="
import { getBuildVersion } from '@okta/dockolith';
(async function() {
  const version = await getBuildVersion({ commitSha: '${upstream_artifact_sha}' });
  console.log(version);
})();
"
mono_build_version=`./node_modules/.bin/ts-node -e "${script}"`

# Update script: MONOLITH_BUILDVERSION in e2e-monolith.sh
pushd ./scripts/monolith > /dev/null
  sed -i "s/\(MONOLITH_BUILDVERSION\=\).*/\1\"${mono_build_version}\"/g" e2e-monolith.sh
popd > /dev/null
