#!/bin/bash

# ============================================================================
# siw-playwright: post-publish regression against the just-published SIW
# ============================================================================
# Runs one of siw-playwright's suites against the SIW version we just published,
# selected by SIW_PLAYWRIGHT_SUITE (set per Bacon suite in .bacon.yml):
#
#   e2e (default) — .bacon/e2e.sh: gen 1/2/3 against a dockolith monolith with
#                   our tarball docker-cp'd in. Catches gen-3 (Odyssey)
#                   regressions that don't surface in the widget's own testcafe /
#                   v3 suites — those exercise the widget in isolation, while this
#                   exercises it inside a monolith-hosted org.
#   page-unit     — .bacon/page-unit.sh: ~140 mock-backend page tests (gen 2/3
#                   identify, password, email, GA, authenticator selection,
#                   unlock, recovery) with siw-playwright's SIW pin swapped for
#                   our version. No monolith needed.
#
# Prereq: `publish` (which runs `ci-append-sha` + `npm publish` and then
# `upload_job_data global artifact_version` — that's how we get the just-
# published version here). MAINLINE-only, non-blocking for widget merges.
#
# Behavior:
#   - Downloads the widget artifact_version from S3 (uploaded by publish.sh)
#   - Clones the sibling siw-playwright repo
#   - Invokes the selected entrypoint with SIW_OVERRIDE_VERSION set and
#     TEST_SUITE_TYPE pre-exported, so it leaves Bacon reporting to us and
#     exits plain 0/1
#   - Copies its JUnit into TEST_RESULT_FILE_DIR and uploads reports/traces as
#     Bacon artifacts
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

# ---- Tell Bacon this is a JUnit-reporting suite ---------------------------
# Same pattern e2e-monolith.sh uses (scripts/e2e-monolith.sh:6-9). Populating
# TEST_RESULT_FILE_DIR with the JUnit XMLs (later, after the entrypoint runs)
# is what makes Bacon's Test Result panel show per-test rows instead of
# "0/0 methods passed".
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/junit"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE
mkdir -p "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}"

# Only node is needed here (for the entrypoint's fallback when nvm is absent) — skip
# setup.sh's full widget `yarn install`, since this suite never builds the widget.
if ! setup_service node v22.22.3 &> /dev/null; then
  echo "Failed to install node"
  exit ${FAILED_SETUP}
fi

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
  # `prereq: publish` in .bacon.yml guarantees publish ran, but publish.sh:61-66
  # treats an upload_job_data failure as non-fatal — so a missing value here
  # means publish succeeded without recording its version. Fail setup loudly.
  if ! download_job_data global artifact_version WIDGET_ARTIFACT_VERSION okta-signin-widget "${COMMIT_SHA}"; then
    echo "Failed to download artifact_version for ${COMMIT_SHA} — publish should"
    echo "have uploaded it via upload_job_data (publish.sh:61). Check the publish"
    echo "suite result for this SHA."
    exit ${FAILED_SETUP}
  fi
  # Format from publish.sh:60 is `<pkgname>@<pkgsemver>`, and pkgname itself
  # starts with `@` (`@okta/okta-signin-widget`) — version is after the last `@`.
  SIW_OVERRIDE_VERSION="${WIDGET_ARTIFACT_VERSION##*@}"
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
# `git clone`. Placed under OKTA_HOME so the entrypoint's OKTA_HOME/REPO resolution
# works when we override REPO below. SIW_PLAYWRIGHT_REF is an env-var escape
# hatch to pin against a specific branch or tag (not a SHA — `clone --branch`).
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
  ENTRYPOINT="${SIW_PLAYWRIGHT_DIR}/.bacon/${SIW_PLAYWRIGHT_SUITE}.sh"
  if [[ ! -f "${ENTRYPOINT}" ]]; then
    echo "siw-playwright@${SIW_PLAYWRIGHT_REF} has no .bacon/${SIW_PLAYWRIGHT_SUITE}.sh — entrypoint moved?"
    exit ${FAILED_SETUP}
  fi
  # An entrypoint that predates the external-caller contract ignores
  # SIW_OVERRIDE_VERSION and tests siw-playwright's own pinned SIW — a green run
  # that never touched our build. Refuse rather than mislead.
  if ! grep -q 'SIW_OVERRIDE_VERSION' "${ENTRYPOINT}"; then
    echo "siw-playwright@${SIW_PLAYWRIGHT_REF} .bacon/${SIW_PLAYWRIGHT_SUITE}.sh doesn't support"
    echo "SIW_OVERRIDE_VERSION — it would test its pinned SIW, not ${SIW_OVERRIDE_VERSION}."
    exit ${FAILED_SETUP}
  fi
finish_log_group $?

if [[ "${SIW_PLAYWRIGHT_SUITE}" == "page-unit" ]]; then
  # ---- Invoke siw-playwright's .bacon/page-unit.sh ------------------------
  # page-unit.sh swaps siw-playwright's root `resolutions` SIW pin for
  # SIW_OVERRIDE_VERSION, installs, and fails setup if the installed version
  # doesn't match. TEST_SUITE_TYPE is already exported, so it skips its own
  # Bacon reporting and exits plain SUCCESS/FAILURE. COVERAGE stays unset —
  # coverage is siw-playwright's own merge-gate concern, not this suite's.
  #
  # siw-playwright's .yarnrc.yml resolves @okta packages from
  # OKTA_NPM_REGISTRY_SERVER (default npm-okta-all). On this runner a topic
  # build like 7.51.0-g<sha> failed with "No candidates found": the runner's
  # @okta registry is npm-okta-release, which only holds release versions.
  # Pin the registry explicitly, choosing it the same way siw-playwright's
  # scripts/dockolith/setup.sh does: strict semver -> npm-okta-release,
  # anything else -> npm-okta-all (which includes npm-topic, where publish.sh
  # pushes).
  if [[ -z "${ARTIFACTORY_URL:-}" ]]; then
    echo "ARTIFACTORY_URL is not set; can't point siw-playwright at the published SIW."
    exit ${FAILED_SETUP}
  fi
  if [[ "${SIW_OVERRIDE_VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    SIW_NPM_REPO="npm-okta-release"
  else
    SIW_NPM_REPO="npm-okta-all"
  fi
  echo "Resolving @okta packages from ${SIW_NPM_REPO} (runner had OKTA_NPM_REGISTRY_SERVER='${OKTA_NPM_REGISTRY_SERVER:-<unset>}', NPM_TOKEN $([[ -n "${NPM_TOKEN:-}" ]] && echo set || echo unset))"
  create_log_group "siw-playwright page-unit"
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

  # ---- Collect artifacts + JUnit XML --------------------------------------
  # page-unit.sh writes, under build2/:
  #   - reports/playwright/siw-junit-results.xml  (Bacon-parseable test data)
  #   - page-unit-report.html                     (self-contained, renders in Log Viewer)
  #   - reports/playwright/siw-html-report/       (Playwright's SPA)
  #   - reports/playwright/siw-test-results/      (traces, videos, screenshots; failures only)
  # Best-effort, same as the e2e collection below.
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

# ---- Invoke siw-playwright's .bacon/e2e.sh --------------------------------
# The entrypoint reads OKTA_HOME + REPO to `cd` into itself, and picks up
# SIW_OVERRIDE_VERSION via scripts/dockolith/setup.sh to inject our tarball
# into the monolith. Unset SIW_GEN so all three gens run sequentially against
# one shared dockolith (default behavior we shipped in OKTA-1264739).
# Because TEST_SUITE_TYPE is already exported, e2e.sh leaves Bacon reporting to
# us (no TEST_*_FILE writes) and exits plain SUCCESS/FAILURE. It also owns
# dockolith teardown via its own EXIT trap.
create_log_group "siw-playwright e2e (all gens)"
  # e2e.sh has its own `set -e`-free semantics for the gen loop (continue-on-
  # failure across gens) — we mirror that here so we don't short-circuit on the
  # entrypoint's non-zero exit before we've collected artifacts. Subshell keeps
  # the REPO override from leaking into the rest of this script.
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

# ---- Collect per-gen artifacts + JUnit XMLs -------------------------------
# e2e.sh writes:
#   - siw-junit-results-gen{N}.xml  (Bacon-parseable test data)
#   - e2e-report.html               (self-contained aggregate, renders in Log Viewer)
#   - playwright-report-gen{N}/     (Playwright's SPA — blank in Log Viewer, useful when downloaded)
#   - test-results-gen{N}/          (traces, videos, screenshots)
# JUnit XMLs go into TEST_RESULT_FILE_DIR so Bacon picks them up via the
# PUBLISH_TYPE_AND_RESULT_DIR exit code. Everything else is a log-only artifact.
# Best-effort: a truncated XML or failed upload must not abort the script under
# `set -e` — that would skip later gens' artifacts and lose the publish exit code.
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
      # Bacon keys test rows on classname+name and ignores hostname, so the same
      # spec across gens collapses into one row (21 testcases -> testsRun=7) and
      # one gen's pass can mask another's failure. Prefix classname with the gen.
      sed "s|classname=\"|classname=\"gen${gen}/|g" "${JUNIT}" \
        > "${OKTA_HOME}/${TEST_RESULT_FILE_DIR}/$(basename "${JUNIT}")"
      # Parse per-gen totals from the root <testsuites tests="N" failures="M" skipped="P">
      # tag for the Custom Messages panel.
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
  # Aggregate self-contained HTML (renders inside Bacon's Log Viewer, unlike
  # playwright-report-gen*/index.html which is a fetch-based SPA).
  if [ -f "${SIW_PLAYWRIGHT_DIR}/e2e-report.html" ]; then
    log_extra_file "${SIW_PLAYWRIGHT_DIR}/e2e-report.html"
  fi
  log_custom_message "Total (all gens)" "tests=${TOTAL_TESTS} failures=${TOTAL_FAILURES} errors=${TOTAL_ERRORS}"
  set -e
finish_log_group 0

# ---- Preserve the entrypoint's pass/fail signal ---------------------------
# PUBLISH_TYPE_AND_RESULT_DIR{_BUT_ALWAYS_FAIL} tells Bacon to publish
# TEST_RESULT_FILE_DIR's JUnit contents and set the suite result accordingly —
# same pattern e2e-monolith.sh uses on lines 58 and 88.
if [ ${E2E_EXIT} -ne 0 ]; then
  echo "siw-playwright: e2e reported failure — see e2e-report.html and per-gen artifacts."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
