#!/bin/bash
# IE11 pre-merge compatibility check (warn-only).
#
# Two layers:
#   L1.5 — scripts/check-polyfill-coverage.js — AST-walks v1/v2 source and warns
#          on unpolyfilled IE11-unsafe API usage. Closes the 2022 findIndex gap
#          (OKTA-549514) that eslint-plugin-compat cannot see.
#   L2   — es-check on the IE11_COMPAT_MODE-built bundle. Catches modern JS
#          syntax that survives Babel from third-party deps. Closes the 2025
#          ALTCHA gap (PR #3884, OKTA-1029921).
#
# Warn-only per team decision: this script always exits 0 so the Bacon suite
# doesn't block merges while we build trust in the signal. Bacon status is
# also OPTIONAL as belt-and-suspenders.

# Early diagnostic so we see the script started even if setup.sh explodes.
echo "[ie11-compat-check] script starting; OKTA_HOME=${OKTA_HOME:-<unset>} REPO=${REPO:-<unset>}"

# Bacon-side setup (present in CI, absent locally). setup.sh sets `set -eo
# pipefail` which we relax right after so the `cmd; STATUS=$?` capture pattern
# below works and L2 runs even if L1.5 flags issues.
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

# ---- Layer 1.5 - source polyfill coverage ----
echo "--- L1.5: source polyfill coverage (v1/v2) ---"
node scripts/check-polyfill-coverage.js
SRC_STATUS=$?
echo ""

# ---- Layer 2 — bundle syntax (es-check) ----
echo "--- L2: bundle syntax (es-check on IE11_COMPAT_MODE build) ---"
if ! command -v yarn >/dev/null 2>&1; then
  echo "[ie11-compat-check] yarn not on PATH; skipping bundle build"
  BUNDLE_STATUS=0
else
  # Build the IE11-targeted bundles.
  echo "[ie11-compat-check] building bundles with IE11_COMPAT_MODE=true..."
  if IE11_COMPAT_MODE=true yarn build:webpack-dev; then
    BUNDLES=(
      target/js/okta-sign-in.classic.js
      target/js/okta-sign-in.oie.js
      target/js/okta-sign-in.js
    )

    # Only pass bundles that actually exist (some entry configs skip some outputs).
    EXISTING_BUNDLES=()
    for b in "${BUNDLES[@]}"; do
      if [ -f "$b" ]; then
        EXISTING_BUNDLES+=("$b")
      else
        echo "[ie11-compat-check] skipping missing bundle: $b"
      fi
    done

    if [ "${#EXISTING_BUNDLES[@]}" -eq 0 ]; then
      echo "[ie11-compat-check] no bundles found; nothing to scan"
      BUNDLE_STATUS=0
    else
      npx --no-install es-check es5 "${EXISTING_BUNDLES[@]}" --allow-hash-bang --checkFeatures
      BUNDLE_STATUS=$?
    fi
  else
    echo "[ie11-compat-check] IE11_COMPAT_MODE build failed; skipping es-check"
    BUNDLE_STATUS=0
  fi
fi
echo ""

# ---- Summary ----
echo "==========================================================="
echo "L1.5 source polyfill coverage : exit=$SRC_STATUS"
echo "L2  bundle syntax (es-check)  : exit=$BUNDLE_STATUS"
echo "==========================================================="

if [ $SRC_STATUS -ne 0 ] || [ $BUNDLE_STATUS -ne 0 ]; then
  echo ""
  echo "WARNING: IE11 compatibility issues detected."
  echo "         See the two sections above for detail."
  echo "         This check is warn-only and does not block merge."
  echo "         Escalate to owner (SIW: Client SDKs) if unclear."
fi

# Warn-only: always exit 0. Bacon suite is also marked OPTIONAL.
exit 0
