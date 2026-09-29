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
 * Sends a {@link SiwDiagnosticBundle} to Sentry as an error event.
 *
 * SIW does NOT bundle or initialize its own Sentry SDK. It REQUIRES a Sentry
 * wrapper (like prod `@okta/sentry-wrapper`, or the playground's
 * `sentry-wrapper.ts`) to have run `Sentry.init()` at page load and published
 * `window.Sentry`. This module (and `sentryTracePoc.ts`) resolve that global via
 * {@link resolveSentry}; if it is absent, the Sentry features hard-fail loudly
 * (a clear console error) rather than silently falling back to a bundled SDK — so
 * the global-Sentry integration is always the thing under test.
 */
import { SiwDiagnosticBundle } from './feedbackDiagnostics';

export interface FeedbackSentryOptions {
  enabled?: boolean;
  /** Unused by SIW now that the wrapper owns init; kept for config compatibility.
   *  The wrapper owns the DSN/environment (playground: window.okta.sentry). */
  sentryDsn?: string;
  sentryEnvironment?: string;
  /** POC: the wrapper records a masked Session Replay buffer from page load; the
   *  widget flushes+links it only on the "Send feedback" click. */
  replay?: boolean;
}

type SentryNS = typeof import('@sentry/browser');

/**
 * Return the wrapper-provided global SDK, or undefined if it isn't present/initialized.
 * A wrapper (prod `@okta/sentry-wrapper`, or the playground `sentry-wrapper.ts`) runs
 * `Sentry.init()` at page load and publishes `window.Sentry`; its fetch/xhr
 * instrumentation is installed before okta-auth-js binds fetch, so Replay captures the
 * IDX calls. This is the ONLY SDK SIW uses — there is no bundled fallback.
 */
export const resolveSentry = (): SentryNS | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = (window as any).Sentry as SentryNS | undefined;
  try {
    if (s && typeof s.getCurrentHub === 'function' && s.getCurrentHub().getClient()) {
      return s;
    }
  } catch {
    // treated as "no wrapper" below
  }
  return undefined;
};

const getReplay = (Sentry: SentryNS) => {
  try {
    return Sentry.getCurrentHub().getIntegration(Sentry.Replay);
  } catch {
    return undefined;
  }
};

/**
 * Build a short, human-readable report from the diagnostic bundle: the terminal
 * error plus the step trail. Used as the User Feedback `message` so the feedback
 * entry is self-descriptive (the full stack lives on the linked event).
 */
const buildFeedbackSummary = (bundle: SiwDiagnosticBundle): string => {
  const { flow, error, transactions } = bundle;
  const errorText = error.messages
    .map((m) => m.message ?? m.i18nKey)
    .filter(Boolean)
    .join('; ') || 'unknown error';
  const trail = transactions
    .map((t) => {
      const repeat = t.count && t.count > 1 ? ` x${t.count}` : '';
      const status = t.httpStatus ? ` (${t.httpStatus})` : '';
      return `${t.step}${repeat}${status}`;
    })
    .join(' -> ') || 'no steps recorded';
  return [
    `SIW gen3 terminal error on "${flow.formName ?? 'unknown'}"`,
    `Error: ${errorText}`,
    `Flow: ${trail}`,
  ].join('\n');
};

/**
 * Capture the diagnostic bundle as a Sentry event. Returns the Sentry event id
 * (usable as a support reference / to associate user feedback later), or
 * undefined if no wrapper `window.Sentry` is present or the send fails.
 *
 * If `userComment` is provided (or always, as an auto-summary), also emits a
 * Sentry *User Feedback* entry associated with the event id, so the report shows
 * up under the User Feedback dashboard and links back to the event that carries
 * the full error + transaction stack.
 */
export const sendFeedbackToSentry = async (
  bundle: SiwDiagnosticBundle,
  options?: FeedbackSentryOptions,
  userComment?: string,
): Promise<string | undefined> => {
  const Sentry = resolveSentry();
  if (!Sentry) {
    // Hard-fail loudly: SIW requires the wrapper's global window.Sentry (there is
    // no bundled fallback). A missing/late wrapper is a setup bug we want to see.
    // eslint-disable-next-line no-console
    console.error('[siw-feedback] window.Sentry not found — the Sentry wrapper must init and publish it before the widget loads; cannot send feedback.');
    return undefined;
  }

  // If a replay buffer has been recording (feedback.replay), flush it NOW so the
  // in-memory recording uploads and the exception captured just below is stamped
  // with its replay_id — that is what links the replay to this feedback event.
  // This is the only point at which any replay data leaves the browser.
  let replayId: string | undefined;
  if (options?.replay) {
    const replay = getReplay(Sentry);
    try {
      await replay?.flush();
      replayId = replay?.getReplayId();
    } catch {
      // replay is best-effort; never block the feedback send
    }
  }

  const { flow, widget } = bundle;
  let eventId: string | undefined;

  Sentry.withScope((scope) => {
    scope.setTags({
      engine: 'gen3',
      siwVersion: widget.version,
      flow: flow.type,
      formName: flow.formName,
      authenticatorKey: flow.authenticatorKey,
      hasReplay: Boolean(replayId),
    });
    // Keep the raw IDX responses OUT of the indexed context (they are bulky and
    // PII/secret-bearing). Strip `rawResponse` from each transaction for the
    // searchable context; the full bundle goes to the attachment below.
    const leanBundle = {
      ...bundle,
      transactions: bundle.transactions.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ rawResponse, requestBody, ...t }) => t,
      ),
    };
    scope.setContext('siwDiagnostics', leanBundle as unknown as Record<string, unknown>);
    scope.addAttachment({
      filename: 'siw-diagnostics.json',
      data: JSON.stringify(bundle, null, 2),
      contentType: 'application/json',
    });
    eventId = Sentry.captureException(
      new Error(`SIW gen3 terminal error: ${flow.formName ?? 'unknown'}`),
    );
  });

  // Emit a User Feedback entry linked to the event above. The event is the
  // carrier of the structured stack (context + attachment); this feedback entry
  // is what surfaces in Sentry's User Feedback dashboard and links back to it.
  // A typed user comment (when we add a text field) is prepended to the
  // auto-summary of the error + step trail.
  //
  // Sentry v7 `captureUserFeedback` links purely by `event_id` (no source/tags/
  // attachment args — those already rode with the linked event above).
  const summary = buildFeedbackSummary(bundle);
  const message = userComment ? `${userComment}\n\n---\n${summary}` : summary;
  if (eventId) {
    try {
      Sentry.captureUserFeedback({
        event_id: eventId,
        name: 'SIW gen3',
        email: '',
        comments: message,
      });
    } catch {
      // feedback is best-effort; never let it break the terminal view
    }
  }

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort
  }

  return eventId;
};
