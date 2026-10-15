#!/bin/bash

# ============================================================================
# siw-playwright: post-publish regression against the just-published SIW
# ============================================================================
# Runs one of siw-playwright's suites against the SIW version published by the
# `publish` suite. SIW_PLAYWRIGHT_SUITE picks which one:
#
#   e2e (default) — gen 1/2/3 end-to-end specs against a locally hosted org
#                   with our build installed.
#   page-unit     — ~140 gen 2/3 page tests against a mocked backend, with
#                   siw-playwright's SIW pin swapped for our version.
#
# The entrypoint leaves reporting to this script (TEST_SUITE_TYPE is exported
# first) and exits 0/1; we collect its JUnit and reports afterwards.
# ============================================================================

set -eo pipefail

: "${OKTA_HOME:?OKTA_HOME must be set}"
: "${REPO:?REPO must be set}"

SIW_PLAYWRIGHT_SUITE="${SIW_PLAYWRIGHT_SUITE:-e2e}"
case "${SIW_PLAYWRIGHT_SUITE}" in
  e2e|page-unit) ;;
  *)
    echo "Unknown SIW_PLAYWRIGHT_SUITE='${SIW_PLAYWRIGHT_SUITE}'; expected e2e or page-unit."
    exit ${FAILED_SETUP}
    ;;
esac

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE
mkdir -p "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}"

# Only node is needed; this suite never builds the widget.
if ! setup_service node v22.22.3 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

# ---- Resolve the widget version published for this commit -----------------
create_log_group "Resolve widget artifact version"
  COMMIT_SHA="$(git -C ${OKTA_HOME}/${REPO} rev-parse HEAD)"
  echo "Fetching artifact_version for commit ${COMMIT_SHA}..."
  # download_job_data writes into the named variable, which must already exist.
  WIDGET_ARTIFACT_VERSION=""
  if ! download_job_data global artifact_version WIDGET_ARTIFACT_VERSION okta-signin-widget "${COMMIT_SHA}"; then
    echo "Failed to download artifact_version for ${COMMIT_SHA}. Check the publish"
    echo "suite result for this SHA."
    exit ${FAILED_SETUP}
  fi
  # Value is `@okta/okta-signin-widget@<version>`; the version is after the last `@`.
  SIW_OVERRIDE_VERSION="${WIDGET_ARTIFACT_VERSION##*@}"
  if [[ -z "${SIW_OVERRIDE_VERSION}" ]]; then
    echo "Failed to parse version from artifact_version='${WIDGET_ARTIFACT_VERSION}'."
    exit ${FAILED_SETUP}
  fi
  echo "SIW version under test: ${SIW_OVERRIDE_VERSION}"
  log_custom_message "SIW version tested" "${SIW_OVERRIDE_VERSION}"
finish_log_group $?

# ---- Clone siw-playwright -------------------------------------------------
# SIW_PLAYWRIGHT_REF optionally pins a branch or tag (not a SHA).
SIW_PLAYWRIGHT_REF="${SIW_PLAYWRIGHT_REF:-main}"
create_log_group "Clone siw-playwright"
  SIW_PLAYWRIGHT_DIR="${OKTA_HOME}/siw-playwright"
  rm -rf "${SIW_PLAYWRIGHT_DIR}"
  if command -v setup_github_token >/dev/null 2>&1; then
    setup_github_token atko-eng "" force
  fi
  if ! git clone --depth 1 --branch "${SIW_PLAYWRIGHT_REF}" https://github.com/atko-eng/siw-playwright.git "${SIW_PLAYWRIGHT_DIR}"; then
    echo "git clone failed."
    exit ${FAILED_SETUP}
  fi
  echo "siw-playwright cloned at $(git -C "${SIW_PLAYWRIGHT_DIR}" rev-parse --short HEAD)"
  ENTRYPOINT="${SIW_PLAYWRIGHT_DIR}/.bacon/${SIW_PLAYWRIGHT_SUITE}.sh"
  if [[ ! -f "${ENTRYPOINT}" ]]; then
    echo "siw-playwright@${SIW_PLAYWRIGHT_REF} has no .bacon/${SIW_PLAYWRIGHT_SUITE}.sh — entrypoint moved?"
    exit ${FAILED_SETUP}
  fi
  # An entrypoint without override support would test its own pinned SIW and
  # pass without ever touching our build.
  if ! grep -q 'SIW_OVERRIDE_VERSION' "${ENTRYPOINT}"; then
    echo "siw-playwright@${SIW_PLAYWRIGHT_REF} .bacon/${SIW_PLAYWRIGHT_SUITE}.sh doesn't support"
    echo "SIW_OVERRIDE_VERSION — it would test its pinned SIW, not ${SIW_OVERRIDE_VERSION}."
    exit ${FAILED_SETUP}
  fi
finish_log_group $?

if [[ "${SIW_PLAYWRIGHT_SUITE}" == "page-unit" ]]; then
  # ---- Run page-unit ------------------------------------------------------
  # Pre-release builds (x.y.z-g<sha>) only exist in npm-okta-all, so point
  # siw-playwright's @okta registry there; strict semvers use npm-okta-release.
  if [[ -z "${ARTIFACTORY_URL:-}" ]]; then
    echo "ARTIFACTORY_URL is not set; can't point siw-playwright at the published SIW."
    exit ${FAILED_SETUP}
  fi
  if [[ "${SIW_OVERRIDE_VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    SIW_NPM_REPO="npm-okta-release"
  else
    SIW_NPM_REPO="npm-okta-all"
  fi
  create_log_group "siw-playwright page-unit"
    # Don't stop on a test failure before artifacts are collected.
    set +e
    (
      export REPO=siw-playwright
      export SIW_OVERRIDE_VERSION
      export OKTA_NPM_REGISTRY_SERVER="${ARTIFACTORY_URL}/api/npm/${SIW_NPM_REPO}"
      unset COVERAGE COVERAGE_SHARD_INDEX COVERAGE_SHARD_TOTAL
      bash "${ENTRYPOINT}"
    )
    PAGE_UNIT_EXIT=$?
    set -e
    echo "siw-playwright page-unit.sh exited with ${PAGE_UNIT_EXIT}"
  finish_log_group ${PAGE_UNIT_EXIT} || true

  # ---- Collect artifacts + JUnit XML (best-effort) ------------------------
  create_log_group "Collect artifacts"
    set +e
    PU_REPORTS="${SIW_PLAYWRIGHT_DIR}/build2/reports/playwright"
    JUNIT="${PU_REPORTS}/siw-junit-results.xml"
    if [ -f "${JUNIT}" ]; then
      cp "${JUNIT}" "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}/"
      PU_STATS="$(grep -oE '<testsuites [^>]+' "${JUNIT}" | head -1 \
        | grep -oE '(tests|failures|errors|skipped)="[0-9]+"' \
        | tr -d '"' | paste -sd, -)"
      log_custom_message "Page-unit results" "${PU_STATS:-<no data>}"
    else
      log_custom_message "Page-unit results" "<no JUnit output — page-unit may have failed before tests ran>"
    fi
    if [ -d "${PU_REPORTS}/siw-html-report" ]; then
      log_extra_dir_as_zip "${PU_REPORTS}/siw-html-report" "playwright-report-page-unit.zip"
    fi
    if [ -d "${PU_REPORTS}/siw-test-results" ]; then
      log_extra_dir_as_zip "${PU_REPORTS}/siw-test-results" "test-results-page-unit.zip"
    fi
    if [ -f "${SIW_PLAYWRIGHT_DIR}/build2/page-unit-report.html" ]; then
      log_extra_file "${SIW_PLAYWRIGHT_DIR}/build2/page-unit-report.html"
    fi
    set -e
  finish_log_group 0

  if [ ${PAGE_UNIT_EXIT} -ne 0 ]; then
    echo "siw-playwright: page-unit reported failure — see page-unit-report.html and artifacts."
    exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
  fi
  exit ${PUBLISH_TYPE_AND_RESULT_DIR}
fi

# ---- Run e2e (all gens) ---------------------------------------------------
# Unset SIW_GEN so gens 1, 2 and 3 all run. e2e.sh keeps going after a failing
# gen and handles its own environment teardown.
create_log_group "siw-playwright e2e (all gens)"
  # Don't stop on a test failure before artifacts are collected.
  set +e
  (
    export REPO=siw-playwright
    export SIW_OVERRIDE_VERSION
    unset SIW_GEN
    bash "${ENTRYPOINT}"
  )
  E2E_EXIT=$?
  set -e
  echo "siw-playwright e2e.sh exited with ${E2E_EXIT}"
finish_log_group ${E2E_EXIT} || true

# ---- Collect per-gen artifacts + JUnit XMLs (best-effort) -----------------
create_log_group "Collect artifacts"
  set +e
  TOTAL_TESTS=0
  TOTAL_FAILURES=0
  TOTAL_ERRORS=0
  for gen in 1 2 3; do
    JUNIT="${SIW_PLAYWRIGHT_DIR}/siw-junit-results-gen${gen}.xml"
    HTML_DIR="${SIW_PLAYWRIGHT_DIR}/playwright-report-gen${gen}"
    TR_DIR="${SIW_PLAYWRIGHT_DIR}/test-results-gen${gen}"
    if [ -f "${JUNIT}" ]; then
      # Prefix classname with the gen so the same spec in different gens shows
      # up as separate results instead of being merged.
      sed "s|classname=\"|classname=\"gen${gen}/|g" "${JUNIT}" \
        > "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}/$(basename "${JUNIT}")"
      GEN_STATS="$(grep -oE '<testsuites [^>]+' "${JUNIT}" | head -1 \
        | grep -oE '(tests|failures|errors|skipped)="[0-9]+"' \
        | tr -d '"' | paste -sd, -)"
      log_custom_message "Gen ${gen} results" "${GEN_STATS:-<no data>}"
      GEN_TESTS=$(echo "$GEN_STATS" | grep -oE 'tests=[0-9]+' | cut -d= -f2)
      GEN_FAILURES=$(echo "$GEN_STATS" | grep -oE 'failures=[0-9]+' | cut -d= -f2)
      GEN_ERRORS=$(echo "$GEN_STATS" | grep -oE 'errors=[0-9]+' | cut -d= -f2)
      TOTAL_TESTS=$((TOTAL_TESTS + ${GEN_TESTS:-0}))
      TOTAL_FAILURES=$((TOTAL_FAILURES + ${GEN_FAILURES:-0}))
      TOTAL_ERRORS=$((TOTAL_ERRORS + ${GEN_ERRORS:-0}))
    else
      log_custom_message "Gen ${gen} results" "<no JUnit output — gen may have crashed before tests ran>"
    fi
    if [ -d "${HTML_DIR}" ]; then
      log_extra_dir_as_zip "${HTML_DIR}" "playwright-report-gen${gen}.zip"
    fi
    if [ -d "${TR_DIR}" ]; then
      log_extra_dir_as_zip "${TR_DIR}" "test-results-gen${gen}.zip"
    fi
  done
  if [ -f "${SIW_PLAYWRIGHT_DIR}/e2e-report.html" ]; then
    log_extra_file "${SIW_PLAYWRIGHT_DIR}/e2e-report.html"
  fi
  log_custom_message "Total (all gens)" "tests=${TOTAL_TESTS} failures=${TOTAL_FAILURES} errors=${TOTAL_ERRORS}"
  set -e
finish_log_group 0

if [ ${E2E_EXIT} -ne 0 ]; then
  echo "siw-playwright: e2e reported failure — see e2e-report.html and per-gen artifacts."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
