#!/bin/bash
yarn --cwd ../../ codegen
yarn build --mode testcafe && yarn serve --mode testcafe
