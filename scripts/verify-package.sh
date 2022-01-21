#!/bin/bash -xe

mkdir -p test-reports

pushd dist
npm pack --dry-run --json > ../test-reports/pack-report.json
popd

node ./scripts/buildtools verify-package
