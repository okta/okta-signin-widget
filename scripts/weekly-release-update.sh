#!/bin/bash

# get latest
git fetch origin && \

# update package.json
package_json_contents="$(jq '.version = "'$RELEASE_VERSION'"' $OKTA_HOME/$REPO/package.json)" && \
echo -E "${package_json_contents}" > $OKTA_HOME/$REPO/package.json

# update README files
yarn run update-readme --ver=$RELEASE_VERSION

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
