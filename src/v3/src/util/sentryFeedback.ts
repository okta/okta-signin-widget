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
  /** POC: record a masked Session Replay buffer from bootstrap, uploaded only on
   *  the "Send feedback" click and linked to that event. */
  replay?: boolean;
}

type SentryNS = typeof import('@sentry/browser');

let bundledNs: SentryNS | undefined;
let bundledInitialized = false;
// Single in-flight init so the bootstrap `await` and the useOnce kickoff share one
// buffering start (and `startBuffering` is called at most once).
let replayBufferPromise: Promise<void> | undefined;

/**
 * Prefer the wrapper-provided global SDK. In prod, `@okta/sentry-wrapper` runs
 * `Sentry.init()` at page load and publishes `window.Sentry`. Reusing it means SIW
 * does NOT bundle or initialize its own SDK — and, crucially, the wrapper's
 * fetch/xhr instrumentation is already installed before okta-auth-js binds fetch,
 * so Replay captures the IDX calls. Returns undefined unless an initialized
 * wrapper client is present.
 */
const getWrapperSentry = (): SentryNS | undefined => {
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
    // fall through to the bundled fallback
  }
  return undefined;
};

/** Lazy-load our own bundled SDK — fallback for contexts WITHOUT the wrapper (the
 *  standalone playground/tests). Emitted as a separate async chunk. */
const loadBundledSentry = async (): Promise<SentryNS> => {
  if (!bundledNs) {
    bundledNs = await import(/* webpackChunkName: "sentry-feedback" */ '@sentry/browser');
  }
  return bundledNs;
};

/**
 * Init the bundled SDK once (fallback only). This is the SINGLE init for the
 * bundled path: it configures BOTH POCs (Replay/feedback AND the per-request
 * tracing spans in sentryTracePoc.ts) so neither feature calls `Sentry.init()`
 * a second time. A second `init()` on the same v7 singleton rebinds the hub's
 * client, detaching the first feature's integrations (e.g. Replay) — which is
 * exactly what previously broke the replay when `tracePoc` and `replay` were
 * both on. Mirrors what the wrapper does in prod: masked Replay in buffer mode,
 * IDX bodies allowed, nothing auto-uploaded.
 */
const ensureBundledInit = (Sentry: SentryNS, options: FeedbackSentryOptions): void => {
  if (bundledInitialized) {
    return;
  }
  Sentry.init({
    dsn: options.sentryDsn,
    environment: options.sentryEnvironment,
    release: `okta-signin-widget-gen3@${OKTA_SIW_VERSION}+${OKTA_SIW_COMMIT_HASH}`,
    defaultIntegrations: false,
    autoSessionTracking: false,
    integrations: options.replay
      ? [
        // Replay's network capture (v7) does NOT self-instrument fetch/xhr when
        // `client.on` exists (it does for BrowserClient). Instead it enriches the
        // breadcrumbs produced by the core Breadcrumbs integration. With
        // defaultIntegrations:false we must add Breadcrumbs explicitly, or the
        // replay Network tab stays empty. GlobalHandlers is intentionally omitted,
        // so we still do NOT auto-capture unhandled errors.
        new Sentry.Breadcrumbs({
          console: true, dom: true, fetch: true, xhr: true, history: true,
        }),
        new Sentry.Replay({
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
          // POC ONLY: capture bodies for IDX calls (PII/secret-bearing — never on
          // real traffic). Scoped to /idp/idx/ paths.
          networkDetailAllowUrls: ['/idp/idx/'],
          networkCaptureBodies: true,
        }),
      ]
      : [],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // POC: 100% capture so every IDX request emitted by sentryTracePoc.ts is
    // observable, and so its explicit `sampled: true` survives v7's sampling
    // gate. No auto-instrumentation is added (defaultIntegrations:false), so this
    // only affects the transactions we start manually. Replace with a
    // `tracesSampler` scoped to `siw.auth_flow` before any real use.
    tracesSampleRate: 1.0,
  });
  // BrowserTracing is intentionally omitted, so the hub's `startTransaction`
  // extension is not registered by init alone; add it explicitly so the manual
  // transactions in sentryTracePoc.ts work off this same client.
  Sentry.addTracingExtensions();
  bundledInitialized = true;
};

/**
 * Resolve the SDK to use: the wrapper's `window.Sentry` when present (prod path —
 * no init), else our bundled copy which we init on demand. Returns
 * `{ Sentry, external }`; `external` means the wrapper owns init + Replay.
 */
export const resolveSentry = async (
  options?: FeedbackSentryOptions,
): Promise<{ Sentry: SentryNS; external: boolean } | undefined> => {
  const wrapper = getWrapperSentry();
  if (wrapper) {
    return { Sentry: wrapper, external: true };
  }
  if (!options?.sentryDsn) {
    return undefined;
  }
  const Sentry = await loadBundledSentry();
  ensureBundledInit(Sentry, options);
  return { Sentry, external: false };
};

const getReplay = (Sentry: SentryNS) => {
  try {
    return Sentry.getCurrentHub().getIntegration(Sentry.Replay);
  } catch {
    return undefined;
  }
};

/**
 * Ensure a Session Replay is buffering before the terminal error. When the wrapper
 * is present it already initialized Replay and started buffering at page load, so
 * this is a no-op. Only in the bundled-fallback path do we init + startBuffering
 * ourselves. Safe no-op when replay is off.
 */
export const startFeedbackReplayBuffer = (
  options?: FeedbackSentryOptions,
): Promise<void> => {
  // Prod path: the wrapper owns Replay + buffering. Nothing to do here.
  if (!options?.replay || !options?.sentryDsn || getWrapperSentry()) {
    return Promise.resolve();
  }
  if (!replayBufferPromise) {
    replayBufferPromise = (async () => {
      const Sentry = await loadBundledSentry();
      ensureBundledInit(Sentry, options);
      getReplay(Sentry)?.startBuffering();
    })();
  }
  // Awaiting this before the first IDX request guarantees Replay's fetch/xhr
  // instrumentation is installed before okta-auth-js binds its fetch — so the IDX
  // network calls are captured in the replay.
  return replayBufferPromise;
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
  const resolved = await resolveSentry(options);
  if (!resolved) {
    // eslint-disable-next-line no-console
    console.warn('[siw-feedback] No Sentry available (no window.Sentry, no DSN); skipping send.');
    return undefined;
  }
  const { Sentry } = resolved;

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
