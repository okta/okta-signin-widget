#!/bin/bash -xe

# Dockolith should be installed before running this script
# Gets an API token from local monolith and exports to environment var: $OKTA_CLIENT_TOKEN

source ${DOCKOLITH_HOME}/scripts/api/get-token.sh
echo $OKTA_CLIENT_TOKEN
