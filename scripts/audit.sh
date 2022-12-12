#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

# print md5sum of yarn.lock
md5sum yarn.lock

# print audit results
yarn audit

# TODO enforce check one audit is clean
exit $SUCCESS
