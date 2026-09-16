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
 * Where `sentryFeedback.ts` sends an on-demand *error event* for forensics, this
 * emits one Sentry *performance transaction* per completed auth flow so the data
 * lands in Sentry's traces dataset — where duration percentiles, group-by-tag
 * counts ("how many flows use okta_verify"), and the per-step waterfall UI are
 * built in.
 *
 * It does NOT hold a live span open across the flow (a full-page redirect would
 * unload the page and drop it). Instead it reconstructs the whole span tree in
 * one synchronous burst at flow completion from the recorded step timeline
 * ({@link getDiagnosticTransactions}) — the same trail the feedback feature
 * already accumulates and persists to sessionStorage.
 *
 * POC caveats:
 * - `tracesSampleRate: 1.0` so every flow shows up while you explore. This will
 *   NOT survive real traffic — scope it to a `tracesSampler` and a low success
 *   rate before any broad use (see docs/terminal-feedback-diagnostics.md).
 * - No auto-instrumentation (`integrations: []`): exactly one transaction per
 *   flow, no pageload/navigation transactions.
 */
import { TransactionRecord } from './feedbackDiagnostics';
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

// Sentry timestamps are Unix *seconds*; our trail records `Date.now()` millis.
const toSeconds = (ms: number): number => ms / 1000;

/**
 * Emit one performance transaction (`op: auth.flow`) with a child span
 * (`op: auth.step`) per recorded transaction. The root span's duration is the
 * total init->finish time; per-flow discriminators ride as searchable
 * attributes. No-op if no DSN is configured or the trail is empty.
 */
export const sendAuthFlowTrace = async (
  records: TransactionRecord[],
  meta: AuthFlowTraceMeta,
  options?: FeedbackSentryOptions,
): Promise<void> => {
  const dsn = options?.sentryDsn;
  if (!dsn || records.length === 0) {
    return;
  }

  const Sentry = await import(/* webpackChunkName: "sentry-feedback" */ '@sentry/browser');

  if (!tracingInitialized) {
    Sentry.init({
      dsn,
      environment: options?.sentryEnvironment,
      release: `okta-signin-widget-gen3@${meta.version}+${meta.commit}`,
      // POC: 100% capture so every flow is observable. Replace with a
      // `tracesSampler` scoped to `siw.auth_flow` before real use.
      tracesSampleRate: 1.0,
      // No global error/breadcrumb capture and no auto-instrumentation — we emit
      // exactly one transaction per auth flow, nothing else.
      defaultIntegrations: false,
      integrations: [],
    });
    tracingInitialized = true;
  }

  const first = records[0].ts;
  const lastTs = records[records.length - 1].ts;
  // Guard a zero/negative window (single-record or clock skew) so the span has
  // a positive duration.
  const end = lastTs > first ? lastTs : first + 1;
  const totalMs = end - first;

  const root = Sentry.startInactiveSpan({
    name: 'siw.auth_flow',
    op: 'auth.flow',
    // Promote to a segment span so it lands as a searchable transaction.
    forceTransaction: true,
    startTime: toSeconds(first),
    attributes: {
      engine: 'gen3',
      flow: meta.flow,
      authenticatorKey: meta.authenticatorKey,
      methodType: meta.methodType,
      finalStep: meta.formName,
      outcome: meta.outcome,
      stepCount: records.length,
      // Root span duration already equals this; kept as an explicit attribute
      // for convenient charting/filtering.
      'auth.total_ms': totalMs,
    },
  });

  // Nest the per-step spans UNDER the root by making it the active span while we
  // create them. Without this, each inactive span has no active parent and v8
  // flushes it as its own root transaction (one /envelope request per step).
  Sentry.withActiveSpan(root, () => {
    records.forEach((record, i) => {
      const stepStart = record.ts;
      const stepEnd = records[i + 1]?.ts ?? end;
      const child = Sentry.startInactiveSpan({
        name: record.step,
        op: 'auth.step',
        startTime: toSeconds(stepStart),
        attributes: {
          seq: record.seq,
          step: record.step,
          requestUrl: record.requestUrl,
          method: record.method,
          httpStatus: record.httpStatus,
          idxStatus: record.idxStatus,
          requestDidSucceed: record.requestDidSucceed,
          authenticatorKey: record.authenticatorKey,
          // collapsed consecutive polls
          pollCount: record.count,
        },
      });
      child?.end(toSeconds(stepEnd >= stepStart ? stepEnd : stepStart + 1));
    });
  });

  root?.end(toSeconds(end));

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort
  }
};
