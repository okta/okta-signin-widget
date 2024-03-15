#!/bin/bash

# get latest
git fetch origin && \

# weekly release branch
git checkout $RELEASE_BRANCH && \

# update files
yarn run update-readme --ver=$RELEASE_VERSION
yarn run update-patch-version $RELEASE_VERSION

# add files
git add $OKTA_HOME/$REPO/package.json
git add $OKTA_HOME/$REPO/README.md
git add $OKTA_HOME/$REPO/polyfill/README.md

# commit files
git commit -m "chore: version bump $RELEASE_VERSION"

# push
if git push --set-upstream origin $RELEASE_BRANCH ; then
	info
else
	printf "${RED}Push failed.\n"
	info
fi