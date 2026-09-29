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
 * Playground Sentry "wrapper" — a POC stand-in for `@okta/sentry-wrapper`.
 *
 * In production Okta, `@okta/sentry-wrapper` runs `Sentry.init()` at page load and
 * publishes `window.Sentry`; apps like the sign-in widget REUSE that global instead
 * of bundling/initing their own SDK. This module reproduces that pattern in the SIW
 * playground so we can POC the widget running purely off an externally-inited, global
 * Sentry (see src/v3/src/util/sentryFeedback.ts `getWrapperSentry`/`resolveSentry`).
 *
 * It is emitted as its OWN bundle (`js/sentry-wrapper.js`, a separate webpack entry)
 * and loaded by playground/index.html BEFORE the widget bundle — mirroring okta-core's
 * separate `sentry-wrapper.pack.js`.
 *
 * POC-specific differences from prod okta-core (intentional):
 * - Pinned to `@sentry/browser` v7 (the widget's consumption code uses v7 APIs:
 *   `getCurrentHub`, `Sentry.Replay`, `startTransaction`, `captureUserFeedback`).
 * - INCLUDES Replay (prod okta-core ships only browserTracing) so the replay+trace
 *   POC can run through the global. The Replay/Breadcrumbs config mirrors the widget's
 *   own bundled-fallback init (`ensureBundledInit` in sentryFeedback.ts) so behavior is
 *   the same whether the wrapper is present or not.
 */
import * as Sentry from '@sentry/browser';

interface PlaygroundSentryConfig {
  sentryDsn?: string;
  deployEnv?: string;
  tracesSampleRate?: string | number;
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

/** v7-safe "already initialized?" check (same one the widget uses to detect us). */
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

  const tracesSampleRate = Number(config.tracesSampleRate);

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.deployEnv ?? 'dev',
    defaultIntegrations: false,
    autoSessionTracking: false,
    integrations: [
      // Replay's network capture (v7) enriches the breadcrumbs produced by the core
      // Breadcrumbs integration; with defaultIntegrations:false we must add it
      // explicitly or the replay Network tab stays empty. GlobalHandlers is omitted,
      // so we do NOT auto-capture unhandled errors.
      new Sentry.Breadcrumbs({
        console: true, dom: true, fetch: true, xhr: true, history: true,
      }),
      new Sentry.Replay({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
        // POC ONLY: capture bodies for IDX calls (PII/secret-bearing — never on real
        // traffic). Scoped to /idp/idx/ paths.
        networkDetailAllowUrls: ['/idp/idx/'],
        networkCaptureBodies: true,
      }),
    ],
    // Buffer mode: Replay records but uploads nothing until the widget flushes it on
    // "Send feedback". Nothing auto-uploads.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // POC: 100% (or the configured rate) so the widget's manual auth.flow transaction
    // survives v7's sampling gate. Scope to a tracesSampler before any real use.
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 1.0,
  });

  // Register the `startTransaction` extension the widget's tracing POC relies on
  // (no BrowserTracing integration is added).
  Sentry.addTracingExtensions();

  // Start Session Replay buffering NOW, at page load, so its fetch/xhr breadcrumb
  // instrumentation is installed before okta-auth-js binds fetch — capturing the IDX
  // calls. The widget's own startFeedbackReplayBuffer() no-ops when a wrapper is
  // present, deferring buffering ownership to us.
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

  // Publish for the widget to consume via getWrapperSentry()/resolveSentry().
  window.Sentry = Sentry;
};

init();
