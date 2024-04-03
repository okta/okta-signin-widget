#!/bin/bash

VERSION=$RELEASE_VERSION

# temp branch for commit
FIX_BRANCH="weekly-patch-$VERSION"

# update files
yarn run update-readme --ver=$VERSION
yarn run update-patch-version $VERSION

# get latest
git fetch origin && \

git stash && \

# weekly release branch
git checkout $RELEASE_BRANCH && \

# create temporary update branch
git checkout -b $FIX_BRANCH && \

git stash pop && \

# add files
git add $OKTA_HOME/$REPO/package.json
git add $OKTA_HOME/$REPO/README.md
git add $OKTA_HOME/$REPO/polyfill/README.md

# commit files
git commit -m "chore: version bump $VERSION"

# push
if git push --set-upstream origin $FIX_BRANCH ; then
	info
else
	printf "${RED}Push failed.\n"
	info
fi