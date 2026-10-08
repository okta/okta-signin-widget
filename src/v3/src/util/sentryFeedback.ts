/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
 * "Send feedback" sender for gen3.
 *
 * On a user-initiated click (from ANY view) this flushes the Sentry Session
 * Replay buffer and emits a linked Sentry *User Feedback* entry, so support and
 * engineering can see what the user went through and where it broke.
 *
 * Design (src/v3/docs/sentry-user-feedback-design.md):
 * - Client data comes PURELY from the wrapper's masked Session Replay buffer.
 *   There is no custom diagnostic trail, no per-step span stack, no fetch tap,
 *   and no raw-response capture (all of which were POC-only and are dropped).
 * - Redaction is handled by Sentry org + project data-scrubbing rules, not by
 *   bespoke client-side payload scrubbing.
 * - SIW does NOT bundle or initialize its own Sentry SDK. It REQUIRES a wrapper
 *   (prod `@okta/sentry-wrapper`, or the playground `sentry-wrapper.ts`) to have
 *   run `Sentry.init()` at page load and published a global `window.Sentry`.
 *   {@link resolveSentry} returns that global; if it is absent/uninitialized the
 *   sender HARD-FAILS loudly (a clear `console.error`) rather than silently
 *   falling back — a missing/late wrapper is a setup bug we want to see.
 * - IE11: the widget's consumption code targets v7 APIs (`getCurrentHub`,
 *   `Sentry.Replay`, `captureUserFeedback`) because Sentry v8+ dropped IE11.
 */

type SentryNS = typeof import('@sentry/browser');

/**
 * Fixed, enumerated, low-cardinality tag set attached to the feedback event.
 * Nothing here is free-form or PII (the only free-form field is the user's
 * comment). `factor` is deliberately NOT named `authenticator*`: the okta-prod
 * org scrubber strips any `auth*` field, which would blank it out.
 */
export interface FeedbackContext {
  /** IDX flow type, e.g. `authenticate`. */
  flow?: string;
  /** Current form/remediation name, e.g. `challenge-authenticator`. */
  formName?: string;
  /** Authenticator key, e.g. `okta_verify`. Named `factor` to survive scrubbing. */
  factor?: string;
}

export interface SendFeedbackOptions {
  /** Optional free-form comment typed by the user. */
  comment?: string;
  /** Low-cardinality context tags (see {@link FeedbackContext}). */
  context?: FeedbackContext;
}

export interface SendFeedbackResult {
  ok: boolean;
  /** Sentry event id the feedback is linked to (when the send succeeded). */
  eventId?: string;
  /** Replay id linked to the event, when a replay buffer was flushed. */
  replayId?: string;
}

/**
 * Return the wrapper-provided global SDK, or `undefined` if it is not present or
 * not initialized. A wrapper runs `Sentry.init()` at page load, publishes
 * `window.Sentry`, and (in buffer mode) starts Session Replay before
 * okta-auth-js binds fetch — so Replay captures the IDX calls. This is the ONLY
 * SDK SIW uses; there is no bundled fallback.
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
 * Flush the Session Replay buffer (if the wrapper registered Replay) so the
 * in-memory recording uploads and the event captured just after is stamped with
 * its `replay_id` — that id is what links the replay to this feedback. This is
 * the only point at which any replay data leaves the browser.
 */
const flushReplay = async (Sentry: SentryNS): Promise<string | undefined> => {
  const replay = getReplay(Sentry);
  if (!replay) {
    return undefined;
  }
  try {
    await replay.flush();
    return replay.getReplayId();
  } catch {
    // replay is best-effort; never block the feedback send
    return undefined;
  }
};

/**
 * Send a user-feedback report to Sentry.
 *
 * Returns `{ ok: false }` (and logs a loud `console.error`) when no wrapper
 * `window.Sentry` is present. Otherwise flushes the replay, captures a carrier
 * event stamped with the fixed tag set, and links a User Feedback entry to it.
 * Best-effort throughout: a failure must never break the sign-in UI.
 */
export const sendFeedbackToSentry = async (
  options?: SendFeedbackOptions,
): Promise<SendFeedbackResult> => {
  const Sentry = resolveSentry();
  if (!Sentry) {
    // eslint-disable-next-line no-console
    console.error(
      '[siw-feedback] window.Sentry not found — the Sentry wrapper must init and '
      + 'publish it before the widget loads; cannot send feedback.',
    );
    return { ok: false };
  }

  const replayId = await flushReplay(Sentry);
  const { flow, formName, factor } = options?.context ?? {};

  let eventId: string | undefined;
  Sentry.withScope((scope) => {
    scope.setTags({
      engine: 'gen3',
      siwVersion: typeof OKTA_SIW_VERSION === 'undefined' ? undefined : OKTA_SIW_VERSION,
      flow,
      formName,
      // `factor` (not `authenticatorKey`) — see FeedbackContext.
      factor,
      hasReplay: Boolean(replayId),
    });
    // The carrier event anchors the User Feedback entry and the replay link. It
    // carries no payload beyond the tags above; all session detail rides in the
    // (scrubbed) replay.
    eventId = Sentry.captureMessage('SIW user feedback', 'info');
  });

  if (eventId) {
    try {
      Sentry.captureUserFeedback({
        event_id: eventId,
        name: 'SIW user',
        email: '',
        comments: options?.comment?.trim() || 'SIW user feedback (no comment)',
      });
    } catch {
      // feedback is best-effort; never let it break the view
    }
  }

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort
  }

  return { ok: Boolean(eventId), eventId, replayId };
};
