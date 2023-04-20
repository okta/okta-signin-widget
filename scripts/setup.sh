#!/bin/bash

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION=""
export DOCKOLITH_VERSION=""

# Install required node version
export REGISTRY_REPO="npm-topic"
export REGISTRY="${ARTIFACTORY_URL}/api/npm/${REGISTRY_REPO}"
setup_service node-and-yarn 14.18.2 1.22.19 

cd ${OKTA_HOME}/${REPO}

if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"

  if ! yarn add -W --force --no-lockfile https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-auth-js/-/@okta/okta-auth-js-${AUTHJS_VERSION}.tgz ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi
  
  MATCH="$(yarn why @okta/okta-auth-js | grep ${AUTHJS_VERSION})"
  echo ${MATCH}
  if [ -z "$MATCH" ]; then
    echo "AUTHJS_VERSION was not installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi
  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi

if [ ! -z "$DOCKOLITH_VERSION" ]; then
  echo "Installing DOCKOLITH_VERSION: ${DOCKOLITH_VERSION}"

  if ! yarn add -W --force --no-lockfile https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/dockolith/-/@okta/dockolith-${DOCKOLITH_VERSION}.tgz ; then
    echo "DOCKOLITH_VERSION could not be installed: ${DOCKOLITH_VERSION}"
    exit ${FAILED_SETUP}
  fi
  
  MATCH="$(yarn why @okta/dockolith | grep ${DOCKOLITH_VERSION})"
  echo ${MATCH}
  if [ -z "$MATCH" ]; then
    echo "DOCKOLITH_VERSION was not installed: ${DOCKOLITH_VERSION}"
    exit ${FAILED_SETUP}
  fi
  echo "DOCKOLITH_VERSION installed: ${DOCKOLITH_VERSION}"
fi

yarn config set registry https://registry.yarnpkg.com
yarn config set cafile /etc/pki/tls/certs/ca-bundle.crt
export NODE_OPTIONS=--use-openssl-ca
export NODE_EXTRA_CA_CERTS=/etc/pki/tls/certs/ca-bundle.crt

if ! yarn install ; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
