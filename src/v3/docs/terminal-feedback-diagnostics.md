# Terminal feedback diagnostics → Sentry (gen3)

## Context / why this exists

When a sign-in flow dead-ends in an **unrecoverable terminal error**, support and
engineering need to know *what the user actually went through* and *where it
broke*. Today the only faithful record is a HAR file captured by the end user —
awkward to obtain, and it contains raw credentials/tokens.

This feature adds a **user-initiated "Send feedback" button** on gen3 terminal
error views. On click it assembles a small, PII-safe **diagnostic bundle** — the
trail of IDX transactions the user went through, the terminal error, and
environment metadata — and sends it to a configured **Sentry** project as an error
event. It is:

- **Low volume** — only fires on a terminal error *and* an explicit click.
- **Low PII** — curated metadata only; never request/response bodies, tokens,
  passwords, OTPs, or `stateHandle`.
- **A logical trail, not a HAR** — enough to reconstruct *what happened and where
  it went wrong*, not a byte-faithful network capture.

Scope of this first round: **gen3 only**, and the log must be good enough to tell
what happened and what went wrong.

## Architecture

| Piece | File |
| --- | --- |
| Diagnostics collector + bundle builder | `src/v3/src/util/feedbackDiagnostics.ts` |
| Sentry sender (lazy-loaded SDK) | `src/v3/src/util/sentryFeedback.ts` |
| Records every transaction into the trail | `src/v3/src/components/Widget/index.tsx` (`useEffect` on `idxTransaction`) |
| "Send feedback" button on terminal error | `src/v3/src/transformer/terminal/transformTerminalTransaction.ts` (`appendSendFeedbackLink`) |
| Config option | `src/v3/src/types/widget.ts` (`WidgetOptions.feedback`) |
| Label | `packages/@okta/i18n/src/properties/login.properties` (`feedback.send`) |

### Flow

1. A single `useEffect` keyed on `idxTransaction` calls `recordTransaction()` for
   every transaction. Bootstrap, form submits, and poll promotions all funnel
   through `setIdxTransaction`, so one hook captures the whole flow.
2. Each breadcrumb keeps only: timestamp, step/form name, IDX status,
   `requestDidSucceed`, message i18n **keys**, and authenticator key. Consecutive
   identical steps (polling) collapse into one entry with a `count`.
3. The trail is mirrored to `sessionStorage` so it survives same-tab redirects.
4. On the terminal error view (a message with `class === 'ERROR'`), the "Send
   feedback" link appears. On click, `buildDiagnosticBundle()` assembles the
   bundle and `sendFeedbackToSentry()` lazy-imports `@sentry/browser`, inits it
   with the configured DSN, and captures the bundle as an error event
   (searchable tags + structured context + full JSON attachment).

## What the log contains, and why

The bundle has two tiers.

**Base (always on, PII-safe** — metadata, not payloads; safe to leave the widget
because the user explicitly clicked "send"):

- **Build** — widget version + commit, engine (`gen3`).
- **Flow context** — flow type, resolved form/step name, controller,
  authenticator key, method type (reuses `getEventContext`).
- **Error** — terminal messages as `{ i18nKey, class, message }` (already
  user-facing strings, no secrets).
- **`transactions[]`** — the per-transaction trail. Each entry groups: `seq`,
  `step`, the actual `requestUrl` + `method` + `httpStatus` (from the fetch tap),
  `idxStatus`, `requestDidSucceed`, `messageKeys`, and `count` (collapsed polls).
- **Environment** — user agent, language(s), platform, viewport, online/cookie.
- **Config** — issuer origin, client id.
- **User** — the identifier (email/username) only, if present.

**Opt-in (`feedback.includeRawResponses`, POC/exploration only)** — adds two
PII/secret-bearing fields per transaction:

- **`requestBody`** — the request payload the client sent. **Contains credentials
  / OTP / security answers.** Most sensitive.
- **`rawResponse`** — the full raw IDX response. Contains `stateHandle`, user
  identifier, etc.

These two are **attachment-only** (stripped from the indexed Sentry context) and
**MUST be scrubbed before any production use** — this is the open PII decision.

**Never collected (any tier):** response/request bodies are absent entirely when
`includeRawResponses` is off; the fetch tap itself only reads url/method/status,
never bodies or headers.

## How it is sent to Sentry

`@sentry/browser` is pulled in via a dynamic `import()` (`webpackChunkName:
"sentry-feedback"`), so the SDK is a **separate async chunk** that is only
downloaded and initialized when a user actually clicks — zero cost to the auth
critical path otherwise. The event is captured with `captureException` inside a
`withScope`, with:

- **tags** (`formName`, `flow`, `authenticatorKey`, `siwVersion`) so issues are
  searchable/filterable.
- **context** `siwDiagnostics` — the structured bundle, rendered as a panel.
- **attachment** `siw-diagnostics.json` — the full bundle including the trail.

The DSN is supplied per-widget via `WidgetOptions.feedback.sentryDsn` (default
disabled), so no DSN is baked into the public bundle.

## Limitations (important — read before relying on this)

This is deliberately **not** a HAR and cannot be. The known blind spots:

1. **Redirects wipe in-memory state.** A full-page redirect (social IdP,
   `/authorize` bounce, SAML POST) unloads the page and clears the in-memory
   trail. **Mitigation:** the trail is persisted to `sessionStorage`, which
   survives same-tab navigations — including leaving to an IdP and returning to
   the Okta origin. What happens *on the IdP's side* is never visible to us.
2. **Cross-tab / cross-device is invisible.** Email magic links complete in a new
   tab; Okta Verify / QR completes on a phone. Those are different JS contexts (or
   no browser at all), so the client trail cannot span them. Closing this gap
   requires server-side correlation (see Future work).
3. **Polling is noisy.** Long-poll flows repeat the same step. **Mitigation:**
   consecutive identical steps are collapsed into a single entry with a `count`.
4. **No true timings.** We record wall-clock timestamps per step, not the DNS/
   connect/TTFB breakdown a HAR has.
5. **Sampling doesn't apply / by design.** Unlike Session Replay, we do not record
   every session; the bundle is built on demand, so there is no way to "look up"
   a session the user did not report.
6. **IE11.** `@sentry/browser` v8 drops IE11 support. The feature is lazy-loaded
   and modern-only; the base widget (including IE11 builds) is unaffected because
   the Sentry chunk only loads on click. Do not expect the button to work in IE11.
7. **Async-chunk deployment.** Because the SDK is a separate chunk, the hosting
   environment must serve it and have `publicPath` set correctly. Verified in the
   playground; confirm for Okta-hosted / CDN deployment before shipping broadly.

### Open decision: PII scrubbing

The **base** bundle is payload-free. The **opt-in** `includeRawResponses` tier
attaches request payloads (credentials/OTP) and raw responses (`stateHandle`,
identifier) — for POC/exploration only. Before any production use we must decide:
scrub `stateHandle`/tokens/credentials from `requestBody`/`rawResponse`, and
whether to keep the user identifier. `includeRawResponses` defaults **off** and is
trivial to remove. Flagged, not decided here.

## Future work (explicitly out of scope for this round)

- **Server-side correlation via `x-okta-request-id`.** Every IDX response carries
  an `x-okta-request-id` header that ties the call to the real server-side record
  in Splunk. Capturing it on the client (a `window.fetch` tap) and tagging the
  Sentry event with it would let an engineer pivot from a client report straight
  into the server-side flow — including the redirect/cross-tab legs the client
  cannot see. Deferred pending confirmation of the Splunk workflow.
- **Gen2 parity** — the same button on the `src/v2` `TerminalView`.
- **User comment field** — collect a typed message and attach it via Sentry's
  User Feedback API (`captureFeedback`, linked to the event id).

## Why a true HAR is not possible from page JS

A HAR is a complete network trace — full request/response **headers and bodies and
timings** for *every* request, including top-level navigations and redirects.
Page JavaScript cannot produce this:

- **No access to the browser's network trace.** The DevTools Network panel / HAR
  export is available only to a **privileged context** — a browser extension
  (`webRequest`/`debugger` permission) or the DevTools/CDP protocol. There is **no
  page-level permission** that grants a web app this capability.
- **JS can only observe its *own* traffic.** By wrapping `fetch`/`XHR`, page JS can
  see requests it makes — but not top-level navigations, redirects, cross-origin
  hops, or anything before the wrapper installed. Cross-origin response
  headers/bodies are further restricted by CORS/SOP.
- **`PerformanceResourceTiming`** gives a timing-only waterfall (URLs + durations)
  with **no headers, bodies, or status codes**.

So the widget *can* capture its own IDX request/response bodies (it makes those
calls) — and with `includeRawResponses` on, it does. But it still isn't a HAR: no
top-level navigations, no redirects, no cross-origin hops, no real timings, and it
starts only after the widget's own code loads. The base (default) bundle stays a
*logical* record of the flow — steps, URLs, statuses, messages — not a
byte-faithful network capture. The faithful, complete, cross-hop view lives
server-side.

## Verifying in the playground

1. Start the gen3 playground:
   ```bash
   OKTA_SIW_GEN3=true yarn start
   ```
2. Point it at a terminal **error** mock (a message with `class: "ERROR"`), e.g.
   set `/idp/idx/introspect` to `terminal-invalid-reset-password-token` in
   `playground/mocks/config/responseConfig.js`, then restart. (INFO-class
   terminals like "return to original tab" intentionally do **not** show the
   button.)
3. Open the widget with a dev Sentry DSN in the URL (no rebuild needed):
   ```
   http://localhost:3000/?sentryDsn=https://<key>@oXXX.ingest.sentry.io/<project>
   ```
   (or paste the DSN into `.widgetrc.js` → `feedback.sentryDsn`).
4. Reach the terminal error, click **Send feedback**.
5. In Sentry: confirm a new issue "SIW gen3 terminal error: …" with the
   `siwDiagnostics` context (the `transactions[]` trail), the `formName`/`flow`
   tags, and the `siw-diagnostics.json` attachment (incl. `requestBody` /
   `rawResponse` per transaction when `includeRawResponses` is on).
6. Confirm that with **no** DSN configured, clicking does nothing network-facing
   (a console warning is logged) and the terminal view is otherwise unaffected.

### Complex flow: polling + redirect-survival

To exercise the harder cases, wire a polling flow that ends terminal (in
`playground/mocks/config/responseConfig.js`):
- `/idp/idx/identify` → `authenticator-verification-email`
- `/idp/idx/challenge/poll` → `['authenticator-verification-email',
  'authenticator-verification-email', 'terminal-polling-window-expired']`
  (poll "waiting" twice via the cycling mock sequencer, then an ERROR terminal)

Verified behavior:
- **Polling** — consecutive poll transactions collapse into one `transactions[]`
  entry with `count`, `requestUrl` = `/idp/idx/challenge/poll`.
- **Redirect-survival** — reloading the page mid-flow (a same-origin redirect
  analog) preserves the pre-reload entries: the `sessionStorage` trail is
  rehydrated and new transactions append after it (confirmed: 6 entries spanning
  a reload, with the pre-reload poll terminal retained).
