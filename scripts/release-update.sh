#!/bin/bash

INTERNAL_REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-okta-release"
REPO_PATH=$OKTA_HOME/$REPO

if ! setup_service node v16.19.1 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

if ! setup_service yarn 1.22.19 &> /dev/null; then
  echo "Failed to install yarn"
  exit ${FAILED_SETUP}
fi

# get latest
git fetch origin && \

# release branch
git checkout $RELEASE_BRANCH

# update files
npm config set @okta:registry ${INTERNAL_REGISTRY}
yarn global add @okta/siw-platform-scripts@0.13.0

cd ${REPO_PATH}
tmp=$(mktemp)

jq --arg RELEASE_VERSION "${RELEASE_VERSION}" '.version=$RELEASE_VERSION' package.json > "$tmp" && mv "$tmp" package.json
yarn install --frozen-lockfile
yarn build:release

if ! siw-platform release-update --ver=$RELEASE_VERSION --repoPath=$REPO_PATH ; then
	echo "release-update script failed : repo path: $REPO_PATH : release version: $RELEASE_VERSION"
	exit ${FAILED_SETUP}
fi

# add files
git add --all
git status

# push
printf "Pushing to release branch...\n"
commit_sign_push "chore: version bump $RELEASE_VERSION"
