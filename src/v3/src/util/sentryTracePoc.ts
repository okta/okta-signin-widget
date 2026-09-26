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
 * Emits ONE Sentry performance transaction PER IDX request, as the request
 * happens, instead of reconstructing the whole flow into a single transaction at
 * flow completion. Every transaction in a flow shares one `traceId`
 * ({@link TraceContext}); the first request is emitted as the trace root
 * (`spanId === rootSpanId`, no parent) and each later request as a child
 * (`parentSpanId === rootSpanId`). Because the envelopes all carry the same
 * `traceId` and are linked by `parentSpanId`, Sentry's Trace View stitches them
 * back into a single per-step waterfall — while each request is observable the
 * instant it completes (a flow that redirects away or never terminates still
 * leaves a partial trace behind).
 *
 * Pinned to `@sentry/browser` v7 (prod parity for legacy-browser support). v7's
 * `startTransaction` accepts explicit `traceId`/`spanId`/`parentSpanId`, which is
 * what makes the deterministic root/child linkage above possible without any
 * read-back or ordering race.
 *
 * POC caveats:
 * - `tracesSampleRate: 1.0` so every request shows up while you explore. This
 *   will NOT survive real traffic — scope it to a `tracesSampler` and a low rate
 *   before any broad use (see docs/terminal-feedback-diagnostics.md).
 * - No auto-instrumentation (`integrations: []`): only the transactions we emit
 *   here, no pageload/navigation transactions.
 * - Polling ticks are collapsed upstream (one span per distinct step, not one
 *   per poll) so a long poll does not flood Sentry with envelopes.
 */
import { TraceContext, TransactionRecord } from './feedbackDiagnostics';
import { FeedbackSentryOptions } from './sentryFeedback';

export interface AuthFlowTraceMeta {
  flow?: string;
  formName?: string;
  authenticatorKey?: string;
  methodType?: string;
  outcome: 'success' | 'error';
  version: string;
  commit: string;
}

let tracingInitialized = false;

// Sentry v7 timestamps are Unix *seconds*; our trail records `Date.now()` millis.
const toSeconds = (ms: number): number => ms / 1000;

/**
 * Emit one performance transaction for a single IDX request. The caller decides
 * (synchronously, via {@link markRootEmitted}) whether this request is the trace
 * root by passing `asRoot`; that keeps the root decision race-free even if two
 * requests resolve back-to-back. No-op if no DSN is configured.
 *
 * @param record   the just-recorded step (carries real per-request timing)
 * @param traceCtx the flow's shared trace identity
 * @param meta     flow-level discriminators (ride as tags/data)
 * @param options  Sentry DSN/environment
 * @param asRoot   true => emit as the trace root; false => child of the root
 */
export const sendAuthStepSpan = async (
  record: TransactionRecord,
  traceCtx: TraceContext,
  meta: AuthFlowTraceMeta,
  options?: FeedbackSentryOptions,
  asRoot = false,
): Promise<void> => {
  const dsn = options?.sentryDsn;
  if (!dsn) {
    return;
  }

  const Sentry = await import(/* webpackChunkName: "sentry-feedback" */ '@sentry/browser');

  if (!tracingInitialized) {
    Sentry.init({
      dsn,
      environment: options?.sentryEnvironment,
      release: `okta-signin-widget-gen3@${meta.version}+${meta.commit}`,
      // POC: 100% capture so every request is observable. Replace with a
      // `tracesSampler` scoped to `siw.auth_flow` before real use. Required here
      // for our explicit `sampled: true` to survive v7's sampling gate.
      tracesSampleRate: 1.0,
      // No global error/breadcrumb capture and no auto-instrumentation — we emit
      // exactly the transactions below, nothing else.
      defaultIntegrations: false,
      integrations: [],
    });
    // Without the BrowserTracing integration, the hub's `startTransaction`
    // extension is not registered; add it explicitly so manual transactions work.
    Sentry.addTracingExtensions();
    tracingInitialized = true;
  }

  const start = record.requestStartTs ?? record.ts;
  const rawEnd = record.requestEndTs ?? record.ts;
  // Guard a zero/negative window (client-only step or clock skew) so the span has
  // a positive duration.
  const end = rawEnd > start ? rawEnd : start + 1;

  const transaction = Sentry.startTransaction({
    name: asRoot ? 'siw.auth_flow' : record.step,
    op: asRoot ? 'auth.flow' : 'auth.step',
    // Share the flow's trace so every request lands in one waterfall.
    traceId: traceCtx.traceId,
    // Root owns the shared rootSpanId (no parent); children hang off it.
    ...(asRoot
      ? { spanId: traceCtx.rootSpanId }
      : { parentSpanId: traceCtx.rootSpanId }),
    // Force-keep: init sets tracesSampleRate so v7 respects this explicit choice.
    sampled: true,
    startTimestamp: toSeconds(start),
    tags: {
      engine: 'gen3',
      flow: meta.flow ?? '',
      step: record.step,
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
