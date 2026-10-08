# SIW "Send Feedback" — what data is captured (for privacy review)

**For:** Privacy / Legal (Matt Senechal → Steven Nguyen) · **Jira:** OKTA-1292200 · pairs with OKTA-1289003
**Sentry:** `okta-prod` org → `okta-siw-poc` project

A user can click **"Send feedback"** from **any** Sign-In Widget screen. On that click — and only then — a diagnostic snapshot is uploaded to Sentry. Nothing is sent automatically. The approach is two steps:

1. **Capture** session data using Sentry's **Session Replay** feature.
2. **Redact** sensitive data using Sentry's **org-level + project-level scrubbing rules**.

---

## Step 1 — Capture (Sentry Session Replay)

We use Sentry's built-in Session Replay to record, into an in-memory buffer, two kinds of data:

- **User actions** — the DOM/session recording: what screens were shown, clicks, navigation. (On-screen **text and input values are masked** by the Replay feature itself — see Step 2.)
- **Network data** — the IDX API calls the widget made: URL path, method, status, and request/response **bodies** (bodies are captured so we can read the server's error `message`).

Capture is scoped to IDX endpoints (`/idp/idx/`). The buffer is uploaded only on "Send feedback", then discarded.

Alongside the replay, the feedback entry carries a fixed set of non-identifying tags (`engine`, `siwVersion`, `flow`, `formName`, `factor`, `hasReplay`) and the user's typed comment.

## Step 2 — Redact (scrubbing rules)

Sentry removes sensitive data before storage, at two layers. Both apply.

**Client-side (Session Replay masking):**
- `maskAllText` — all on-screen text masked
- `maskAllInputs` — all input values masked
- `blockAllMedia` — images/video/canvas blocked

**Server-side (data-scrubbing on ingest):**

| Layer | Rules |
|---|---|
| **Org** `okta-prod` (all projects) | Require Data Scrubber **ON**, Default Scrubbers **ON**, Prevent Storing IP **ON**, Enhanced Privacy **ON**. Sensitive field names: `username, user, password, email, ip, ip_address, clientIP, activePrincipal`. Rules strip all email + IP **values** everywhere. (Also filters any `auth*` field → why the authenticator tag is named `factor`.) |
| **Project** `okta-siw-poc` (adds on top) | Sensitive field names add the Okta-specific ones the org list misses: **`identifier`, `stateHandle`**, plus **OTP / passcode / security-answer / token** fields. |

**Net result — removed:** `identifier`, `password`, `stateHandle` (request + response), OTP / passcode / security answers / tokens / auth codes, all emails, all IPs, and all on-screen text/inputs.

**Net result — kept** (no PII; needed to triage): HTTP path + method + status per step, the response **`message`** text, the fixed tags, and the user's comment.

---

## Confirmations

- ✅ No passwords, OTP, security answers, credentials, tokens, or auth codes.
- ✅ No `stateHandle`; no username/identifier/email; IPs removed.
- ✅ On-screen text/inputs masked client-side; media blocked.
- ✅ Tags are a fixed, enumerated, low-cardinality set — not free-form (except the user's comment).
- ✅ Scrubbing **verified against the captured replay network bodies** by test — sensitive fields come back `[Filtered]` (§A2).

---

## Appendix

### A1. Source / ownership
Replay config: `playground/sentry-wrapper.ts` (`maskAllText`/`maskAllInputs`/`blockAllMedia` on; `networkCaptureBodies` on, scoped via `networkDetailAllowUrls: ['/idp/idx/']`; buffer mode `replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 0`). Tags + User Feedback: `src/v3/src/util/sentryFeedback.ts`. Shipping owners: OKTA-1290997 (wrapper), OKTA-1290948 (widget sender).

### A2. Verified — scrubbing applies to replay network bodies
There was a concern that replay network bodies (a separate envelope, sometimes captured as opaque strings) might escape name-based scrubbing. **Tested and confirmed:** with the shipping config, the org + project scrubbing rules apply to the captured replay network bodies — sensitive fields (`identifier`, `stateHandle`, etc.) are redacted to `[Filtered]`. No client-side body redaction needed.

### A3. Dependency-ticket note
OKTA-1290997 / OKTA-1290948 currently specify `networkCaptureBodies` **off**. The decision here is **on** (to get the response `message`), relying on scrubbing. Update those tickets so code matches this doc.
