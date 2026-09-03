#!/bin/bash
# IE11 pre-merge compatibility check (warn-only).
#
# Currently runs one layer:
#   L1.5 - scripts/check-polyfill-coverage.js - AST-walks v1/v2 source and warns
#          on unpolyfilled IE11-unsafe API usage. Closes the 2022 findIndex gap
#          (OKTA-549514) that eslint-plugin-compat cannot see.
#
# A previous revision also ran L2 (es-check on the IE11_COMPAT_MODE-built
# bundle, closing the 2025 ALTCHA gap in PR #3884 / OKTA-1029921). L2 was
# dropped from this PR because es-check's transitive deps (commander@12,
# color@5, ...) require Node >=18 while SIW's scripts/setup.sh pins Node
# 16.19.1. Re-add L2 once setup.sh moves to Node 18+; tracked as a follow-up.
#
# Warn-only per team decision: this script always exits 0 so the Bacon suite
# doesn't block merges while we build trust in the signal. Bacon status is
# also OPTIONAL as belt-and-suspenders.

# Early diagnostic so we see the script started even if setup.sh explodes.
echo "[ie11-compat-check] script starting; OKTA_HOME=${OKTA_HOME:-<unset>} REPO=${REPO:-<unset>}"

# Bacon-side setup (present in CI, absent locally). setup.sh sets `set -eo
# pipefail` which we relax right after so a non-zero exit from the check
# doesn't abort before the summary.
if [ -n "${OKTA_HOME:-}" ] && [ -f "${OKTA_HOME}/${REPO:-}/scripts/setup.sh" ]; then
  source "${OKTA_HOME}/${REPO}/scripts/setup.sh"
  cd "${OKTA_HOME}/${REPO}"
fi
set +eo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==========================================================="
echo "IE11 compatibility check (warn-only)"
echo "==========================================================="
echo ""

echo "--- L1.5: source polyfill coverage (v1/v2) ---"
node scripts/check-polyfill-coverage.js
SRC_STATUS=$?
echo ""

echo "==========================================================="
echo "L1.5 source polyfill coverage : exit=$SRC_STATUS"
echo "==========================================================="

if [ "$SRC_STATUS" -ne 0 ]; then
  echo ""
  echo "WARNING: IE11 compatibility issues detected in v1/v2 source."
  echo "         See the section above for detail."
  echo "         This check is warn-only and does not block merge."
  echo "         Escalate to owner (SIW: Client SDKs) if unclear."
fi

# Warn-only: always exit 0. Bacon suite is also marked OPTIONAL.
exit 0
