#!/bin/bash

# temp branch for commit
FIX_BRANCH="weekly-patch-$RELEASE_VERSION"

# get latest
git fetch origin && \

# weekly release branch
git checkout $RELEASE_BRANCH && \

# create temporary update branch
git checkout -b $FIX_BRANCH

# update files
# yarn run update-readme --ver=$RELEASE_VERSION
package_json_contents="$(jq '.version = "'$RELEASE_VERSION'"' $OKTA_HOME/$REPO/package.json)" && \
echo -E "${package_json_contents}" > $OKTA_HOME/$REPO/package.json

# add files
git add --all
git status

# commit files
git commit -m "chore: version bump $RELEASE_VERSION"
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