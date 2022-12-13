#!/bin/bash -xe

export WIDGET_HOME=${WIDGET_HOME:-`(readlink -f "$(dirname "$0")/../..")`}
source ${WIDGET_HOME}/scripts/monolith/lib/common-widget-setup.sh

if [ -z "${DOCKOLITH_CI}" ]; then # Local
  # remove all running containers and networks before running
  source ${DOCKOLITH_HOME}/scripts/smoke-docker.sh

  # clear all tmp files
  rm -rf ${DOCKOLITH_TMP}
fi

dockolith::setup;

common::widget::start_webapp;

export DOCKER_HOST_CONTAINER_IP=$(docker inspect --format='{{.NetworkSettings.Networks.monolith_network.IPAddress}}' mono_dockerhost)
update_hosts_entry $DOCKER_HOST_CONTAINER_IP cdn.okta1.com
update_hosts_entry $DOCKER_HOST_CONTAINER_IP rain.okta1.com
update_hosts_entry $DOCKER_HOST_CONTAINER_IP backdoorentry.okta1.com

curl http://backdoorentry.okta1.com:1802

export METRIC_TO_LOG=bootstrap_db
if ! log_metric_wrapper dockolith::bootstrap;
then
    echo "bootstrap failed!"
    move_logs_tmp_api
    log_extra_dir_as_zip ${TMP_LOGS_LOCATION} run_logs.zip
    exit ${BUILD_FAILURE}
fi
