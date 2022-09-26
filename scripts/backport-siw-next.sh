#!/bin/bash

SRC_BRANCH="0.0"
DST_BRANCH="0.1"

# the temporary backport branch, e.g., backport-9012f7d4
FIX_BRANCH="backport-$(git rev-parse --verify $DST_BRANCH | cut -c-8)"

# the target branch
BRANCHES_TO_BACKPORT="$DST_BRANCH"

# obviously
GIT_REPO="okta-signin-widget"

# colorize output
RED='\033[0;31m'
NC='\033[0m' # No Color


function info () {
	echo '============'
	echo 'Instructions: https://oktawiki.atlassian.net/l/cp/P2twfyVf'
	echo 'Task: https://bacon-go.aue1e.saasure.net/tasks/RELEASE_STANDALONE_BACKPORT'
	echo '------------'
	echo GIT_REPO: okta-signin-widget
	echo BRANCHES_TO_BACKPORT: $BRANCHES_TO_BACKPORT
	echo FIX_BRANCH: $FIX_BRANCH
	echo '============'
}

# get latest
git fetch origin && \

# 0.1
git checkout $DST_BRANCH && \

# create temporary backport branch
git checkout -b $FIX_BRANCH && \

# merge
if git merge $SRC_BRANCH ; then
	# push
	git push --set-upstream origin $FIX_BRANCH
	info
else
	printf "${RED}Auto-merging failed.\n"
	printf "Push changes to origin/$FIX_BRANCH after manually resolving merge conflicts:\n"
	printf "git push --set-upstream origin $FIX_BRANCH${NC}\n"
	info
fi
