#!/bin/bash

# ============================================================================
# siw-playwright: post-publish smoke against dockolith
# ============================================================================
# Runs siw-playwright's e2e suite against the SIW tarball we just published.
# Catches gen-3 (Odyssey) regressions that don't surface in the widget's own
# testcafe / v3 suites — those exercise the widget in isolation, while this
# exercises it inside a monolith-hosted org via the isolated Playwright fixtures
# in siw-playwright.
#
# Prereq: `publish` (which runs `ci-append-sha` + `npm publish` and then
# `upload_job_data global artifact_version` — that's how we get the just-
# published version here). MAINLINE-only, non-blocking for widget merges.
#
# Behavior:
#   - Downloads the widget artifact_version from S3 (uploaded by publish.sh)
#   - Clones the sibling siw-playwright repo
#   - Invokes its .bacon/e2e.sh with SIW_OVERRIDE_VERSION set — that script
#     spins up dockolith once, loops SIW_GEN=1,2,3 with the tarball docker-cp'd
#     into the monolith, and reports pass/fail per gen with continue-on-failure
#   - Uploads per-gen playwright-report / test-results dirs as Bacon artifacts
# ============================================================================

set -eo pipefail

: "${OKTA_HOME:?OKTA_HOME must be set}"
: "${REPO:?REPO must be set}"

# ---- Tell Bacon this is a JUnit-reporting suite ---------------------------
# Same pattern e2e-monolith.sh uses (scripts/e2e-monolith.sh:6-9). Populating
# TEST_RESULT_FILE_DIR with the per-gen JUnit XMLs (later, after e2e.sh runs)
# is what makes Bacon's Test Result panel show per-test rows instead of
# "0/0 methods passed".
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE
mkdir -p "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}"

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

# ---- Resolve the widget version published in this pipeline ----------------
# publish.sh writes `<pkgname>@<pkgsemver>` to global scope via `upload_job_data`.
# For a topic build like this one, pkgsemver looks like `7.48.2-g<sha>`. Strict
# 3-digit semvers only happen on the release train, which doesn't currently run
# through this suite.
create_log_group "Resolve widget artifact version"
  COMMIT_SHA="$(git -C ${OKTA_HOME}/${REPO} rev-parse HEAD)"
  echo "Fetching artifact_version for commit ${COMMIT_SHA}..."
  # download_job_data's third arg is a bash out-parameter — the helper writes
  # into the named variable via eval/declare, and its precondition check
  # ("The third parameter must be a name of a var that has been set!") requires
  # the variable to already exist. Initialize to empty first — mirrors the
  # downstream/create-downstream-for-*.sh convention where the caller declares
  # upstream_artifact_version before the call.
  WIDGET_ARTIFACT_VERSION=""
  # `prereq: publish` in .bacon.yml guarantees publish ran, and publish.sh:61
  # unconditionally uploads artifact_version on npm-publish success — so a
  # download failure here is a real error, not a "no publish, skip" case.
  if ! download_job_data global artifact_version WIDGET_ARTIFACT_VERSION okta-signin-widget "${COMMIT_SHA}"; then
    echo "Failed to download artifact_version for ${COMMIT_SHA} — publish should"
    echo "have uploaded it via upload_job_data (publish.sh:61). Check the publish"
    echo "suite result for this SHA."
    exit ${FAILED_SETUP}
  fi
  # Format from publish.sh:60 is `<pkgname>@<pkgsemver>`. pkgname itself contains
  # an `@` (`@okta/okta-signin-widget`), so `@` shows up 3× total — version is field 3.
  SIW_OVERRIDE_VERSION="$(echo "${WIDGET_ARTIFACT_VERSION}" | cut -d'@' -f3)"
  if [[ -z "${SIW_OVERRIDE_VERSION}" ]]; then
    echo "Failed to parse version from artifact_version='${WIDGET_ARTIFACT_VERSION}'."
    exit ${FAILED_SETUP}
  fi
  echo "SIW version under test: ${SIW_OVERRIDE_VERSION}"
  log_custom_message "SIW version tested" "${SIW_OVERRIDE_VERSION}"
finish_log_group $?

# ---- Clone siw-playwright -------------------------------------------------
# siw-playwright lives in a separate private GitHub org, so we ask the
# Bacon-provided token helper to install the credential redirect before
# `git clone`. Placed under OKTA_HOME so e2e.sh's OKTA_HOME/REPO resolution
# works when we override REPO below. SIW_PLAYWRIGHT_REF is an env-var escape
# hatch to pin against a specific branch/tag/SHA when needed.
SIW_PLAYWRIGHT_REF="${SIW_PLAYWRIGHT_REF:-main}"
create_log_group "Clone siw-playwright"
  SIW_PLAYWRIGHT_DIR="${OKTA_HOME}/siw-playwright"
  rm -rf "${SIW_PLAYWRIGHT_DIR}"
  if command -v setup_github_token >/dev/null 2>&1; then
    setup_github_token atko-eng "" force
  else
    echo "setup_github_token not available; relying on ambient credentials."
  fi
  if ! git clone --depth 1 --branch "${SIW_PLAYWRIGHT_REF}" https://github.com/atko-eng/siw-playwright.git "${SIW_PLAYWRIGHT_DIR}"; then
    echo "git clone failed — check auth setup on this runner."
    exit ${FAILED_SETUP}
  fi
  echo "siw-playwright cloned at $(git -C "${SIW_PLAYWRIGHT_DIR}" rev-parse --short HEAD)"
finish_log_group $?

# ---- Invoke siw-playwright's .bacon/e2e.sh --------------------------------
# The entrypoint reads OKTA_HOME + REPO to `cd` into itself, and picks up
# SIW_OVERRIDE_VERSION via scripts/dockolith/setup.sh to inject our tarball
# into the monolith. Unset SIW_GEN so all three gens run sequentially against
# one shared dockolith (default behavior we shipped in OKTA-1264739).
create_log_group "siw-playwright e2e (all gens)"
  export REPO=siw-playwright
  export SIW_OVERRIDE_VERSION
  unset SIW_GEN
  # e2e.sh has its own `set -e`-free semantics for the gen loop (continue-on-
  # failure across gens) — we mirror that here so we don't short-circuit on the
  # entrypoint's non-zero exit before we've collected artifacts.
  set +e
  bash "${SIW_PLAYWRIGHT_DIR}/.bacon/e2e.sh"
  E2E_EXIT=$?
  set -e
  echo "siw-playwright e2e.sh exited with ${E2E_EXIT}"
finish_log_group ${E2E_EXIT} || true

# ---- Collect per-gen artifacts + JUnit XMLs -------------------------------
# e2e.sh writes:
#   - siw-junit-results-gen{N}.xml  (Bacon-parseable test data)
#   - e2e-report.html               (self-contained aggregate, renders in Log Viewer)
#   - playwright-report-gen{N}/     (Playwright's SPA — blank in Log Viewer, useful when downloaded)
#   - test-results-gen{N}/          (traces, videos, screenshots)
# JUnit XMLs go into TEST_RESULT_FILE_DIR so Bacon picks them up via the
# PUBLISH_TYPE_AND_RESULT_DIR exit code. Everything else is a log-only artifact.
create_log_group "Collect artifacts"
  TOTAL_TESTS=0
  TOTAL_FAILURES=0
  for gen in 1 2 3; do
    JUNIT="${SIW_PLAYWRIGHT_DIR}/siw-junit-results-gen${gen}.xml"
    HTML_DIR="${SIW_PLAYWRIGHT_DIR}/playwright-report-gen${gen}"
    TR_DIR="${SIW_PLAYWRIGHT_DIR}/test-results-gen${gen}"
    if [ -f "${JUNIT}" ]; then
      cp "${JUNIT}" "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}/"
      # Parse per-gen totals from the root <testsuites tests="N" failures="M" skipped="P">
      # tag for the Custom Messages panel.
      GEN_STATS="$(grep -oE '<testsuites [^>]+' "${JUNIT}" | head -1 \
        | grep -oE '(tests|failures|skipped)="[0-9]+"' \
        | tr -d '"' | paste -sd, -)"
      log_custom_message "Gen ${gen} results" "${GEN_STATS:-<no data>}"
      GEN_TESTS=$(echo "$GEN_STATS" | grep -oE 'tests=[0-9]+' | cut -d= -f2)
      GEN_FAILURES=$(echo "$GEN_STATS" | grep -oE 'failures=[0-9]+' | cut -d= -f2)
      TOTAL_TESTS=$((TOTAL_TESTS + ${GEN_TESTS:-0}))
      TOTAL_FAILURES=$((TOTAL_FAILURES + ${GEN_FAILURES:-0}))
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
  # Aggregate self-contained HTML (renders inside Bacon's Log Viewer, unlike
  # playwright-report-gen*/index.html which is a fetch-based SPA).
  if [ -f "${SIW_PLAYWRIGHT_DIR}/e2e-report.html" ]; then
    log_extra_file "${SIW_PLAYWRIGHT_DIR}/e2e-report.html"
  fi
  log_custom_message "Total (all gens)" "tests=${TOTAL_TESTS} failures=${TOTAL_FAILURES}"
finish_log_group $?

# ---- Preserve the entrypoint's pass/fail signal ---------------------------
# PUBLISH_TYPE_AND_RESULT_DIR{_BUT_ALWAYS_FAIL} tells Bacon to publish
# TEST_RESULT_FILE_DIR's JUnit contents and set the suite result accordingly —
# same pattern e2e-monolith.sh uses on lines 58 and 88.
if [ ${E2E_EXIT} -ne 0 ]; then
  echo "siw-playwright: e2e reported failure — see e2e-report.html and per-gen artifacts."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
