#!/bin/bash -xe

setup_service node v16.19.1
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

# Get monolith build version based on commit sha
source ./scripts/monolith/install-dockolith.sh
pushd ./scripts/dockolith > /dev/null
  yarn # install dependencies and build TS
  mono_build_version=`./scripts/api/get-build-version.sh "${upstream_artifact_sha}"`
popd > /dev/null

# Update script: MONOLITH_BUILDVERSION in e2e-monolith.sh
pushd ./scripts > /dev/null
  sed -i "s/\(MONOLITH_BUILDVERSION\=\).*/\1\"${mono_build_version}\"/g" e2e-monolith.sh
popd > /dev/null
