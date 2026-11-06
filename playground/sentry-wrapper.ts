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
 * Playground Sentry "wrapper" — a local-dev stand-in for okta-ui's `@okta/sentry-wrapper`
 * (packages/sentry-wrapper, the ie11 bundle `sentry-wrapper.ie11.pack.js` the login page
 * loads), so the "Send feedback" feature can be exercised end-to-end without okta-core.
 *
 * Like the real wrapper, it runs `Sentry.init()` at page load and publishes `window.Sentry`;
 * the widget REUSES that global rather than bundling its own SDK. It is its OWN bundle
 * (`js/sentry-wrapper.js`) loaded by playground/index.html BEFORE the widget, mirroring
 * okta-core's load order.
 *
 * Kept in sync with the real wrapper for everything the feedback feature depends on:
 * - Same SDK: `@sentry/browser` 7.80.0 (the ie11 bundle's version; v8+ dropped IE11).
 * - Same config contract: `replay` (opt-in, default off), the `window.okta.sentry` param
 *   okta-core sets.
 * - Same Replay setup: masked, BUFFER mode (sample rates 0), `startBuffering()` right after
 *   init so fetch/XHR are instrumented before okta-auth-js binds fetch; no network headers
 *   or bodies recorded.
 * - Same recording scrubber: console breadcrumbs kept only for warn/error, message only
 *   (arguments dropped), with URLs and token-like strings redacted and the length capped;
 *   URLs in spans and breadcrumbs lose their query and token path segments.
 * - Same `beforeSend` rule for the widget's feedback carrier event: a message tagged
 *   `okta_feedback: true`, kept only when replay is on, minus breadcrumbs / Referer.
 *   Untagged non-error messages are dropped, as in the real wrapper.
 * - Publishes the same `window.okta.sentry` config okta-core sets (the widget only shows
 *   feedback UI when `window.okta.sentry.replay` is true, i.e. on Okta's wrapper).
 * Intentionally omitted (no effect on feedback): BrowserTracing / tracesSampleRate,
 * the error allow/block lists, org host -> org id URL redaction (there's no org id
 * locally), the replay_event URL scrubbing, and the i18n DOM interceptor.
 *
 * Config: the `sentryWrapper` block in `.widgetrc.js` (gitignored, so each engineer points
 * it at their own dev project); `?sentryDsn=...` in the URL overrides the DSN. With no DSN
 * the wrapper is a no-op (window.Sentry stays unset, so the widget hides the feedback UI).
 */
import * as Sentry from '@sentry/browser';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sentryWrapper } = require('../.widgetrc.js'); // commonJS module

// Subset of okta-ui's SentryParams (window.okta.sentry), plus the playground-only DSN keys.
interface PlaygroundSentryConfig {
  dsn?: string;
  environment?: string;
  replay?: boolean;
}

declare global {
  interface Window {
    // Published for the widget to consume.
    Sentry?: typeof Sentry;
    // Set by okta-core on the login page; read by the real wrapper and the widget.
    okta?: { sentry?: { replay?: boolean } };
  }
}

// Same tag name as okta-ui's FEEDBACK_TAG.
const FEEDBACK_TAG = 'okta_feedback';

// Same as okta-ui: console breadcrumb levels kept in the replay (console.warn maps to 'warning').
const CONSOLE_LEVELS_KEPT = ['warning', 'error'];
const CONSOLE_MESSAGE_MAX_LENGTH = 1000;

/** Config precedence: `?sentryDsn=` URL override, then `.widgetrc.js` `sentryWrapper`. */
const resolveConfig = (): PlaygroundSentryConfig => {
  const fromWidgetRc: PlaygroundSentryConfig = sentryWrapper || {};
  let dsnOverride: string | null = null;
  try {
    dsnOverride = new URLSearchParams(window.location.search).get('sentryDsn');
  } catch {
    // no-op: URL parsing is best-effort
  }
  return { ...fromWidgetRc, dsn: dsnOverride || fromWidgetRc.dsn };
};

/** Same check as the ie11 bundle's `isInitialized()` (and the widget's resolveSentry()). */
const isInitialized = (): boolean => {
  try {
    return Boolean(Sentry.getCurrentHub().getClient());
  } catch {
    return false;
  }
};

/**
 * okta-ui's getRedactedReplayUrl minus the org host -> org id step: query and hash query ->
 * `?redacted`, token-like path segments (e.g. /signin/reset-password/<token>) -> `/redacted`.
 */
const redactUrl = (url: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(url, window.location.href);
  } catch {
    return url;
  }
  const hash = parsed.hash.includes('?')
    ? `${parsed.hash.substring(0, parsed.hash.indexOf('?'))}?redacted`
    : parsed.hash;
  const search = parsed.search && '?redacted';
  return `${parsed.protocol}//${parsed.host}${parsed.pathname}${hash}${search}`
    .replace(/\/[A-Za-z0-9_-]{20,}(?=\/|$|[?#])/g, '/redacted');
};

/** Same as okta-ui's getRedactedConsoleMessage. */
const redactConsoleMessage = (message: string): string => {
  const redacted = message
    .replace(/https?:\/\/[^\s"'<>]+/g, redactUrl)
    .replace(/[A-Za-z0-9_-]{20,}/g, (run) => (/\d/.test(run) ? '[redacted]' : run));
  return redacted.length > CONSOLE_MESSAGE_MAX_LENGTH
    ? `${redacted.substring(0, CONSOLE_MESSAGE_MAX_LENGTH)}…`
    : redacted;
};

/** Same rules as okta-ui's scrubReplayRecordingEvent (see redactUrl for the one difference). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scrubReplayRecordingEvent = (event: any) => {
  const { tag, payload } = event?.data ?? {};
  if (!payload) {
    return event;
  }
  if (tag === 'performanceSpan') {
    if (payload.description) {
      payload.description = redactUrl(payload.description);
    }
    if (payload.data?.previous) {
      payload.data.previous = redactUrl(payload.data.previous);
    }
  } else if (tag === 'breadcrumb') {
    if (payload.category === 'console') {
      if (!CONSOLE_LEVELS_KEPT.includes(payload.level)) {
        return null;
      }
      if (payload.data) {
        delete payload.data.arguments;
      }
      payload.message = typeof payload.message === 'string' ? redactConsoleMessage(payload.message) : '';
      return event;
    }
    ['url', 'from', 'to'].forEach((key) => {
      if (typeof payload.data?.[key] === 'string') {
        payload.data[key] = redactUrl(payload.data[key]);
      }
    });
  }
  return event;
};

/** Same rule as okta-ui's isFeedbackCarrierEvent: a message tagged FEEDBACK_TAG, no exception. */
const isFeedbackCarrierEvent = (event: Sentry.Event): boolean => (
  !event.exception
  && typeof event.message === 'string'
  && event.tags?.[FEEDBACK_TAG] === true
);

const init = (): void => {
  const config = resolveConfig();
  if (!config.dsn || isInitialized()) {
    return;
  }
  const replayEnabled = config.replay === true;

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment ?? 'dev',
    sendDefaultPii: false,
    integrations: replayEnabled ? [
      // No networkDetailAllowUrls: network requests are recorded without headers or bodies.
      new Sentry.Replay({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
        beforeAddRecordingEvent: scrubReplayRecordingEvent,
      }),
    ] : [],
    ...(replayEnabled && {
      // Buffer mode only: never sample a session or an error into an uploaded replay.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    }),
    beforeSend: (event) => {
      if (replayEnabled && isFeedbackCarrierEvent(event)) {
        delete event.breadcrumbs;
        if (event.request?.headers?.Referer) {
          delete event.request.headers.Referer;
        }
        return event;
      }
      // The real wrapper filters errors through its allow/block lists; the playground keeps
      // them (scrubbed) so local errors still show up in your dev project.
      if (event.level === 'error' || event.exception) {
        delete event.breadcrumbs;
        return event;
      }
      return null;
    },
  });

  // Same as the ie11 bundle: start buffering right after init (getReplay() maps to this).
  if (replayEnabled) {
    try {
      Sentry.getCurrentHub().getIntegration(Sentry.Replay)?.startBuffering();
    } catch {
      // replay is best-effort; never block page load
    }
  }

  const scope = Sentry.getCurrentHub().getScope();
  scope?.setTag('app_name', 'okta-signin-widget');
  scope?.setTag('team_name', 'siw');
  // Lets us confirm in Sentry that events arrived via the playground stand-in.
  scope?.setTag('sentry_source', 'playground-wrapper');

  window.Sentry = Sentry;
  // What okta-core sets for the real wrapper; the widget gates its feedback UI on it.
  window.okta = { ...window.okta, sentry: { ...window.okta?.sentry, replay: replayEnabled } };
};

init();
