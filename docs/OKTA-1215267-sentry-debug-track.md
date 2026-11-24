# Sentry debug track — gen3 FastPass poll-vs-cancel (OKTA-1215267)

> **Status:** Draft / handoff note. Doc-only — no production code in this PR.
> **Owner:** Shuo Wu (handoff to SIW team before PTO)
> **Related:** commit `432fcc2c4` (OKTA-1215267), FF `ENG_SIW_DISABLE_POLL_DURING_CANCEL`,
> [sync thread](https://okta.slack.com/archives/C0APD8G4P6E/p1783702125087039)

## TL;DR

We want to *observe* the intermittent 400 / "bad request" tail Jon hits on McKinsey
FastPass loopback. It comes from a **poll-vs-cancel race**: `LoopbackProbe`'s auto-cancel
and `usePolling`'s recurring `/poll` fire near-simultaneously, `/cancel` lands first and
deletes the transaction, and the racing `/poll` then 400s. The `ENG_SIW_DISABLE_POLL_DURING_CANCEL`
FF suppresses the race but the race itself is **invisible in Sentry today** — the failing
`proceed()` has no `catch`, so it becomes an unhandled rejection with no context.

**Recommended path:** on the poll/cancel path, surface a single **named, enriched error**
(the `ChromeLNADeniedError` precedent) so the monolith's existing Sentry global handler
captures it, gated behind the existing FF. This needs **no `sentry-wrapper` change**, so it
clears the IE11 won't-do line (see [Feasibility verdict](#feasibility-verdict)). Breadcrumbs
are *not* an option — the monolith `beforeSend` strips them. See
[Recommended approach](#recommended-approach) and the
[field spec](#debug-track-spec--what-to-capture).

## Background — the race

FastPass loopback in gen3 has two independent producers of an `idx.proceed()` against the
same `stateHandle`:

- **`LoopbackProbe`** probes the local OV ports. On failure it auto-cancels:
  - `OV_UNREACHABLE_BY_LOOPBACK` — no port answered
    (`src/v3/src/components/LoopbackProbe/LoopbackProbe.tsx:189-192`)
  - `OV_RETURNED_ERROR` — a port answered `/challenge` with a non-503 error
    (`src/v3/src/components/LoopbackProbe/LoopbackProbe.tsx:160-163`)
- **`usePolling`** fires a recurring `/poll` on a timer
  (`src/v3/src/hooks/usePolling.ts:89-145`).

When the auto-cancel and a scheduled `/poll` overlap, `/cancel` can land first and delete
the transaction; the `/poll` that was already on the wire (or fired inside the cancel
window) then hits a deleted transaction → **400**. `432fcc2c4` closes the window by having
`cancelHandler` claim the shared `pollInFlightRef` so the racing `/poll` is suppressed at
the existing guard — but that only *prevents* the race, it does not *report* when it would
have happened. This is the parity fix for gen2's `stopPolling()` pre-cancel.

In parallel, Trevor is having Jon submit OV logs to confirm whether the `/challenge` even
reaches OV. This doc covers the **widget-side** signal only.

## How SIW reaches Sentry today

There is **no Sentry SDK inside the widget bundle.** A grep of `src/` for
`captureException` / `captureMessage` / `addBreadcrumb` / `window.Sentry` returns nothing.
**Sentry is integrated from the okta-core / loginpage layer (JSP), as a separate bundle
from the widget** — the widget never talks to Sentry directly.

### okta-core wiring

- **FF-gated init.** `loginpage_backbone.jsp` reads the Sentry config behind
  `ENG_ENABLE_LOGINPAGE_SENTRY_CLIENT_SIDE_ERROR_TRACKING` and only when
  `ui.loginpage.sentryio.enabled` is true. It injects a `window.okta.sentry` blob (dsn,
  orgId, ignoreErrors, `filenamesAllowList`, `tracesSampleRate`, …) via
  `analytics/sentry.jsp`, then loads a **separate script**
  `/js/mvc/sentry-wrapper/sentry-wrapper.pack.js`. The widget ships as its own bundle
  (`okta-sign-in.next.js` for gen3, `okta-sign-in.min.js` for gen2).
- **Uncaught-error capture is automatic.** `sentry-wrapper` calls `Sentry.init` without
  disabling default integrations, so `@sentry/browser`'s **GlobalHandlers**
  (`window.onerror` + `window.onunhandledrejection`) is on. An uncaught error / unhandled
  rejection thrown from the widget bundle is captured **without any sentry-wrapper change**.
- **`beforeSend` allowlist.** Events are filtered by a JS **filename allowlist**
  (`ui.loginpage.sentryio.filenamesAllowList`, default
  `["okta-sign-in.min.js","okta-sign-in.next.js"]`). The gen3 bundle `okta-sign-in.next.js`
  is already allowlisted, so widget errors pass. An error whose stack frame is not from an
  allowlisted bundle is dropped.
- **Breadcrumbs are stripped** in `beforeSend` / `beforeSendTransaction`; Referer / URLs are
  sanitized. `sendDefaultPii: false`. `tracesSampleRate` default `0`.
- Precedent for pushing a widget signal into Sentry: `ChromeLNADeniedError` is deliberately
  re-thrown so the global handler picks it up
  (`src/v3/src/util/browserUtils.ts:47`,
  `src/v3/src/transformer/layout/oktaVerify/transformOktaVerifyFPLoopbackPoll.ts:196`,
  `src/util/Errors.ts:89`).

### Sentry SDK version vs IE11 (matters for the verdict)

| Where | `@okta/sentry-wrapper` | `@sentry/browser` | IE11? |
| --- | --- | --- | --- |
| **okta-core (currently shipped)** | `0.0.1-9979-g6da5720` | **`7.80.0`** | Yes — v7 is the last IE11-capable line (ES5 bundle + polyfills) |
| okta-ui HEAD (pending bump) | `0.0.1` | `10.39.0` | **No** — v8+ requires ES2018, dropped IE11 |

Implication: **if a fix required modifying / re-building `sentry-wrapper`, it is effectively
a won't-do** — the forward version (v8/v10) is not IE11-compatible, and SIW still supports
IE11. So any viable approach must work with the *existing, unmodified* `sentry-wrapper`.

## The gap

1. **No `catch` on the racing call.** The poll/cancel `proceed()` calls use `try/finally`
   with no `catch`:
   - `src/v3/src/hooks/usePolling.ts:115-144` — the primary 400 site
   - `src/v3/src/components/LoopbackProbe/LoopbackProbe.tsx:67-74` — `submitHandler`
   - `src/v3/src/components/LoopbackProbe/LoopbackProbe.tsx:98-105` — `cancelHandler`

   The 400 rejects the promise and becomes an **unhandled rejection**. Whether that reaches
   Sentry depends on the monolith SDK's `onunhandledrejection` integration *and* whether the
   rejection's stack frame passes the filename allowlist — neither is guaranteed for an
   async `okta-auth-js` rejection.
2. **No race context even if captured.** A generic 400 tells us nothing about *why* — was
   a `/cancel` in flight? which cancel reason? was the FF on? We need structured fields.
3. **Breadcrumbs won't survive.** The natural "sprinkle `addBreadcrumb`" approach is a dead
   end under the current `beforeSend`.

## Feasibility verdict

**Feasible — and it does NOT require touching `sentry-wrapper`.** The recommended approach
below has the widget throw an uncaught, named error; okta-core's *existing, unmodified*
`sentry-wrapper` (currently `@sentry/browser` 7.80.0) captures it via its default
GlobalHandlers, and `okta-sign-in.next.js` is already in the `beforeSend` allowlist. Because
no `sentry-wrapper` change is needed, this stays clear of the IE11 won't-do line.

Caveats to set expectations:

- **Org prerequisites (config, not code):** `ENG_ENABLE_LOGINPAGE_SENTRY_CLIENT_SIDE_ERROR_TRACKING`
  and `ui.loginpage.sentryio.enabled` must be on for the target org (McKinsey). Nothing to
  build if they already are.
- **IE11 sessions:** Sentry works in IE11 *today* (v7). If Jon's repro is IE11 **and** okta-core
  later bumps to the v8/v10 wrapper, IE11 sessions get no Sentry at all — and we must **not**
  try to fix that (making `sentry-wrapper` IE11-compatible is the won't-do). For an IE11 repro,
  lean on the parallel OV-logs path (Trevor's action) instead. FastPass loopback on a McKinsey
  desktop is most likely a modern Chromium/Edge session, where this is moot.
- **Breadcrumbs are out** regardless — `beforeSend` strips them. The signal must ride the error.

## Recommended approach

**Surface one enriched, named error on the poll/cancel path**, gated behind the existing
FF, so the monolith's existing global handler captures it. This reuses the proven
`ChromeLNADeniedError` mechanism, needs **no Sentry SDK in the bundle and no `sentry-wrapper`
change**, and is opt-in / low risk.

- Add a `catch` around the poll/cancel `proceed()` that, when the error indicates the
  cancel-vs-poll condition (400 on a poll step while a `/cancel` is/was in flight),
  constructs a **named error** (e.g. `FastPassPollCancelRaceError`) carrying the
  [fields below](#debug-track-spec--what-to-capture) as own-properties, then re-throws (or
  reports it) so the monolith captures it.
- **Gate it behind `disablePollDuringCancel`** (or a dedicated observability FF) so it can
  be turned on for a target org (McKinsey) and off everywhere else. When the FF also
  *suppresses* the race, capture the **would-have-raced** signal at the guard instead
  (`usePolling.ts:108-110`) — that's the counter that proves the fix is engaging.
- **Confirm the allowlist** includes the gen3 bundle name that ships to the org
  (`okta-sign-in.next.js` per default config) or the event is dropped by `beforeSend`.

### Alternative (larger, cross-team)

Expose a widget-level `onError` / telemetry callback that the monolith wires to
`Sentry.captureException(err, { tags, extra })`. A plain `captureException` call is fine on
the current v7 wrapper (**still no `sentry-wrapper` modification**), gives full control over
tags/context, and bypasses the allowlist ambiguity — but it's a new widget public surface
**plus** okta-core JSP/JS glue, so it's heavier and cross-team. Noted for completeness; the
surface-error approach above is preferred for the first pass. (What we explicitly avoid is
*modifying* `sentry-wrapper` itself — e.g. to preserve breadcrumbs — which is the IE11
won't-do.)

## Debug track — what to capture

Fields to attach to the surfaced error (as own-properties / Sentry `extra` + `tags`). All
values are already in scope at the capture site — cited below.

| Field | Purpose | Source |
| --- | --- | --- |
| `event` = `fastpass_poll_cancel_race` | Stable grouping key / Sentry fingerprint | constant |
| `stepName` + `isPollingStep(stepName)` | Confirms the failing call is a poll step | `usePolling.ts:96-97`, `LoopbackProbe.tsx:59-60` |
| `cancelReason` | `OV_UNREACHABLE_BY_LOOPBACK` vs `OV_RETURNED_ERROR` | `LoopbackProbe.tsx:161`, `190` |
| `challengeStatusCode` | OV `/challenge` HTTP status behind `OV_RETURNED_ERROR` | `LoopbackProbe.tsx:162` |
| `pollInFlight` | shared-ref state at fire time (was a peer call in flight?) | `usePolling.ts:108`, `LoopbackProbe.tsx:61/94` |
| `disableConcurrentPolling` / `disablePollDuringCancel` | which guards were active | `LoopbackProbe.tsx:35-36`, `usePolling.ts:106-107` |
| `proceedStatus` | HTTP status of the failing `proceed` (expect 400) | error from `authClient.idx.proceed` |
| `stateHandlePresent` | boolean only — **do not log the raw handle** (PII) | `LoopbackProbe.tsx:51`, `usePolling.ts:118` |
| `firedFrom` | `usePolling.timer` \| `LoopbackProbe.submitHandler` \| `LoopbackProbe.cancelHandler` | call site |
| `relativeTimingMs` | ms between cancel-fired and poll-fired, if both observed | derived (optional) |

> **Privacy:** `sendDefaultPii: false` is set upstream. Never put the raw `stateHandle`,
> tokens, or user identifiers in `extra` — booleans / status codes / enum reasons only.

## Instrumentation points

| Where | file:line | What to record |
| --- | --- | --- |
| Timer `/poll` `proceed` (primary 400 site) | `usePolling.ts:115-144` | `catch` → surface race error with fields above |
| Guard suppression (FF on) | `usePolling.ts:108-110` | count "would-have-raced" — proves FF is engaging |
| `submitHandler` `proceed` | `LoopbackProbe.tsx:67-74` | `catch` → surface with `firedFrom=submitHandler` |
| `cancelHandler` `proceed` | `LoopbackProbe.tsx:98-105` | record `cancelReason`, `challengeStatusCode`, claim state |
| `OV_UNREACHABLE_BY_LOOPBACK` trigger | `LoopbackProbe.tsx:189-192` | mark cancel cause = no ports |
| `OV_RETURNED_ERROR` trigger | `LoopbackProbe.tsx:160-163` | mark cancel cause + `challengeResponse.status` |

## Privacy & rollout notes

- Keep the capture **behind the FF**; enable for the target org, disabled elsewhere.
- `extra` = booleans, enum reasons, HTTP status codes only. No raw `stateHandle` / tokens / PII.
- Confirm `ui.loginpage.sentryio.filenamesAllowList` covers the gen3 bundle name for the org,
  or `beforeSend` drops the event.
- `tracesSampleRate` stays `0` unless we specifically want transaction-level timing; error
  capture does not need it.
- Remove or leave-off the debug capture once the McKinsey tail is root-caused.

## Open questions / handoff checklist

- [ ] **Do NOT modify `sentry-wrapper`** — the v8/v10 forward version isn't IE11-compatible;
      any approach requiring a wrapper change is a won't-do. Keep to the unmodified wrapper.
- [ ] Confirm `ENG_ENABLE_LOGINPAGE_SENTRY_CLIENT_SIDE_ERROR_TRACKING` +
      `ui.loginpage.sentryio.enabled` are on for the target org (McKinsey).
- [ ] Confirm which browser Jon repros on. If IE11, verify okta-core is still on the v7
      wrapper (else no Sentry in IE11 — fall back to OV logs).
- [ ] Confirm async `okta-auth-js` **unhandled rejections** reach Sentry as-is, or whether we
      must re-throw a **synchronous** named error so GlobalHandlers definitely fires. (Prefer
      an explicit `catch` → construct → throw so we don't depend on rejection-handler nuances.)
- [ ] Decide: surface-error (preferred) vs. `onError`/telemetry callback.
- [ ] Choose the FF gating the capture (reuse `disablePollDuringCancel` vs. new
      observability FF).
- [ ] Build the Sentry dashboard/alert keyed on `event = fastpass_poll_cancel_race`
      (breakdown by `cancelReason`, `firedFrom`, FF state).
- [ ] Cross-check against Jon's OV logs (Trevor's parallel action) to confirm the widget
      signal and the OV-side signal line up.
