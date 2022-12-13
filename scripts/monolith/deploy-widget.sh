#!/bin/bash -ex

export WIDGET_HOME="$(readlink -f "$(dirname "$0")/../..")"
source ${WIDGET_HOME}/scripts/monolith/lib/common-widget-setup.sh

setup_logging_api
export_cloud_config

#Set the spring config profiles. this determines which config files are loaded
# http://localhost:8100/okta/ci,ci_test_shared_credentials
# web credentials for CCS in bootstrap-ci.properties
export MONOLITH_PROFILES_ACTIVE="ci_test_shared_credentials,ci,widget"

# Stop monolith if it is running
common::widget::stop_webapp

# Local widget will be deployed before startup
common::widget::start_webapp
