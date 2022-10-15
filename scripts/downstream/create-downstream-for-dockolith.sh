#!/bin/bash
: "${upstream_artifact_branch?:"missing upstream_artifact_branch"}"

local dockolith_branch="${upstream_artifact_branch}"
local widget_home="$(readlink -f "$(dirname "$BASH_SOURCE")/../..")"

# Update setup script
pushd ${widget_home}/scripts > /dev/null
echo "Update DOCKOLITH_BRANCH version in scripts/install-dockolith.sh to ${dockolith_branch}"
sed -i "s/\(DOCKOLITH_BRANCH\=\).*/\1\"${dockolith_branch}\"/g" install-dockolith.sh
popd > /dev/null
