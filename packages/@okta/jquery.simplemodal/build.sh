# This script is okta internal only. This is referenced in
# https://github.com/okta/npm/scripts/third-party-publish.sh and will be 
# used when this package is built there.

# Get package version from package.json
PACKAGE_VERSION=$(awk '/version/{gsub(/("|",)/,"",$2);print $2};' package.json)

# Write version number to jquery.simplemodal.js and make a dist version.
mkdir -p dist
awk -v version="$PACKAGE_VERSION" '{gsub(/@VERSION/,version)}1' src/jquery.simplemodal.js > dist/jquery.simplemodal.js
