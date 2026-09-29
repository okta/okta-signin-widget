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
 * Emits ONE Sentry performance transaction PER FLOW when the flow reaches a final
 * state (terminal or success). The root `auth.flow` transaction spans the whole
 * sign-in (first request start → last request end), and each recorded step is a
 * CHILD span (`auth.step`, `startChild`) named after the step (`identify`,
 * `challenge-authenticator`, `terminal`, …). Because the children ride inside the
 * single transaction envelope, Sentry's Trace View renders them as one waterfall
 * that expands into the per-step spans — no cross-transaction stitching required.
 * The timing is reconstructed from the diagnostic trail
 * ({@link TransactionRecord}), which records every step (with real request
 * timings) as the flow runs; the transaction rides the trail's shared `traceId`
 * ({@link TraceContext}).
 *
 * Pinned to `@sentry/browser` v7 (prod parity for legacy-browser support). v7's
 * `startTransaction` accepts an explicit `traceId`/`spanId` and honours explicit
 * `startTimestamp`/`endTimestamp` on both the transaction and its child spans,
 * which is what lets us stamp the real request timings after the fact.
 *
 * Uses the wrapper's global `window.Sentry` (via {@link resolveSentry}) — this
 * module does NOT init the SDK itself, and there is no bundled fallback. The
 * wrapper (prod `@okta/sentry-wrapper`, or the playground `sentry-wrapper.ts`)
 * owns `Sentry.init()`, the sample rate, and the tracing extensions. If the global
 * is absent, this no-ops with a loud console error.
 *
 * POC caveats:
 * - `tracesSampleRate: 1.0` (set by the wrapper's init) so every flow shows up
 *   while you explore. This will NOT survive real traffic — scope it to a
 *   `tracesSampler` and a low rate before any broad use
 *   (see docs/terminal-feedback-diagnostics.md).
 * - No BrowserTracing integration is added, so there are no auto pageload/
 *   navigation transactions — only the one transaction we emit per flow.
 * - Reconstruct-at-completion trade-off: a flow that redirects away or never
 *   reaches a final state emits nothing (the previous per-request variant left a
 *   partial trace behind; this variant favours the single expandable waterfall).
 * - Polling ticks are collapsed upstream (one child span per distinct step, not
 *   one per poll) so a long poll does not flood the trace with spans.
 */
import { TraceContext, TransactionRecord } from './feedbackDiagnostics';
import { resolveSentry } from './sentryFeedback';

export interface AuthFlowTraceMeta {
  flow?: string;
  formName?: string;
  authenticatorKey?: string;
  methodType?: string;
  outcome: 'success' | 'error';
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
 * Emit the WHOLE flow as ONE `auth.flow` transaction with a child `auth.step`
 * span per recorded step, reconstructed from the diagnostic trail. Call once,
 * when the flow reaches a final state (terminal/success). No-op (loud console
 * error) if the wrapper's `window.Sentry` is absent, or if the trail is empty.
 *
 * @param records  the full step trail (each carries real per-request timing)
 * @param traceCtx the flow's shared trace identity (traceId + root spanId)
 * @param meta     flow-level discriminators (ride as tags/data on the root)
 */
export const sendAuthFlowTrace = async (
  records: TransactionRecord[],
  traceCtx: TraceContext,
  meta: AuthFlowTraceMeta,
): Promise<void> => {
  if (records.length === 0) {
    return;
  }

  // Use the wrapper's global window.Sentry (no bundled fallback). If it isn't
  // present, hard-fail loudly rather than silently dropping the trace — a missing
  // wrapper is a setup bug we want visible while POC'ing the global-Sentry path.
  const Sentry = resolveSentry();
  if (!Sentry) {
    // eslint-disable-next-line no-console
    console.error('[siw-trace] window.Sentry not found — the Sentry wrapper must init and publish it before the widget loads; cannot emit auth.flow trace.');
    return;
  }
  // `startTransaction` is a tracing extension; the wrapper registers it at init,
  // but call it here too (idempotent) to be safe before we start a transaction.
  Sentry.addTracingExtensions();

  const first = records[0];
  const last = records[records.length - 1];
  const flowStart = spanWindow(first).start;
  const flowEnd = spanWindow(last).end;

  const transaction = Sentry.startTransaction({
    name: 'siw.auth_flow',
    op: 'auth.flow',
    traceId: traceCtx.traceId,
    spanId: traceCtx.rootSpanId,
    // Force-keep: init sets tracesSampleRate so v7 respects this explicit choice.
    // Also what makes v7 attach a span recorder, so the child spans below ride in
    // this transaction's envelope.
    sampled: true,
    startTimestamp: toSeconds(flowStart),
    tags: {
      engine: 'gen3',
      flow: meta.flow ?? '',
      outcome: meta.outcome,
      finalStep: last.step,
    },
    data: {
      stepCount: records.length,
      formName: meta.formName,
      authenticatorKey: meta.authenticatorKey,
      methodType: meta.methodType,
    },
  });

  // One child span per recorded step -> the trace expands into identify,
  // challenge-authenticator, terminal, … in Sentry's waterfall.
  records.forEach((record) => {
    const { start, end } = spanWindow(record);
    const span = transaction.startChild({
      op: 'auth.step',
      description: record.step,
      startTimestamp: toSeconds(start),
      tags: {
        step: record.step,
        outcome: record.requestDidSucceed === false ? 'error' : 'success',
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
        // collapsed consecutive polls represented by this one span
        pollCount: record.count,
      },
    });
    if (typeof record.httpStatus === 'number') {
      span.setHttpStatus(record.httpStatus);
    }
    span.finish(toSeconds(end));
  });

  // Finishing the transaction is what enqueues its (single) envelope with all the
  // child spans attached; flush pushes it out.
  transaction.finish(toSeconds(flowEnd));

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort
  }
};
