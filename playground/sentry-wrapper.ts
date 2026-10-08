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
 * Playground Sentry "wrapper" — a local-dev stand-in for `@okta/sentry-wrapper`.
 *
 * In production, `@okta/sentry-wrapper` runs `Sentry.init()` at page load and
 * publishes a global `window.Sentry`; the Sign-In Widget REUSES that global
 * rather than bundling/initializing its own SDK. This module reproduces that
 * pattern in the SIW playground so engineers can exercise the "Send feedback"
 * feature end-to-end without okta-core.
 *
 * It is emitted as its OWN bundle (`js/sentry-wrapper.js`, a separate webpack
 * entry) and loaded by playground/index.html BEFORE the widget bundle — mirroring
 * okta-core's separate `sentry-wrapper.pack.js` load order.
 *
 * Kept intentionally aligned with the forked prod v7 wrapper (OKTA-1290997):
 * - Pinned to `@sentry/browser` v7 — SIW must run on IE11, and Sentry v8+ dropped
 *   it. The widget's consumption code targets v7 APIs (`getCurrentHub`,
 *   `Sentry.Replay`, `startBuffering`, `captureUserFeedback`).
 * - Session Replay in BUFFER mode: masking fully on, media blocked, sample rates
 *   0 (records to an in-memory buffer, uploads nothing until the widget flushes
 *   it on "Send feedback").
 * - `networkCaptureBodies` ON, scoped to `/idp/idx/`, so the replay retains the
 *   server's error `message`; sensitive fields are redacted by Sentry org +
 *   project data-scrubbing on ingest (see sentry-user-feedback-design.md §3.2).
 *
 * NOT included (out of scope for the user-feedback feature): BrowserTracing /
 * performance transactions / `addTracingExtensions`. This wrapper only provides
 * what the feedback sender consumes.
 */
import * as Sentry from '@sentry/browser';

interface PlaygroundSentryConfig {
  sentryDsn?: string;
  deployEnv?: string;
}

declare global {
  interface Window {
    // Set by the inline <script> in index.html, mirroring okta-core's window.okta.sentry.
    okta?: { sentry?: PlaygroundSentryConfig };
    // Published for the widget to consume.
    Sentry?: typeof Sentry;
  }
}

/** Config precedence: `?sentryDsn=` URL override, then the window.okta.sentry block. */
const resolveConfig = (): PlaygroundSentryConfig => {
  const fromGlobal = (typeof window !== 'undefined' && window.okta?.sentry) || {};
  let dsnOverride: string | null = null;
  try {
    dsnOverride = new URLSearchParams(window.location.search).get('sentryDsn');
  } catch {
    // no-op: URL parsing is best-effort
  }
  return { ...fromGlobal, sentryDsn: dsnOverride || fromGlobal.sentryDsn };
};

/** v7-safe "already initialized?" check (the same guard the widget uses to detect us). */
const alreadyInitialized = (): boolean => {
  try {
    return Boolean(Sentry.getCurrentHub().getClient());
  } catch {
    return false;
  }
};

const init = (): void => {
  const config = resolveConfig();
  if (!config.sentryDsn || alreadyInitialized()) {
    return;
  }

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.deployEnv ?? 'dev',
    defaultIntegrations: false,
    autoSessionTracking: false,
    integrations: [
      // Replay's network capture (v7) enriches the breadcrumbs produced by the
      // core Breadcrumbs integration; with defaultIntegrations:false we must add
      // it explicitly or the replay Network tab stays empty. GlobalHandlers is
      // omitted, so we do NOT auto-capture unhandled errors.
      new Sentry.Breadcrumbs({
        console: true, dom: true, fetch: true, xhr: true, history: true,
      }),
      new Sentry.Replay({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
        // Capture IDX request/response bodies so the replay retains the server's
        // error `message`. Scoped to /idp/idx/. Sensitive fields are redacted by
        // Sentry org + project data-scrubbing on ingest (verified by test); no
        // client-side body redaction is done here. See the design doc §3.2.
        networkDetailAllowUrls: ['/idp/idx/'],
        networkCaptureBodies: true,
      }),
    ],
    // Buffer mode: Replay records but uploads nothing until the widget flushes it
    // on "Send feedback". Nothing auto-uploads.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });

  // Start Session Replay buffering NOW, at page load, so its fetch/xhr breadcrumb
  // instrumentation is installed before okta-auth-js binds fetch — capturing the
  // IDX calls into the in-memory buffer.
  try {
    const replay = Sentry.getCurrentHub().getIntegration(Sentry.Replay);
    replay?.startBuffering();
  } catch {
    // replay is best-effort; never block page load
  }

  const scope = Sentry.getCurrentHub().getScope();
  scope?.setTag('app_name', 'okta-signin-widget');
  scope?.setTag('engine', 'gen3');
  // Lets us confirm in Sentry that events arrived via the wrapper/global path.
  scope?.setTag('sentry_source', 'playground-wrapper');

  // Publish for the widget to consume via resolveSentry().
  window.Sentry = Sentry;
};

init();
