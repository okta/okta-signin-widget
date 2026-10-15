#!/bin/bash

# ============================================================================
# siw-playwright: post-publish regression against the just-published SIW
# ============================================================================
# Runs one of siw-playwright's suites against the SIW version published by the
# `publish` suite. SIW_PLAYWRIGHT_SUITE picks which one:
#
#   e2e (default) — gen 1/2/3 end-to-end specs against a locally hosted org
#                   with our build installed.
#   page-unit     — gen 2/3 page tests against a mocked backend, with
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

# Comma-separated tests/failures/errors/skipped from a JUnit file's root tag.
junit_stats() {
  grep -oE '<testsuites [^>]+' "$1" | head -1 \
    | grep -oE '(tests|failures|errors|skipped)="[0-9]+"' \
    | tr -d '"' | paste -sd, -
}

# Exit code for a failed entrypoint run. A run that produced no JUnit at all
# never got to the tests (install, registry, environment start), so report it
# as a setup failure rather than a test failure with zero results.
failure_exit_code() {
  local -r entrypoint_exit="$1" junit_count="$2"
  if [[ ${entrypoint_exit} -eq ${FAILED_SETUP} || ${junit_count} -eq 0 ]]; then
    echo "${FAILED_SETUP}"
  else
    echo "${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}"
  fi
}

# Fail the run if the entrypoint didn't actually test SIW_OVERRIDE_VERSION.
# The pre-run grep only shows the entrypoint knows about the variable; this
# checks the override took effect.
require_override_applied() {
  local -r what="$1" actual="$2"
  if [[ "${actual}" != "${SIW_OVERRIDE_VERSION}" ]]; then
    echo "siw-playwright: ${what} was '${actual:-<missing>}', expected ${SIW_OVERRIDE_VERSION}."
    echo "The run did not test the published build."
    log_custom_message "SIW override not applied" "${what}: '${actual:-<missing>}', expected ${SIW_OVERRIDE_VERSION}" || true
    exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
  fi
}

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE
mkdir -p "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}"

# Fallback node for runners without nvm; the entrypoints switch to the
# version in siw-playwright's .nvmrc themselves.
if ! setup_service node v22.22.3 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

# ---- Resolve the widget version published for this commit -----------------
create_log_group "Resolve widget artifact version"
  COMMIT_SHA="$(git -C "${OKTA_HOME}/${REPO}" rev-parse HEAD)"
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
  if [[ ! "${SIW_OVERRIDE_VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]]; then
    echo "Failed to parse a version from artifact_version='${WIDGET_ARTIFACT_VERSION}'."
    exit ${FAILED_SETUP}
  fi
  echo "SIW version under test: ${SIW_OVERRIDE_VERSION}"
  log_custom_message "SIW version tested" "${SIW_OVERRIDE_VERSION}" || true
finish_log_group $?

# ---- Clone siw-playwright -------------------------------------------------
# SIW_PLAYWRIGHT_REF optionally pins a branch or tag (not a SHA).
SIW_PLAYWRIGHT_REF="${SIW_PLAYWRIGHT_REF:-main}"
create_log_group "Clone siw-playwright"
  SIW_PLAYWRIGHT_DIR="${OKTA_HOME}/siw-playwright"
  rm -rf "${SIW_PLAYWRIGHT_DIR}"
  if command -v setup_github_token >/dev/null 2>&1; then
    if ! setup_github_token atko-eng "" force; then
      echo "GitHub token setup failed."
      exit ${FAILED_SETUP}
    fi
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
  # Cheap early check; require_override_applied verifies the result after the run.
  if ! grep -q 'SIW_OVERRIDE_VERSION' "${ENTRYPOINT}"; then
    echo "siw-playwright@${SIW_PLAYWRIGHT_REF} .bacon/${SIW_PLAYWRIGHT_SUITE}.sh doesn't support"
    echo "SIW_OVERRIDE_VERSION — it would test its pinned SIW, not ${SIW_OVERRIDE_VERSION}."
    exit ${FAILED_SETUP}
  fi
finish_log_group $?

if [[ "${SIW_PLAYWRIGHT_SUITE}" == "page-unit" ]]; then
  # ---- Run page-unit ------------------------------------------------------
  # Our builds are x.y.z-g<sha>, which only npm-okta-all has, so point
  # siw-playwright's @okta registry there. A strict semver would come from
  # npm-okta-release (same split as siw-playwright's dockolith setup).
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
    JUNIT_COUNT=0
    if [ -f "${JUNIT}" ]; then
      JUNIT_COUNT=1
      cp "${JUNIT}" "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}/"
      PU_STATS="$(junit_stats "${JUNIT}")"
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
    exit "$(failure_exit_code "${PAGE_UNIT_EXIT}" "${JUNIT_COUNT}")"
  fi
  INSTALLED_SIW="$(node -p 'require(process.argv[1]).version' \
    "${SIW_PLAYWRIGHT_DIR}/node_modules/@okta/okta-signin-widget/package.json" 2>/dev/null || true)"
  require_override_applied "installed @okta/okta-signin-widget" "${INSTALLED_SIW}"
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
  JUNIT_COUNT=0
  for gen in 1 2 3; do
    JUNIT="${SIW_PLAYWRIGHT_DIR}/siw-junit-results-gen${gen}.xml"
    HTML_DIR="${SIW_PLAYWRIGHT_DIR}/playwright-report-gen${gen}"
    TR_DIR="${SIW_PLAYWRIGHT_DIR}/test-results-gen${gen}"
    if [ -f "${JUNIT}" ]; then
      JUNIT_COUNT=$((JUNIT_COUNT + 1))
      # Prefix classname with the gen so the same spec in different gens shows
      # up as separate results instead of being merged.
      sed "s|classname=\"|classname=\"gen${gen}/|g" "${JUNIT}" \
        > "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}/$(basename "${JUNIT}")"
      GEN_STATS="$(junit_stats "${JUNIT}")"
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
  exit "$(failure_exit_code "${E2E_EXIT}" "${JUNIT_COUNT}")"
fi
# siw-playwright's dockolith setup stages the override build here before
# copying it into the monolith; no staged build means the monolith ran its own.
if [[ -d "${SIW_PLAYWRIGHT_DIR}/.tmp/siw-override/staged/${SIW_OVERRIDE_VERSION}" ]]; then
  STAGED_SIW="${SIW_OVERRIDE_VERSION}"
else
  STAGED_SIW=""
fi
require_override_applied "staged SIW build" "${STAGED_SIW}"
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
