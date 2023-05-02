#!/bin/bash -xe

# Warning! This script will overwrite your "testenv" file.
# Run bootstrap script to create apps/users needed for E2E tests
# Write environment variables to testenv file

# Get API token, if necessary
if [[ -z "${OKTA_CLIENT_TOKEN}" ]]; then
  export OKTA_CLIENT_TOKEN=$(dockolith get-token)
fi
echo $OKTA_CLIENT_TOKEN

# Creates a test org and outputs environment variables to a file named "testenv.local" in the project root
dockolith exec --cwd test/e2e ./support/monolith/create-testenv.ts
log_extra_file testenv.local
cat testenv.local >> testenv
echo "LOCAL_MONOLITH=1" >> testenv
echo "updated testenv"
