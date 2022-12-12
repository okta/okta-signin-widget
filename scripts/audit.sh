#!/bin/bash

setup_service node v14.18.0
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

pushd ${OKTA_HOME}/${REPO}

AUDIT_RESULTS=""
yarn audit --json | while read LINE; do
  AUDIT_RESULTS+="$(echo "$LINE" | yq r -)"
  AUDIT_RESULTS+="\n---\n"
done

# print audit results
log_custom_message "Audit Results" "$AUDIT_RESULTS"

# TODO enforce check one audit is clean
exit $SUCCESS
