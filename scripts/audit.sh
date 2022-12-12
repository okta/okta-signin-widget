#!/bin/bash

setup_service node v14.18.0
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

pushd ${OKTA_HOME}/${REPO}

# print md5sum of yarn.lock
md5sum yarn.lock

# print audit results
log_custom_message $( yarn audit )

# TODO enforce check one audit is clean
exit $SUCCESS
