# SIW gen3 → Sentry: auth-flow funnel dashboard

Copy-paste widget definitions for a Sentry **Dashboard** that visualizes the gen3 sign-in
funnel, drop-off, outcome mix, and authenticator breakdown from the per-step tracing POC.

## Live instance

A demo dashboard is already built (org `okta-prod`):
**https://okta-prod.sentry.io/dashboard/10248871/** — "SIW gen3 auth-flow POC (shuo)".

It was created with the `sentry` CLI (v0.30+, `sentry auth login`):

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
instrumentation — no server logs, no HAR files. It shows that from the client alone we can answer the
questions we usually can't: how far users get, where they drop, how long sign-in really takes per
method, and how it ends. The widget emits one span per step as it happens (`auth.flow` root +
`auth.step` children, shared trace), plus one end-to-end span per completed flow (`auth.flow.total`)."

Then walk the widgets:

1. **Step funnel (reach per step)** — *"How far do people get?"* Aggregate bar of flows reaching each
   step (`identify → challenge-authenticator → success/terminal`) over the selected date range. The
   bars step **down** — each drop is people who left. Headline drop-off view. Its sibling
   **Funnel trend (per day)** is the same data over time — *"is drop-off getting better or worse?"*
   Use the dashboard **time-range picker** (top-right) to set the window for both (and every widget).

2. **Per-step duration (p95)** — *"Which step is slow, server-side?"* p95 latency of each individual
   IDX request by step. Spikes point at a specific step/authenticator being slow to respond (network +
   backend), independent of user think time.

3. **Flows started** — *"How many sign-in attempts?"* One `auth.flow` root per flow = total attempts.
   The denominator for everything else.

4. **Success (final steps)** / 5. **Errors (final steps)** — *"How many finished, and how?"* Completed
   flows split by outcome. **Started − (Success + Errors) = dropped/in-progress** — that's your drop
   count in one subtraction.

6. **Outcome mix** — *"What's the distribution?"* Same data as 4/5 as one chart: `success` / `error` /
   `pending` (pending = reached but not yet final).

7. **Authenticator mix** — *"Which authenticators are actually used?"* Count by `factor`
   (`okta_password`, `okta_verify`, …). Answers "how many flows use Okta Verify?" directly.

8. **Total Human Experience Latency (End-to-End)** — *"How long does signing in actually take a human,
   per method?"* The marquee widget: p50/p95/p99 of the **whole-flow wall-clock** (first request →
   final step, **including the time the user spends** reading/typing), grouped by authentication method.
   This is the number product cares about and the one you can't get from backend timings alone.

**Caveats to say out loud (so nobody is misled):**
- This is **POC data** generated by mock flows; the numbers are illustrative, not production traffic.
- **Latency is real wall-clock incl. think time** — fast automated/test clicks read low; realistic
  seconds-scale numbers need real user pacing.
- **Drop-off** reads two ways: the funnel narrowing (widget 1) and Started − Completed (widgets 3–5).
- Authenticator variety depends on which flows were run (built-in mocks cover `okta_password` /
  `okta_verify`).

**The one-line takeaway:** "The widget can self-report the full sign-in funnel, outcomes, and real
end-to-end latency per authenticator — the inputs to drop-off and performance analysis — without any
server-side change."

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
