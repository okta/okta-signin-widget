#!/bin/bash

# Install required dependencies
if ! setup_service node v16.18.1 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

if ! setup_service yarn 1.22.19 /etc/pki/tls/certs/ca-bundle.crt &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

cd ${OKTA_HOME}/${REPO}

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
