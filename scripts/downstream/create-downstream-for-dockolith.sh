#!/bin/bash

echo "${upstream_artifact_branch}"

DOCKOLITH_BRANCH="${upstream_artifact_branch}"

# Update setup script
echo "Update DOCKOLITH_BRANCH version in scripts/install-dockolith.sh to ${DOCKOLITH_BRANCH}"
sed -i "s/\(DOCKOLITH_BRANCH\=\).*/\1\"${DOCKOLITH_BRANCH}\"/g" install-dockolith.sh

