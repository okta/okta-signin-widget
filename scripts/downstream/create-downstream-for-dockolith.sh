#!/bin/bash -xe
: "${upstream_artifact_branch?:"missing upstream_artifact_branch"}"

local dockolith_branch="${upstream_artifact_branch}"
local widget_home="$(readlink -f "$(dirname "$BASH_SOURCE")/../..")"

# Update script
pushd ${widget_home}/scripts/monolith > /dev/null
sed -i "s/\(DOCKOLITH_BRANCH\=\).*/\1\"${dockolith_branch}\"/g" install-dockolith.sh
popd > /dev/null
