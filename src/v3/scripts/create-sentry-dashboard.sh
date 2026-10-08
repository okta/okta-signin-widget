#!/usr/bin/env bash
#
# Recreate the SIW gen3 "auth-flow POC" Sentry dashboard entirely from code.
#
# Dashboard-as-code for easy migration: to stand the dashboard up in a different
# Sentry org (or after someone deletes it), just run this against that org. It
# builds the widgets from the per-step tracing POC (see sentryTracePoc.ts),
# ordered strongest-first: latency-per-authenticator (the lead), then mix and
# volume, then an explicitly APPROXIMATE drop-off view (not a true funnel).
#
# Requirements:
#   - the `sentry` CLI (https://cli.sentry.dev), authenticated: `sentry auth login`
#   - jq
#
# Usage:
#   ORG=okta-prod ./create-sentry-dashboard.sh
#   ORG=my-dev-org TITLE='SIW funnel (dev)' ./create-sentry-dashboard.sh
#
# Notes:
#   - Re-running creates a NEW dashboard each time (the CLI has no upsert); delete
#     the old one in the UI if you want a single copy.
#   - Widgets query the Spans dataset and isolate our data via span.op (auth.flow /
#     auth.step / auth.flow.total), so no project filter is required.
#   - `factor` is the scrub-safe authenticator tag (okta-prod redacts "auth*"); the
#     latency widget additionally groups by `authenticatorKey`, which only shows
#     real values if the target project's data scrubbing is relaxed.
set -euo pipefail

ORG="${ORG:-okta-prod}"
TITLE="${TITLE:-SIW gen3 auth-flow POC}"

command -v sentry >/dev/null || { echo "error: 'sentry' CLI not found (https://cli.sentry.dev)"; exit 1; }
command -v jq >/dev/null || { echo "error: 'jq' not found"; exit 1; }

echo "Creating dashboard '${TITLE}' in org '${ORG}'…"
DID="$(sentry dashboard create "${ORG}/" "${TITLE}" --json | jq -r '.id')"
[ -n "${DID}" ] && [ "${DID}" != "null" ] || { echo "error: failed to create dashboard"; exit 1; }
echo "dashboard id = ${DID}"

add() { sentry dashboard widget add "${ORG}/" "${DID}" "$@" >/dev/null && echo "  + $1"; }

# Row 1 — THE LEAD: latency per authenticator (the strength — real APM, live, exact-shape).
# End-to-end "human" latency per method, then per-step request latency.
add "Total Human Experience Latency (End-to-End) by authenticator" --display table --dataset spans \
  --query "p50:span.duration" --query "p95:span.duration" --query "p99:span.duration" \
  --where "span.op:auth.flow.total" --group-by authenticatorKey
add "Per-step duration (p95)" --display line --dataset spans \
  --query "p95:span.duration" --where "span.op:auth.step" --group-by step

# Row 2 — mix (relative counts; honest as ratios, not exact totals)
add "Authenticator mix" --display bar --dataset spans \
  --query count --where "span.op:auth.step has:factor" --group-by factor --sort=-count
add "Outcome mix" --display bar --dataset spans \
  --query count --where "span.op:auth.step has:outcome" --group-by outcome --sort=-count

# Row 3 — volume (big numbers; sampled estimates)
add "Flows started" --display big_number --dataset spans \
  --query count --where "span.op:auth.flow"
add "Success (final steps)" --display big_number --dataset spans \
  --query count --where "span.op:auth.step outcome:success"
add "Errors (final steps)" --display big_number --dataset spans \
  --query count --where "span.op:auth.step outcome:error"

# Row 4 — APPROXIMATE drop-off (directional only: not ordered, sampled, client-survivorship).
# Kept last + explicitly labeled so it reads as a caveated extra, not a true funnel.
add "Approx. drop-off (reach per step)" --display categorical_bar --dataset spans \
  --query count --where 'span.op:[auth.flow,auth.step] !step:"[Filtered]" !step:""' \
  --group-by step --sort=-count
add "Approx. drop-off trend (per day)" --display bar --dataset spans \
  --query count --where "span.op:[auth.flow,auth.step]" --group-by step

echo "Done -> https://${ORG}.sentry.io/dashboard/${DID}/"
