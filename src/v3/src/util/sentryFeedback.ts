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
 * Design:
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
 *   The feedback UI itself is disabled in IE11 (see {@link isFeedbackAvailable}).
 */

import BrowserFeatures from '../../../util/BrowserFeatures';

type SentryNS = typeof import('@sentry/browser');

/**
 * Tag (value `true`) that marks the feedback carrier event. @okta/sentry-wrapper's
 * beforeSend drops non-error messages unless they carry it, so it must match the
 * wrapper's FEEDBACK_TAG.
 */
export const FEEDBACK_TAG = 'okta_feedback';

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
  /** Optional email the user typed; passed through to the Sentry feedback entry. */
  email?: string;
  /**
   * Whether to attach the Session Replay buffer (the "diagnostic logs" the user
   * consents to). When false, no replay is flushed or linked — only the comment,
   * email, and the fixed tag set are sent. Defaults to false: the replay is only
   * attached when the caller passes the user's consent explicitly.
   */
  attachLogs?: boolean;
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

/**
 * Whether the page runs Okta's own Sentry wrapper with feedback replay on: the
 * `window.okta.sentry` config okta-core sets for `@okta/sentry-wrapper`, with
 * `replay: true`. A `window.Sentry` alone isn't enough: on an embedding page it
 * may be the host's own SDK, which would send the feedback to the host's Sentry
 * project while the UI says "Send feedback to Okta".
 */
const isOktaSentryWrapper = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { okta } = window as any;
  return okta?.sentry?.replay === true;
};

/**
 * Whether the feedback UI should render: `feedback.enabled` AND Okta's Sentry
 * wrapper (see {@link isOktaSentryWrapper}) has initialized `window.Sentry`.
 * Evaluated once per widget mount — the wrapper loads before the widget, so a
 * global that is absent at mount means no send can succeed, and showing the form
 * would only collect input that is then dropped. Logs a warning when the option
 * is on but the wrapper is missing, since that is a host-page setup bug.
 *
 * Always false in IE11: the feedback dialog's fields render collapsed there, and
 * Session Replay (the diagnostic logs the user consents to) does not run in it.
 */
export const isFeedbackAvailable = (enabled?: boolean): boolean => {
  if (!enabled || BrowserFeatures.isIE()) {
    return false;
  }
  if (isOktaSentryWrapper() && resolveSentry()) {
    return true;
  }
  // eslint-disable-next-line no-console
  console.warn(
    '[siw-feedback] feedback.enabled is set but Okta\'s Sentry wrapper is not initialized '
    + '(window.okta.sentry.replay + window.Sentry) — it must load before the widget; '
    + 'hiding the feedback UI.',
  );
  return false;
};

// Upper bound on the replay upload. A stalled upload (proxy, ad blocker holding
// the request open) must not leave the Send button disabled forever.
export const REPLAY_FLUSH_TIMEOUT_MS = 5000;

// Resolves to `fallback` if `promise` hasn't settled within `ms`.
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const getReplay = (Sentry: SentryNS) => {
  try {
    return Sentry.getCurrentHub().getIntegration(Sentry.Replay);
  } catch {
    return undefined;
  }
};

/**
 * Upload the Session Replay buffer (if the wrapper registered Replay) and return
 * its id, which the caller stamps on the feedback event to link the two. This is
 * the only point at which any replay data leaves the browser.
 *
 * `continueRecording: false` stops recording once the buffer is uploaded. The
 * SDK default (true) converts the buffer into a full session recording that
 * keeps streaming everything the user does next — beyond what they consented to
 * ("diagnostic logs with my feedback"). Recording stays off for the rest of the
 * page, so a second send on the same page links the same (earlier) replay.
 *
 * Bounded by {@link REPLAY_FLUSH_TIMEOUT_MS}: if the upload hasn't finished by
 * then, the feedback is sent without a replay link (`hasReplay: false`) rather
 * than linking a replay that may never arrive.
 */
const flushReplay = async (Sentry: SentryNS): Promise<string | undefined> => {
  const replay = getReplay(Sentry);
  if (!replay) {
    return undefined;
  }
  try {
    const flushed = await withTimeout(
      replay.flush({ continueRecording: false }).then(() => true),
      REPLAY_FLUSH_TIMEOUT_MS,
      false,
    );
    return flushed ? replay.getReplayId() : undefined;
  } catch {
    // replay is best-effort; never block the feedback send
    return undefined;
  }
};

// The send itself; may throw if the host's window.Sentry does. See sendFeedbackToSentry.
const send = async (options?: SendFeedbackOptions): Promise<SendFeedbackResult> => {
  const Sentry = resolveSentry();
  if (!Sentry) {
    // eslint-disable-next-line no-console
    console.error(
      '[siw-feedback] window.Sentry not found — the Sentry wrapper must init and '
      + 'publish it before the widget loads; cannot send feedback.',
    );
    return { ok: false };
  }

  // Replay is the "diagnostic logs" the user consents to. Only flush/link it
  // when the caller opted in (attachLogs); no consent, no replay.
  const attachLogs = options?.attachLogs ?? false;
  const replayId = attachLogs ? await flushReplay(Sentry) : undefined;
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
      // Marks this as a user-sent feedback carrier (see FEEDBACK_TAG).
      [FEEDBACK_TAG]: true,
    });
    // Link the replay explicitly: with `continueRecording: false` the replay
    // stays in buffer mode, so the SDK does not auto-link this event. Use the
    // `replay` context, NOT a `replayId` tag — in buffer mode the SDK treats a
    // sent event tagged `replayId` as a sampled error and restarts full session
    // recording, which is exactly what `continueRecording: false` prevents.
    if (replayId) {
      scope.setContext('replay', { replay_id: replayId });
    }
    // The carrier event anchors the User Feedback entry and the replay link. It
    // carries no payload beyond the tags above; all session detail rides in the
    // (scrubbed) replay. Drop the page's breadcrumbs (console, fetch/XHR URLs,
    // DOM clicks) so they don't ride along unmasked — withScope clones the
    // scope, so this only affects this event.
    scope.clearBreadcrumbs();
    eventId = Sentry.captureMessage('SIW user feedback', 'info');
  });

  if (!eventId) {
    return { ok: false };
  }
  // The report is what support reads; if it can't be captured, the send failed
  // (sendFeedbackToSentry turns the throw into `{ ok: false }`).
  Sentry.captureUserFeedback({
    event_id: eventId,
    name: 'SIW user',
    email: options?.email?.trim() || '',
    comments: options?.comment?.trim() || 'SIW user feedback (no comment)',
  });

  try {
    await Sentry.flush(2000);
  } catch {
    // flush is best-effort: both events are already queued for sending
  }

  return { ok: true, eventId, replayId };
};

/**
 * Send a user-feedback report to Sentry.
 *
 * Returns `{ ok: false }` (and logs a loud `console.error`) when no wrapper
 * `window.Sentry` is present. Otherwise flushes the replay, captures a carrier
 * event stamped with the fixed tag set, and links a User Feedback entry to it.
 * `ok` is true only when both the carrier and the User Feedback entry were
 * captured. Never throws or rejects: any error from the host's `window.Sentry`
 * resolves to `{ ok: false }`, so a failure can't break the sign-in UI.
 */
export const sendFeedbackToSentry = async (
  options?: SendFeedbackOptions,
): Promise<SendFeedbackResult> => {
  try {
    return await send(options);
  } catch {
    // eslint-disable-next-line no-console
    console.error('[siw-feedback] sending feedback failed; nothing was confirmed sent.');
    return { ok: false };
  }
};
