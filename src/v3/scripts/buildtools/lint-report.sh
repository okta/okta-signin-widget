#!/bin/bash
set -euo pipefail

mkdir -p build2/reports/lint

yarn build:i18n

eslint -f checkstyle -o build2/reports/lint/OSW-eslint-checkstyle-result.xml src test --quiet
