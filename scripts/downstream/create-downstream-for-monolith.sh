#!/bin/bash -xe

setup_service node v14.18.0
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

# install dockolith based on upstream branch
export DOCKOLITH_BRANCH=${upstream_artifact_branch}
source ./scripts/monolith/install-dockolith.sh

# prepare dockolith
pushd ./scripts/dockolith > /dev/null
  yarn # install dependencies and build TS
popd > /dev/null

# run e2e
source ./scripts/e2e-monolith.sh
