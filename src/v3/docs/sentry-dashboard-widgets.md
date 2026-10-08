# SIW gen3 → Sentry: auth-flow observability dashboard

Copy-paste widget definitions for a Sentry **Dashboard** that visualizes the gen3 sign-in flow from
the per-step tracing POC. Ordered strongest-first: **latency per authenticator** (the lead — real
APM), then authenticator/outcome **mix** and **volume**, then an explicitly **approximate** drop-off
view (directional only — Sentry is APM, not a product-analytics funnel tool; see the caveats).

## Live instance

A demo dashboard is already built (org `okta-prod`):
**https://okta-prod.sentry.io/dashboard/10248871/** — "SIW gen3 auth-flow POC (shuo)".

**Dashboard-as-code / migration:** the whole dashboard is reproducible from
[`../scripts/create-sentry-dashboard.sh`](../scripts/create-sentry-dashboard.sh) — run
`ORG=<org> ./create-sentry-dashboard.sh` (needs the `sentry` CLI + `sentry auth login`) to recreate it
in any org/project. The individual commands it runs are listed below for reference:

```bash
sentry dashboard create okta-prod/ 'SIW gen3 auth-flow POC (shuo)'
D="okta-prod/ 10248871"   # <dashboard-id> from create

sentry dashboard widget add $D "Step funnel (reach per step)" --display categorical_bar \
  --dataset spans --query count --where "span.op:[auth.flow,auth.step]" --group-by step --sort=-count
sentry dashboard widget add $D "Funnel trend (per day)" --display bar \
  --dataset spans --query count --where "span.op:[auth.flow,auth.step]" --group-by step
sentry dashboard widget add $D "Per-step duration (p95)" --display line \
  --dataset spans --query "p95:span.duration" --where "span.op:auth.step" --group-by step
sentry dashboard widget add $D "Flows started" --display big_number \
  --dataset spans --query count --where "span.op:auth.flow"
sentry dashboard widget add $D "Success (final steps)" --display big_number \
  --dataset spans --query count --where "span.op:auth.step outcome:success"
sentry dashboard widget add $D "Errors (final steps)" --display big_number \
  --dataset spans --query count --where "span.op:auth.step outcome:error"
sentry dashboard widget add $D "Outcome mix" --display bar \
  --dataset spans --query count --where "span.op:auth.step has:outcome" --group-by outcome --sort=-count
sentry dashboard widget add $D "Authenticator mix" --display bar \
  --dataset spans --query count --where "span.op:auth.step has:factor" --group-by factor --sort=-count
sentry dashboard widget add $D "Total Human Experience Latency (End-to-End)" --display table \
  --dataset spans --query "p50:span.duration" --query "p95:span.duration" --query "p99:span.duration" \
  --where "span.op:auth.flow.total" --group-by factor
```

> `--sort=-count` must use `=` (a bare `-count` value is parsed as a flag). Widget add needs the org
> positional (`okta-prod/`) — it can't auto-detect it for a bare dashboard id.

**Data caveat:** the spans currently in the project were generated across several iterations of this POC
(single-transaction → per-step models), so `step`/`outcome`/`factor` are well populated but
`isFinal` is only on the newest per-step spans. For an accurate **drop-rate** (started vs `isFinal:true`),
regenerate a clean batch with the current build; the funnel bar already shows drop-off (reach narrows per
step) and works on the existing data. The widgets below are the generic definitions.

## What the widget emits (the data model)

Per-step live tracing (`src/v3/src/util/sentryTracePoc.ts`) emits **one transaction per IDX step**,
as it happens:

- **Root** (first step): `op = auth.flow`, name `siw.auth_flow`.
- **Later steps**: `op = auth.step`, name = the step (e.g. `identify`, `challenge-authenticator`, the
  terminal/success form).
- All steps of a flow share one **`trace`** id.

Searchable **span tags** on every step:

| tag | values | use |
|---|---|---|
| `engine` | `gen3` | scope |
| `flow` | e.g. `DEFAULT`, `PROFILE_ENROLLMENT` | segment |
| `step` | `identify`, `challenge-factor`, `select-factor`, … | funnel axis |
| `factor` | `okta_password`, `okta_verify`, … (absent on early steps) | authenticator breakdown |
| `isFinal` | `true` on the flow's final step, else `false` | completed vs dropped |
| `outcome` | `success` / `error` on the final step, `pending` before | outcome mix |

> **Data scrubbing (important):** the DSN points at a **production** Sentry org (`okta-prod`), whose
> data-scrubbing redacts any tag **name or value containing "auth"** to `[Filtered]`. So the
> authenticator is tagged under **`factor`** (not `authenticatorKey`), and step labels have
> "authenticator" rewritten to "factor" (`challenge-authenticator → challenge-factor`). The span ops
> (`auth.flow`/`auth.step`) are unaffected — core span fields aren't PII-scrubbed. If you point the
> wrapper DSN at a non-prod project, the raw names come through unscrubbed.

Key idea for **drop-off**: because steps ship live, a **started** flow always has one `auth.flow` root,
and a **completed** flow additionally has a step tagged `isFinal:true`. A flow the user abandons has the
root (+ the steps reached) but **no `isFinal:true`** → it's a drop.

**End-to-end latency** — on completion the widget also emits one extra span, `op = auth.flow.total`,
whose `span.duration` spans the **whole flow** (first step's request start → final step's request end,
i.e. it includes the wall-clock *between* steps = the human time spent). It's tagged with the flow's
`factor` (the last step that carried one). This is the only span whose duration is the
"human experience latency"; the per-step `auth.step` durations are individual requests only.

---

## Presenting to the team (talk track)

**Framing (say this first):** "Every number on this dashboard comes from the sign-in widget's own
instrumentation — no server logs, no HAR files. The sweet spot is **simple aggregation sliced by
authenticator**: how long sign-in really takes per method, which methods are used, how flows end. The
widget emits one span per step as it happens (`auth.flow` root + `auth.step` children, shared trace),
plus one end-to-end span per completed flow (`auth.flow.total`)."

Then walk the widgets, strongest-first:

1. **Total Human Experience Latency (End-to-End) by authenticator** — *the lead.* *"How long does
   signing in actually take a human, per method?"* p50/p95/p99 of the **whole-flow wall-clock** (first
   request → final step, **including the time the user spends** reading/typing), grouped by
   authentication method. This is the number product cares about, it's **live**, and it's the one you
   can't easily get from backend timings alone. Use the dashboard **time-range picker** (top-right) to
   set the window (applies to every widget).

2. **Per-step duration (p95)** — *"Which step is slow, server-side?"* p95 latency of each individual
   IDX request by step. Spikes point at a specific step/authenticator being slow to respond (network +
   backend), independent of user think time.

3. **Authenticator mix** — *"Which authenticators are actually used?"* Count by `factor`
   (`okta_password`, `okta_verify`, …). Answers "how many flows use Okta Verify?" — read as a
   **relative mix** (ratios survive sampling), not an exact total.

4. **Outcome mix** — *"How do flows end?"* `success` / `error` / `pending` (pending = reached but not
   yet final). Natural pivot into error-reporting (same platform).

5. **Flows started** / 6. **Success** / 7. **Errors** — *"Rough volume."* One `auth.flow` root per
   flow = attempts; the final-step splits give completed outcomes. **Started − (Success + Errors) =
   dropped/in-progress.** Sampled estimates — directional, not exact tallies.

8. **Approx. drop-off (reach per step)** — *the caveated extra, last on purpose.* Aggregate bar of
   flows reaching each step; the bars step **down** as users leave. Useful as a **directional** signal
   — but say the three limits out loud (below): it is **not** a true funnel. Its sibling **Approx.
   drop-off trend (per day)** is the same data over time.

**Caveats to say out loud (so nobody is misled):**
- This is **POC data** generated by mock flows; the numbers are illustrative, not production traffic.
- **Latency is real wall-clock incl. think time** — fast automated/test clicks read low; realistic
  seconds-scale numbers need real user pacing.
- **Drop-off is approximate, not a true funnel:** (a) a grouped bar doesn't enforce step **order**
  (counts traces that *touched* a step, not that reached it in sequence); (b) **sampling** → every
  count is an estimate; (c) **client survivorship** — the top is "flows where the SDK ran," not
  everyone who landed, so a failed bootstrap is invisible. Exact ordered funnels are **server-side**.
- Authenticator variety depends on which flows were run (built-in mocks cover `okta_password` /
  `okta_verify`).

**The one-line takeaway:** "From the client alone, the widget gives us **live latency and mix
analytics per authenticator** today — no server change. It does **not** give exact counts or a true
funnel; that stays server-side."

## Add the dashboard

Sentry → **Dashboards** → **Create Dashboard** → **Add Widget** for each below. For every widget set
**Dataset: Spans** and add `environment:dev` to the query (the POC's env). "Group by" = the widget's
group column; "Visualize" = the y-axis/aggregate.

### 1. Step funnel (Categorical Bar — aggregate)
How many flows reach each step, aggregated over the dashboard's selected date range — the bars step
down as users drop off.
- **Visualize:** `count()`
- **Query:** `(span.op:auth.flow OR span.op:auth.step) environment:dev`
- **Group by:** `step`
- **Display:** `categorical_bar`, sort by count desc (one bar per step, no time axis — reads as a funnel)

> Includes `auth.flow` so the first step (`identify`) is counted alongside the `auth.step` steps.
> A plain `bar`/`line` widget grouped by `step` renders as a **time-series** (per-day) instead — use
> that for the *trend* (widget 1b), and `categorical_bar`/`table` for the aggregate funnel shape.
> The window is the dashboard's **time-range picker** (top-right); pick e.g. 7d/30d for the funnel.

### 1b. Funnel trend (Bar — per day)
Same data as a time-series, to see whether reach/drop-off is moving over time.
- **Visualize:** `count()`
- **Query:** `(span.op:auth.flow OR span.op:auth.step) environment:dev`
- **Group by:** `step`
- **Display:** `bar` (time-series — x-axis binned by day over the selected range)

### 2a. Flows started (Big Number)
- **Visualize:** `count()`
- **Query:** `span.op:auth.flow environment:dev`  *(one root per flow = flows started)*

### 2b. Flows completed (Big Number)
- **Visualize:** `count()`
- **Query:** `isFinal:true environment:dev`  *(the final step exists only for completed flows)*

### 2c. Drop rate (Big Number, equation)
- **Equation:** `(started − completed) / started` using the two counts above
  (`equation|(count_if(span.op,equals,auth.flow) - count_if(isFinal,equals,true)) / count_if(span.op,equals,auth.flow)`).
- If your Sentry build doesn't support that equation inline, read it off 2a/2b: `drop = 1 − completed/started`.

### 3. Outcome mix (Donut/Pie)
Success vs error among **completed** flows (dropped shown separately, see note).
- **Visualize:** `count()`
- **Query:** `isFinal:true environment:dev`
- **Group by:** `outcome`  *(→ `success`, `error`)*

> "Dropped" isn't an `outcome` value (dropped flows never reach a final step); show it as
> `started − completed` from widgets 2a/2b, or add a third slice manually.

### 4. Authenticator breakdown (Table or Bar)
Which authenticators flows actually use.
- **Visualize:** `count_unique(trace)`  *(so a multi-step flow counts once)*
- **Query:** `span.op:auth.step has:factor environment:dev`
- **Group by:** `factor`  *(→ `okta_password`, `okta_verify`, …)*

### 5. Per-step duration (Line or Bar)
- **Visualize:** `p50(span.duration)` and `p95(span.duration)`
- **Query:** `span.op:auth.step environment:dev`
- **Group by:** `step`

### 6. Total Human Experience Latency — End-to-End (Table)
Whole-flow wall-clock per authentication method (P50 / P95 / P99), from the dedicated
`auth.flow.total` span. Mirrors the "Total Human Experience Latency" table layout.
- **Visualize:** `p50(span.duration)`, `p95(span.duration)`, `p99(span.duration)`
- **Query:** `span.op:auth.flow.total environment:dev`
- **Group by:** `factor`
- **Display:** Table (full width)

> Needs flows run on the **current build** (the `auth.flow.total` span is new) — existing spans predate
> it. Values reflect real wall-clock *including* the gaps between steps; the seconds-scale "human" numbers
> only appear with real user pacing (automated/fast test runs will read much lower).

---

## Ad-hoc queries (Trace Explorer / Discover, Spans dataset)

- Funnel counts: `(span.op:auth.flow OR span.op:auth.step)` → group by `step`.
- Dropped flows (list): open **Traces**, filter `span.op:auth.flow environment:dev`, then inspect traces
  with no `isFinal:true` span. (Dashboards can't express "trace lacking a tag" directly — the
  started−completed delta is the aggregate proxy.)
- One authenticator: `span.op:auth.step factor:okta_verify`.
- Errors only: `isFinal:true outcome:error`.

---

## Note — per-step vs end-to-end duration

The per-step model favors **drop-off visibility**: each step is its own transaction and the `auth.flow`
root covers only the **first** step, so widget 5 (`auth.step`) is *per-step request* timing, not the
whole sign-in. End-to-end latency is captured separately by the dedicated `auth.flow.total` span
(widget 6), emitted once on completion spanning first→last step — so we get both the drop-off funnel
*and* whole-flow "human" latency. See `sentryTracePoc.ts` (`sendAuthStepSpan` + `sendAuthFlowTotalSpan`).
