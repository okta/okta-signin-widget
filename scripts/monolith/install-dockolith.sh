#!/bin/bash

if [[ -z ${DOCKOLITH_VERSION} ]]; then
  # export DOCKOLITH_VERSION=1.6.1
  export DOCKOLITH_VERSION=1.9.0-ge196ec8
fi


# only install if not triggered by upstream build
if [[ -z ${DOCKOLITH_DOWNSTREAM} ]]; then
  setup_service dockolith $DOCKOLITH_VERSION
fi

echo '#####################'
dockolith --version
echo '#####################'

if [ -n "${DOCKOLITH_CI}" ]; then # CI only
  echo "Boostrapping dockolith..."
  dockolith bootstrap ${OKTA_HOME}/${REPO}
fi

export DOCKOLITH_HOME=$(dockolith home)
