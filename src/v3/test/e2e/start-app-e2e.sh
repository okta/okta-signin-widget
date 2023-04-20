#!/bin/bash

export NODE_OPTIONS="--max-old-space-size=5120"
yarn --cwd ../../ codegen
yarn build --mode testcafe && yarn serve --mode testcafe
