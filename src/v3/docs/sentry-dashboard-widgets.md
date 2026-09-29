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

sentry dashboard widget add $D "Step funnel (reach per step)" --display bar \
  --dataset spans --query count --where "span.op:[auth.flow,auth.step]" --group-by step --sort=-count
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
  --dataset spans --query count --where "span.op:auth.step has:authenticatorKey" --group-by authenticatorKey --sort=-count
```

> `--sort=-count` must use `=` (a bare `-count` value is parsed as a flag). Widget add needs the org
> positional (`okta-prod/`) — it can't auto-detect it for a bare dashboard id.

**Data caveat:** the spans currently in the project were generated across several iterations of this POC
(single-transaction → per-step models), so `step`/`outcome`/`authenticatorKey` are well populated but
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
| `step` | `identify`, `challenge-authenticator`, … | funnel axis |
| `authenticatorKey` | `okta_password`, `okta_verify`, … (absent on early steps) | authenticator breakdown |
| `isFinal` | `true` on the flow's final step, else `false` | completed vs dropped |
| `outcome` | `success` / `error` on the final step, `pending` before | outcome mix |

Key idea for **drop-off**: because steps ship live, a **started** flow always has one `auth.flow` root,
and a **completed** flow additionally has a step tagged `isFinal:true`. A flow the user abandons has the
root (+ the steps reached) but **no `isFinal:true`** → it's a drop.

---

## Add the dashboard

Sentry → **Dashboards** → **Create Dashboard** → **Add Widget** for each below. For every widget set
**Dataset: Spans** and add `environment:dev` to the query (the POC's env). "Group by" = the widget's
group column; "Visualize" = the y-axis/aggregate.

### 1. Step funnel (Bar)
How many flows reach each step — the bar heights step down as users drop off.
- **Visualize:** `count()`
- **Query:** `(span.op:auth.flow OR span.op:auth.step) environment:dev`
- **Group by:** `step`
- **Display:** Bar (sort by count desc)

> Includes `auth.flow` so the first step (`identify`) is counted alongside the `auth.step` steps.

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
- **Query:** `span.op:auth.step has:authenticatorKey environment:dev`
- **Group by:** `authenticatorKey`  *(→ `okta_password`, `okta_verify`, …)*

### 5. Per-step duration (Line or Bar)
- **Visualize:** `p50(span.duration)` and `p95(span.duration)`
- **Query:** `span.op:auth.step environment:dev`
- **Group by:** `step`

---

## Ad-hoc queries (Trace Explorer / Discover, Spans dataset)

- Funnel counts: `(span.op:auth.flow OR span.op:auth.step)` → group by `step`.
- Dropped flows (list): open **Traces**, filter `span.op:auth.flow environment:dev`, then inspect traces
  with no `isFinal:true` span. (Dashboards can't express "trace lacking a tag" directly — the
  started−completed delta is the aggregate proxy.)
- One authenticator: `span.op:auth.step authenticatorKey:okta_verify`.
- Errors only: `isFinal:true outcome:error`.

---

## Caveat — whole-flow duration

The per-step model favors **drop-off visibility** over end-to-end timing: each step is its own
transaction, and the `auth.flow` root span covers only the **first** step (not the whole sign-in). So
widget 5 is **per-step** duration. True end-to-end flow duration would need trace-level duration
(max step end − min step start across the trace) or the alternative single-transaction-at-completion
model (which, in turn, can't see dropped flows). This is the deliberate trade-off of per-step live
emission — see `sentryTracePoc.ts`.
