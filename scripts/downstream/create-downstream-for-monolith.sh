#!/bin/bash -xe

setup_service node v14.18.0
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

# Get monolith build version based on commit sha
source ./scripts/monolith/install-dockolith.sh
pushd ./scripts/dockolith > /dev/null
  yarn # install dependencies and build TS
  mono_build_version=`./scripts/api/get-build-version.sh "${upstream_artifact_sha}"`
popd > /dev/null
