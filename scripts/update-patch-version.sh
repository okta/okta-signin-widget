#!/bin/bash

if [ -z "$1" ]
  then
    echo "Version was not provided. Exiting..."
    exit ${BUILD_FAILURE}
fi

NEW_VERSION=$1
package_json_contents="$(jq '.version = "'$NEW_VERSION'"' $OKTA_HOME/$REPO/package.json)" && \
echo -E "${package_json_contents}" > $OKTA_HOME/$REPO/package.json
