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
 * The Sentry SDK is loaded via a dynamic `import()` so it is emitted as a
 * separate async chunk and is only downloaded/initialized when the user actually
 * clicks "Send feedback" — zero cost to the critical auth path when the feature
 * is off or unused.
 */
import { SiwDiagnosticBundle } from './feedbackDiagnostics';

export interface FeedbackSentryOptions {
  enabled?: boolean;
  sentryDsn?: string;
  sentryEnvironment?: string;
}

let initialized = false;

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
 * undefined if no DSN is configured or the send fails.
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
  const dsn = options?.sentryDsn;
  if (!dsn) {
    // eslint-disable-next-line no-console
    console.warn('[siw-feedback] No Sentry DSN configured; skipping send.');
    return undefined;
  }

  const Sentry = await import(/* webpackChunkName: "sentry-feedback" */ '@sentry/browser');

  if (!initialized) {
    Sentry.init({
      dsn,
      environment: options?.sentryEnvironment,
      release: `okta-signin-widget-gen3@${bundle.widget.version}+${bundle.widget.commit}`,
      // Keep the SDK lean and scoped strictly to our explicit capture: no
      // auto-captured global errors, breadcrumbs, tracing or replay.
      defaultIntegrations: false,
      integrations: [],
    });
    initialized = true;
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
  const summary = buildFeedbackSummary(bundle);
  const message = userComment ? `${userComment}\n\n---\n${summary}` : summary;
  try {
    Sentry.captureFeedback(
      {
        message,
        associatedEventId: eventId,
        source: 'siw-terminal-feedback',
        tags: {
          engine: 'gen3',
          flow: flow.type,
          formName: flow.formName,
          authenticatorKey: flow.authenticatorKey,
        },
      },
      // Attach the full bundle to the feedback too, so the trail travels with the
      // feedback entry independent of the linked event.
      {
        attachments: [{
          filename: 'siw-diagnostics.json',
          data: JSON.stringify(bundle, null, 2),
          contentType: 'application/json',
        }],
      },
    );
  } catch {
    // feedback is best-effort; never let it break the terminal view
  }

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort
  }

  return eventId;
};
