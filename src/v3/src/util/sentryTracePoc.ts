/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Tracing POC (gen3 only) — sibling to `sentryFeedback.ts`.
 *
 * Emits ONE Sentry transaction PER STEP, live, as each IDX request completes —
 * NOT one transaction reconstructed at the end. Every transaction in a flow shares
 * one `traceId` ({@link TraceContext}); the first step is emitted as the trace root
 * (`op: auth.flow`, `spanId === rootSpanId`, no parent) and each later step as a
 * child (`op: auth.step`, `parentSpanId === rootSpanId`). Because they all carry
 * the same `traceId` and link via `parentSpanId`, Sentry stitches them into one
 * trace, while each step is observable the instant it happens.
 *
 * Why per-step (vs one transaction at completion): it lets us see **partial /
 * dropped flows**. A user who abandons mid-sign-in (closes the tab, walks away)
 * still leaves behind the steps they reached — a "reconstruct-at-completion" model
 * would emit nothing for them. Each step carries `isFinal` + `outcome` tags, so a
 * DROPPED flow is a trace with no `isFinal: true` step; a completed flow ends in a
 * step tagged `outcome: success|error`. This is what answers "how far do flows get
 * before they drop?".
 *
 * Pinned to `@sentry/browser` v7 (prod parity for legacy-browser support). v7's
 * `startTransaction` accepts explicit `traceId`/`spanId`/`parentSpanId`, which is
 * what makes the deterministic root/child linkage above possible without any
 * read-back or ordering race.
 *
 * Uses the wrapper's global `window.Sentry` (via {@link resolveSentry}) — this
 * module does NOT init the SDK itself, and there is no bundled fallback. The
 * wrapper (prod `@okta/sentry-wrapper`, or the playground `sentry-wrapper.ts`)
 * owns `Sentry.init()`, the sample rate, and the tracing extensions. If the global
 * is absent, this no-ops with a loud console error.
 *
 * POC caveats:
 * - `tracesSampleRate: 1.0` (set by the wrapper's init) so every step shows up
 *   while you explore. This will NOT survive real traffic — scope it to a
 *   `tracesSampler` and a low rate before any broad use
 *   (see docs/terminal-feedback-diagnostics.md).
 * - No BrowserTracing integration is added, so there are no auto pageload/
 *   navigation transactions — only the per-step transactions we emit here.
 * - Polling ticks are collapsed upstream (one span per distinct step, not one per
 *   poll) so a long poll does not flood Sentry with envelopes.
 */
import { TraceContext, TransactionRecord } from './feedbackDiagnostics';
import { resolveSentry } from './sentryFeedback';

export interface AuthStepMeta {
  flow?: string;
  authenticatorKey?: string;
  methodType?: string;
  /** true when this step is the flow's final state (terminal/success). A trace
   *  with no `isFinal: true` step is a DROPPED flow. */
  isFinal: boolean;
  /** the flow outcome once known: `success`/`error` on the final step, else
   *  `pending` for intermediate steps. */
  outcome: 'success' | 'error' | 'pending';
  version: string;
  commit: string;
}

// Sentry v7 timestamps are Unix *seconds*; our trail records `Date.now()` millis.
const toSeconds = (ms: number): number => ms / 1000;

// Span window helper: real request timing when present, else the record's `ts`,
// guarding a zero/negative window (client-only step or clock skew) so the span
// always has a positive duration.
const spanWindow = (record: TransactionRecord): { start: number; end: number } => {
  const start = record.requestStartTs ?? record.ts;
  const rawEnd = record.requestEndTs ?? record.ts;
  return { start, end: rawEnd > start ? rawEnd : start + 1 };
};

/**
 * Emit ONE transaction for a single IDX step, live, the moment it completes. The
 * caller decides (synchronously, via {@link markRootEmitted}) whether this step is
 * the trace root by passing `asRoot`; that keeps the root decision race-free even
 * if two requests resolve back-to-back. No-op (loud console error) if the wrapper's
 * `window.Sentry` is absent.
 *
 * Emitting live (rather than at flow completion) is what surfaces dropped flows:
 * every step reached is already in Sentry, so a flow that never finishes still
 * leaves its partial trace behind. `isFinal`/`outcome` mark whether the flow
 * completed.
 *
 * @param record   the just-recorded step (carries real per-request timing)
 * @param traceCtx the flow's shared trace identity (traceId + root spanId)
 * @param meta     flow-level discriminators + drop-detection tags
 * @param asRoot   true => emit as the trace root (auth.flow); false => child (auth.step)
 */
export const sendAuthStepSpan = async (
  record: TransactionRecord,
  traceCtx: TraceContext,
  meta: AuthStepMeta,
  asRoot = false,
): Promise<void> => {
  // Use the wrapper's global window.Sentry (no bundled fallback). If it isn't
  // present, hard-fail loudly rather than silently dropping the span — a missing
  // wrapper is a setup bug we want visible while POC'ing the global-Sentry path.
  const Sentry = resolveSentry();
  if (!Sentry) {
    // eslint-disable-next-line no-console
    console.error('[siw-trace] window.Sentry not found — the Sentry wrapper must init and publish it before the widget loads; cannot emit auth step span.');
    return;
  }
  // `startTransaction` is a tracing extension; the wrapper registers it at init,
  // but call it here too (idempotent) to be safe before we start a transaction.
  Sentry.addTracingExtensions();

  const { start, end } = spanWindow(record);

  const transaction = Sentry.startTransaction({
    name: asRoot ? 'siw.auth_flow' : record.step,
    op: asRoot ? 'auth.flow' : 'auth.step',
    // Share the flow's trace so every step lands in one trace.
    traceId: traceCtx.traceId,
    // Root owns the shared rootSpanId (no parent); later steps hang off it.
    ...(asRoot
      ? { spanId: traceCtx.rootSpanId }
      : { parentSpanId: traceCtx.rootSpanId }),
    // Force-keep: the wrapper's init sets tracesSampleRate so v7 respects this.
    sampled: true,
    startTimestamp: toSeconds(start),
    tags: {
      engine: 'gen3',
      flow: meta.flow ?? '',
      step: record.step,
      // In tags (not just data) so Sentry dashboards can group by it. Low
      // cardinality (okta_password, okta_verify, …). Undefined on early steps
      // (e.g. identify) — Sentry drops undefined tags.
      authenticatorKey: record.authenticatorKey ?? meta.authenticatorKey,
      // Flow-completion signals for drop-off analysis: a trace with no
      // `isFinal:true` step is a dropped flow.
      isFinal: meta.isFinal,
      outcome: meta.outcome,
    },
    data: {
      seq: record.seq,
      step: record.step,
      requestUrl: record.requestUrl,
      method: record.method,
      httpStatus: record.httpStatus,
      idxStatus: record.idxStatus,
      requestDidSucceed: record.requestDidSucceed,
      authenticatorKey: record.authenticatorKey ?? meta.authenticatorKey,
      methodType: meta.methodType,
      // collapsed consecutive polls represented by this one span
      pollCount: record.count,
    },
  });

  if (typeof record.httpStatus === 'number') {
    transaction.setHttpStatus(record.httpStatus);
  }

  // Finishing the transaction is what enqueues its envelope; flush pushes it out.
  transaction.finish(toSeconds(end));

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort
  }
};

/**
 * Emit ONE `auth.flow.total` span measuring the **end-to-end** flow latency — from
 * the first step's request start to the final step's request end (so it includes
 * the wall-clock between steps, i.e. the human time spent). Call once, on the final
 * step; the per-step spans only measure individual requests and the `auth.flow`
 * root covers just the first step, so this is the only span whose `span.duration`
 * is the whole-flow "human experience latency". Tagged with the flow's
 * `authenticatorKey` so a dashboard can show P50/P95/P99 per authentication method.
 * No-op (loud console error) if the wrapper's `window.Sentry` is absent, or the
 * trail is empty.
 *
 * @param records  the full step trail (first→last gives the end-to-end window)
 * @param traceCtx the flow's shared trace identity (keeps it in the same trace)
 * @param meta     flow-level discriminators (outcome, fallback authenticatorKey)
 */
export const sendAuthFlowTotalSpan = async (
  records: TransactionRecord[],
  traceCtx: TraceContext,
  meta: AuthStepMeta,
): Promise<void> => {
  if (records.length === 0) {
    return;
  }
  const Sentry = resolveSentry();
  if (!Sentry) {
    // eslint-disable-next-line no-console
    console.error('[siw-trace] window.Sentry not found — cannot emit auth.flow.total latency span.');
    return;
  }
  Sentry.addTracingExtensions();

  const first = records[0];
  const last = records[records.length - 1];
  const start = first.requestStartTs ?? first.ts;
  const rawEnd = last.requestEndTs ?? last.ts;
  const end = rawEnd > start ? rawEnd : start + 1;
  // The flow's authenticator = the last step that actually carried one (the final
  // success/terminal step usually has none).
  const authenticatorKey = [...records].reverse()
    .find((r) => r.authenticatorKey)?.authenticatorKey ?? meta.authenticatorKey;

  const transaction = Sentry.startTransaction({
    name: 'siw.auth_flow.total',
    op: 'auth.flow.total',
    // Keep it in the flow's trace (as a child of the root) for correlation; its
    // duration intentionally spans the whole flow, not just one request.
    traceId: traceCtx.traceId,
    parentSpanId: traceCtx.rootSpanId,
    sampled: true,
    startTimestamp: toSeconds(start),
    tags: {
      engine: 'gen3',
      flow: meta.flow ?? '',
      authenticatorKey,
      outcome: meta.outcome,
      finalStep: last.step,
    },
    data: {
      stepCount: records.length,
      methodType: meta.methodType,
    },
  });
  transaction.finish(toSeconds(end));

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort
  }
};
