#!/bin/bash -ex

# export all environment vars from testenv
set -o allexport
source testenv
set +o allexport

yarn -s --cwd test/e2e ts-node ./support/monolith/enable-oie.ts
