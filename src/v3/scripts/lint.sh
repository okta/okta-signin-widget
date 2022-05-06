#!/bin/bash

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export ARTIFACT_PATH="${OKTA_HOME}/${REPO}"

use_script_template npm-lint
