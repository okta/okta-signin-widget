#!/bin/bash

# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export DOCKOLITH_DOWNSTREAM=""

if [[ -z ${DOCKOLITH_VERSION} ]]; then
  # export DOCKOLITH_VERSION=1.6.1
  export DOCKOLITH_VERSION="${DOCKOLITH_DOWNSTREAM:-1.9.0-ge196ec8}"
fi

setup_service dockolith $DOCKOLITH_VERSION
log_custom_message "Dockolith Version" "$(dockolith --version)"

if [ -n "${CI}" ]; then # CI only
  echo "Boostrapping dockolith..."
  dockolith bootstrap ${OKTA_HOME}/${REPO}
fi

export DOCKOLITH_HOME=$(dockolith home)
