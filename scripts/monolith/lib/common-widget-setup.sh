#!/bin/bash -xe

export WIDGET_HOME=${WIDGET_HOME:-`(readlink -f "$(dirname "$0")/../../..")`}
export WIDGET_VERSION="${WIDGET_VERSION:-$(cat ${WIDGET_HOME}/package.json | jq '.version' -r)}"
export SYNTHETIC_WIDGET_VERSION=${SYNTHETIC_WIDGET_VERSION:-${WIDGET_VERSION}-local}
export DOCKOLITH_HOME="${DOCKOLITH_HOME:-${WIDGET_HOME}/node_modules/@okta/dockolith}"

# Dockolith should be installed before running this script
# Run `./scripts/monolith/install-dockolith.sh` to install latest dockolith version
source ${DOCKOLITH_HOME}/scripts/lib/dockolith/setup-dockolith.sh

function common::widget::stop_webapp() {
  local -r compose_path="${OKTA_CORE_HOME}/scripts/docker-ci/composefiles/monolith"
  local -r compose_env_file=".env"

  pushd ${compose_path}
      # Stop monolith if it is running
      docker-compose --env-file "${compose_env_file}" down
  popd
}

function common::widget::start_webapp() {
    local -r image_name="monolith"
    local -r compose_env_file=".env"
    local -r compose_path="${OKTA_CORE_HOME}/scripts/docker-ci/composefiles/monolith"
    local -r service_name="Monolith"
    local -r prepare_container_callback="common::widget::deploy_widget"

    if ! (start_image "${image_name}" "${compose_env_file}" "${compose_path}" "${service_name}" ${prepare_container_callback}); then
        echo "webapp startup failed!"
        move_logs_tmp_api
        log_extra_dir_as_zip ${TMP_LOGS_LOCATION} run_logs.zip
        exit ${BUILD_FAILURE}
    fi
}

# Deploys the locally build widget to docker monolith image
# Uses a synthetic version number: current package version with "-local" suffix
function common::widget::deploy_widget() {
  local -r monolith_container_id="$1"

  # Write synthetic version to a tmp file named "application-widet.properties"
  # This will be loaded with the "widget" CCS profile
  local -r local_conf_file=${DOCKOLITH_TMP}/application-widget.properties
  mkdir -p ${DOCKOLITH_TMP}
  echo "ui.widget.version=${SYNTHETIC_WIDGET_VERSION}" > ${local_conf_file}

  local -r local_assets_dir="${WIDGET_HOME}/dist/dist/"
  local -r remote_assets_dir="/usr/local/tomcat/webapps/ROOT/js/sdk/okta-signin-widget/${SYNTHETIC_WIDGET_VERSION}"

  # Copy over local widget assets to remote directory (containing synthetic version)
  docker cp ${local_assets_dir} ${monolith_container_id}:${remote_assets_dir}

  # Copy override.properties (setting the synthetic version)
  local -r remote_conf_dir="/usr/local/tomcat/webapps/ROOT/WEB-INF/classes/"
  docker cp ${local_conf_file} ${monolith_container_id}:${remote_conf_dir}
}
