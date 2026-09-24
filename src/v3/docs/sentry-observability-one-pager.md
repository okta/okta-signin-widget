# Sentry for Observability — one-pager

Observability of SIW sign-in flows. (Error reporting is a separate, settled fit — out of scope
here.)

## 1. TL;DR

Sentry can answer the **simple** observability questions — counts, duration, authenticator mix
— across **all browsers** (data-scrubbing fixed in project settings; SDK v7 covers IE11). For
**funnels, exact counts, availability, long history, or joins** with other data, server-side
(Splunk / BigQuery) is stronger. Use Sentry for quick latency/mix checks and dashboards; lean
server-side for deep analytics.

## 2. What we can do with Sentry

The widget records a per-flow trail and sends it as one **transaction** (`op:auth.flow`) with a
child **span** per step (`op:auth.step`), plus searchable attributes (authenticator, flow,
outcome, timings).

- **Duration** — p50/p95/p99 of the whole flow (wall-clock, includes user think time) + a
  per-step waterfall.
- **Authenticator mix & counts** — group by low-cardinality attributes.
- **Trace → error pivot** — same platform as error reporting.

**Live demo dashboard:** <https://okta-prod.sentry.io/dashboard/10087424/> — auth-flow count,
duration percentiles, outcome mix, authenticator breakdown, per-step timing, and trend over time.

Example queries:

- Duration — `span.op:"auth.flow"` → `p95(span.duration)`
- Authenticator — `span.op:"auth.step" has:authenticatorKey` → `count_unique(trace)` grouped by
  `authenticatorKey`
- Outcome — `span.op:"auth.flow"` → `count()` grouped by `outcome`

## 3. Data — auto-capture vs. explicit tracking, and when

We turn **off** Sentry's automatic capture and track **only what we explicitly choose**:

| | Auto-capture (SDK default) | Explicit tracking (what we do) |
|---|---|---|
| Focus | **page lifecycle** — loads, navigations, resource/fetch timing | **auth-flow lifecycle** — steps, authenticator, outcome (what we care about) |
| What's captured | IPs, breadcrumbs, every fetch/XHR URL, user-agent — everything the SDK sees | a curated set: step, HTTP + IDX status, authenticator, outcome, timings, message keys |
| PII exposure | high, un-vetted | low, reviewed |
| Relevance to our questions | generic web-perf noise | exactly the auth-flow fields we need |
| Control | Sentry decides | we decide field-by-field |
| Volume / quota | high (every event) | minimal |

*Why explicit:* a minimal, predictable, PII-safe footprint that answers the questions — instead
of un-vetted PII and noise.

**When it's tracked:** a trail entry is recorded **as each IDX step becomes current**
(client-side, as the user progresses); the assembled transaction is **sent once, on flow
completion** (success or terminal) — not continuously, and nothing is sent for abandoned flows.

## 4. Limitations

What genuinely remains:

- **Sampling → estimates.** At prod volume traces must be sampled; counts are estimates, not
  exact tallies.
- **Quota & cost.** Sentry bills per ingested span — each flow is 1 transaction + N step spans
  — so at login volume auth-flow tracing burns real quota and **competes with the same org's
  error-reporting budget**; exceed the quota and Sentry drops events (data loss). This is *why*
  sampling is required (above), so exact counts aren't free.
- **~90-day retention, no SQL / warehouse joins, no cohort/retention analysis.** No long
  history; can't join sign-in data with org/product data.
- **Blind to flows that fail or abandon** (client-side survivorship). Sentry only records
  *completed* flows from clients where the SDK actually ran, so the failing/leaving population
  is **silent** — never counted:
  - *no availability / outage detection* — a failed bootstrap emits nothing (no denominator to
    detect a drop against);
  - *no drop-off / funnel* — abandoned flows never send a completion trace.
  Both are **server-side** (introspect-per-pageview) or **synthetic-monitoring** concerns. (And
  as APM rather than product analytics, Sentry has no funnel/cohort tooling regardless.)
- **SDK v7 is EOL (maintenance only)** and must coexist with okta-core's v10 `sentry-wrapper`
  — two SDK versions on one page, needing an isolated/namespaced client.
- **PII minimization → not everything is captured.** By logging only low-PII metadata (no
  credentials/OTPs/tokens/`stateHandle`/raw bodies; user identifier + IP excluded) we
  deliberately **don't collect all data available**, and sending sign-in data off-page at all
  is a consent decision to confirm before prod.

## 5. Alternatives (server-side)

The auth-flow data is already **server-known** — okta-core sees every IDX step — so the
questions Sentry can't do well are answerable server-side:

| | Sentry | Splunk | BigQuery |
|---|---|---|---|
| Counts / duration | ✅ sampled | ✅ exact | ✅ exact |
| Funnels / drop-off | ✗ | ✅ | ✅ |
| Joins / long history | ✗ | limited | ✅ |
| Real-time | ✅ | ✅ | ✗ |
| Setup | none (built) | some | build pipeline |

- **Splunk** — real-time search + flow-stitching; operational lens.
- **BigQuery** — full SQL, funnels, joins, unlimited retention; deep analytics.

Client-vs-server rationale: `observability-placement.md`.
