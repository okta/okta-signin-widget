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
 * - Same config contract: `replay` (opt-in, default off) and `replayNetworkDetailAllowUrls`
 *   (JSON Array String, default none) — the `window.okta.sentry` params okta-core sets.
 * - Same Replay setup: masked, BUFFER mode (sample rates 0), `startBuffering()` right after
 *   init so fetch/XHR are instrumented before okta-auth-js binds fetch; network bodies only
 *   for the allow-listed URLs.
 * - Same `beforeSend` rule for non-error message events (the widget's feedback carrier
 *   event): kept only when replay is on, minus breadcrumbs / Referer.
 * Intentionally omitted (no effect on feedback): BrowserTracing / tracesSampleRate,
 * the error allow/block lists, org-id URL redaction, and the i18n DOM interceptor.
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
  replayNetworkDetailAllowUrls?: string;
}

declare global {
  interface Window {
    // Published for the widget to consume.
    Sentry?: typeof Sentry;
  }
}

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

/** Same parsing as okta-ui's getReplayNetworkDetailAllowUrls: invalid/missing -> []. */
const getReplayNetworkDetailAllowUrls = ({ replayNetworkDetailAllowUrls }: PlaygroundSentryConfig): string[] => {
  try {
    const urls = JSON.parse(replayNetworkDetailAllowUrls as string);
    if (!Array.isArray(urls)) {
      return [];
    }
    return urls.filter((url) => typeof url === 'string' && url !== '');
  } catch {
    return [];
  }
};

/** Same rule as okta-ui's isNonErrorMessageEvent: captureMessage below error level, no exception. */
const isNonErrorMessageEvent = (event: Sentry.Event): boolean => (
  !event.exception
  && typeof event.message === 'string'
  && !['error', 'fatal'].includes(event.level as string)
);

const init = (): void => {
  const config = resolveConfig();
  if (!config.dsn || isInitialized()) {
    return;
  }
  const replayEnabled = config.replay === true;
  const networkDetailAllowUrls = getReplayNetworkDetailAllowUrls(config);

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment ?? 'dev',
    sendDefaultPii: false,
    integrations: replayEnabled ? [
      new Sentry.Replay({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
        networkDetailAllowUrls,
        // bodies are only captured for networkDetailAllowUrls, so this is a no-op when empty
        networkCaptureBodies: networkDetailAllowUrls.length > 0,
      }),
    ] : [],
    ...(replayEnabled && {
      // Buffer mode only: never sample a session or an error into an uploaded replay.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    }),
    beforeSend: (event) => {
      if (replayEnabled && isNonErrorMessageEvent(event)) {
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
};

init();
