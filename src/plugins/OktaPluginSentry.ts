import * as Sentry from '@sentry/browser';
import * as Replay from '@sentry/replay';
import { OktaSignInAPI } from '../types/api';
import { EventContext } from '../types/events';
import { EventErrorContext } from '../types/events';
import type AppState from '../v2/models/AppState';
import type { OktaSignIn } from '@okta/okta-signin-widget';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

interface TranslationMeta {
  key?: string;
  type?: string;
  bundleName?: string;
};

export interface SentryOptions {
  sendReportOnStart?: boolean;
};

// globals
declare const SENTRY_DSN: string;
declare const OKTA_SIW_VERSION: string;

let transport: ReturnType<typeof Sentry.makeFetchTransport>;
let replay: Sentry.Replay;
let baseUrl: string;
let opts: SentryOptions;

const SENTRY_HAS_ERRORS_KEY = 'sentry-has-error'; // key in local storage


export const stopSentry = async (timeout = 2000) => {
  await replay?.stop();
  await Sentry.close(timeout);
};


export const initSentry = (widget: OktaSignIn, options: SentryOptions = {}) => {
  opts = options;
  if (typeof SENTRY_DSN === 'undefined') {
    throw new Error('SENTRY_DSN not provided');
  }

  baseUrl = widget.options.baseUrl?.replace(/\/$/, '')
    || widget.options.issuer?.split('/oauth2/')[0] as string;

  const makeOfflineTransport = Sentry.makeBrowserOfflineTransport(
    ('fetch' in window) ? Sentry.makeFetchTransport : Sentry.makeXHRTransport
  );

  replay = new Sentry.Replay({
    networkDetailAllowUrls: [
      `${baseUrl}/idp/idx/`
    ],
    beforeAddRecordingEvent,
    filterNetwork,
    stickySession: false,
  });

  Sentry.init({
    dsn: SENTRY_DSN,
    normalizeDepth: 10, // to view structured context data instead of "[Object]", "[Array]"
    integrations: [
      new Sentry.BrowserTracing(),
      replay,
    ],
    // Performance Monitoring
    tracesSampleRate: 0.0, // disable

    // Replay
    replaysSessionSampleRate: 1.0, // 0.0 for production?
    replaysOnErrorSampleRate: 1.0,

    // Hooks
    beforeBreadcrumb,
    beforeSend,
    beforeSendTransaction,

    // Use offline transport
    transport: (transportOptions) => {
      transport = makeOfflineTransport({
        ...transportOptions,
        maxQueueSize: 100, // default: 30
        fullOffline: true, // custom
      });
      return transport;
    },
  });

  if (typeof OKTA_SIW_VERSION !== 'undefined') {
    Sentry.setTags({
      'siw.version': OKTA_SIW_VERSION,
    });
  }

  // Event listeners
  catchTranslationErrors();
  updateContextOnRender(widget);
  catchErrors(widget);

  if (opts.sendReportOnStart) {
    sendErrorReportWithConsent();
  }
};

export const canSendErrorReport = () => {
  return getErrorCount() > 0;
};

export const clearErrorReport = async () => {
  await transport?.flush?.(-1);
};

export const sendErrorReport = async () => {
  console.log('*****************')
  await transport?.flush?.();
  console.log('***************** end')
};

const sendErrorReportWithConsent = () => {
  if (canSendErrorReport()) {
    setErrorCount(0);
    if (confirm("Send errors to Sentry?")) {
      sendErrorReport();
    } else {
      clearErrorReport();
    }
  } else {
    clearErrorReport();
  }
};

const getErrorCount = () => {
  const cntStr = localStorage.getItem(SENTRY_HAS_ERRORS_KEY);
  return cntStr && parseInt(cntStr) || 0;
};

const setErrorCount = (cnt: number) => {
  localStorage.setItem(SENTRY_HAS_ERRORS_KEY, `${cnt}`);
};

const incrErrorCount = () => {
  setErrorCount(getErrorCount() + 1);
};

// Hooks

const beforeBreadcrumb = (breadcrumb: Sentry.Breadcrumb, _hint?: Sentry.BreadcrumbHint) => {
  // Filter breadcrumbs
  // - Filter out console logs.
  //   Example of unsecure console output: search for "Here is the entire response"
  // - UI click and input events are useful to reproduce errors, contains no input data, just DOM selector
  // - Fetch info has no req/res data, just URL and status text
  // TODO: Message for `ui.*` can be "[Filtered]" by Sentry. Can be fixed by moving into `data` with whitelisted key?
  const allow = ['fetch', 'xhr'].includes(breadcrumb.category!) && breadcrumb.data?.url?.startsWith(baseUrl)
    || breadcrumb.category?.startsWith('ui.')
    || breadcrumb.category?.startsWith('sentry.')
    || breadcrumb.category === 'custom';
  if (allow) {
    console.log('>>> [sentry] breadcrumb: ', breadcrumb.type, breadcrumb.category, breadcrumb);
  } else {
    console.log('sentry ignore', breadcrumb.type, breadcrumb.category, breadcrumb);
  }
  if (breadcrumb.type === 'error' || breadcrumb.level === 'error') {
    incrErrorCount();
  }
  return allow ? breadcrumb : null;
};

const beforeSend = (event: Sentry.Event, _hint: Sentry.EventHint) => {
  // delete event.breadcrumbs;
  console.log('>>> [sentry] event: ', event);
  return event;
};

const beforeSendTransaction = (event: Sentry.Event, _hint: Sentry.EventHint) => {
  return event;
};

// Replay hooks

const filterNetwork = (info: any) => {
  // // https://github.com/denysoblohin-okta/sentry-javascript/pull/1
  if (info?.body?.stateHandle) {
    info.body.stateHandle = '!!! Filtered';
  }
  if (info?.body?.interactionHandle) {
    info.body.interactionHandle = '!!! Filtered';
  }
  if (info?.body?.identifier) {
    info.body.identifier = '!!! Filtered';
  }
  if (info?.body?.credentials) {
    info.body.credentials = '!!! Filtered';
  }
  console.log('@@@ [replay] fetch: ', info);
  return info;
};

const beforeAddRecordingEvent = (e: Replay.ReplayFrameEvent) => {
  if (e.data.tag == 'breadcrumb') {
    console.log('@@@ [replay]', e?.data?.tag, e?.data?.payload?.category, e)
  }
  return e;
};

// Event listeners

const catchErrors = (widget: OktaSignInAPI) => {
  widget.on('afterError', function (context: EventContext, errorContext: EventErrorContext) {
    Sentry.addBreadcrumb({
      type: 'error',
      category: 'custom',
      data: {
        context,
        errorContext,
      },
    });
  });
};

const updateContextOnRender = (widget: OktaSignIn) => {
  widget.on('afterRender', function (context: EventContext) {
    Sentry.addBreadcrumb({
      type: 'debug',
      category: 'custom',
      data: {
        context
      },
    });
    updateContextFromWidget(widget);
  });
};

const catchTranslationErrors = () => {
  document.addEventListener('okta-i18n-error', (evt) => {
    const ev = evt as CustomEvent<TranslationMeta>;
    const ignore = !ev.detail.key || ev.detail.key === 'errors.undefined';
    if (!ignore) {
      Sentry.withScope(function (scope) {
        scope.setLevel("warning");
        scope.setTag('type', ev.detail.type);
        const err = new Error(`No translation for key ${ev.detail.key} in bundle ${ev.detail.bundleName}}`);
        scope.setContext('L10_ERROR', ev.detail as Record<string, unknown>);
        Sentry.captureException(err);
        //incrErrorCount();
      });
    }
  });
};

const updateContextFromWidget = (widget: OktaSignIn) => {
  // Gen2
  const appState = widget.router?.appState as AppState;
  if (appState) {
    updateContextFromAppState(appState);
  }
};

const updateContextFromAppState = (appState: AppState) => {
  const languageCode = appState.settings.get('languageCode');
  const configuredFlow = appState.settings.get('flow');
  const app = {
    ...appState.get('app'),
  };
  const user = appState.get('user');
  const currentFormName = appState.get('currentFormName');
  const currentAuthenticator = pick(appState.get('currentAuthenticator'), [
    'id', 'key', 'type', 'displayName'
  ]);
  const currentAuthenticatorEnrollment = pick(appState.get('currentAuthenticatorEnrollment'), [
    'id', 'key', 'type', 'displayName'
  ]);

  // By default data scrubbing is too agressive by Sentry and applies to app state context:
  // https://help.sentry.io/account/security/why-am-i-seeing-filtered-in-my-event-data/
  // Need to add keys like `currentAuthenticator` and `currentAuthenticatorEnrollment`
  //  to "Safe fields" in Project Settings -> Security & Privacy -> DATA SCRUBBING
  const state = {
    configuredFlow,
    currentFormName,
    ...(Object.keys(currentAuthenticatorEnrollment).length && {currentAuthenticatorEnrollment}),
    ...(Object.keys(currentAuthenticator).length && {currentAuthenticator}),
  };

  Sentry.configureScope(function (scope) {
    scope.setContext('app', app);
    if (user) {
      scope.setUser(omit(user, ['identifier']));
    } else {
      scope.setUser(null);
    }
    if (languageCode) {
      // https://develop.sentry.dev/sdk/event-payloads/contexts/#culture-context
      scope.setContext('culture', {
        locale: languageCode,
      });
    }
    scope.setTransactionName(currentFormName);
    scope.setContext('state', {
      state: {
        value: state
      }
    });
  });
}
