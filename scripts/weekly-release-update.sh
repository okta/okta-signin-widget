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

# temp branch for commit
FIX_BRANCH="weekly-patch-$RELEASE_VERSION"

# get latest
git fetch origin && \

# weekly release branch
git checkout $RELEASE_BRANCH && \

# create temporary update branch
git checkout -b $FIX_BRANCH

# update files
npm config set @okta:registry ${INTERNAL_REGISTRY}
yarn global add @okta/siw-platform-scripts@0.11.0

if ! siw-platform weekly-release-update --ver=$RELEASE_VERSION --repoPath=$REPO_PATH ; then
	echo "weekly-release-update script failed : repo path: $REPO_PATH : release version: $RELEASE_VERSION"
	exit ${FAILED_SETUP}
fi

# add files
git add --all
git status

# commit files
# git commit -m "chore: version bump $RELEASE_VERSION"
commit_sign_push "chore: version bump $RELEASE_VERSION"
git status

printf "Pushing to Temp branch...\n"
# push
if git push --set-upstream origin $FIX_BRANCH ; then
	printf "${GREEN}Push to $FIX_BRANCH was successful.\n"
	info
else
	printf "${RED}Push to $FIX_BRANCH failed.\n"
	info
fi

printf "Pushing to release branch...\n"
# push
if git push origin $FIX_BRANCH:$RELEASE_BRANCH ; then
	printf "${GREEN}Push to $RELEASE_BRANCH was successful.\n"
	info
else
	printf "${RED}Push to $RELEASE_BRANCH failed.\n"
	info
fi