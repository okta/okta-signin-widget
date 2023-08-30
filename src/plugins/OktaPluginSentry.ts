import * as Sentry from '@sentry/browser';
import * as Replay from '@sentry/replay';
import { OktaSignInAPI } from '../types/api';
import { EventContext } from '../types/events';
import { EventErrorContext } from '../types/events';
import { RenderError } from '../types/results';
import type AppState from '../v2/models/AppState';
import type { OktaSignIn } from '../../src/exports/default';
import Enums from 'util/Enums';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

export interface SentryOptions {
  sendReportOnStart?: boolean;
}

export interface OktaPluginSentry {
  initSentry(widget?: OktaSignInAPI, options?: SentryOptions): Promise<void>;
  setWidgetForSentry(widget: OktaSignInAPI): Promise<void>;
  stopSentry(): void;
  captureWidgetError(err: RenderError): void;
}

interface TranslationMeta {
  key?: string;
  type?: string;
  bundleName?: string;
};

type BeforeSend = Parameters<typeof Sentry.init>[0]['beforeSend'];

// globals
declare const SENTRY_DSN: string;
declare const OKTA_SIW_VERSION: string;

let transport: ReturnType<typeof Sentry.makeFetchTransport>;
let replay: Sentry.Replay;
let baseUrl: string;
let opts: SentryOptions;

const SENTRY_HAS_ERRORS_KEY = 'sentry-has-error'; // key in local storage
const KNOWN_ERROR_NAMES = [
  // auth-js errors
  'OAuthError', 'AuthSdkError', 'AuthPollStopError', 'AuthApiError',
  // SIW errors (src/util/Errors)
  Enums.CONFIG_ERROR, Enums.UNSUPPORTED_BROWSER_ERROR, Enums.OAUTH_ERROR, Enums.AUTH_STOP_POLL_INITIATION_ERROR, 
  Enums.U2F_ERROR, Enums.WEB_AUTHN_ERROR, Enums.WEBAUTHN_ABORT_ERROR, Enums.CONFIGURED_FLOW_ERROR,
];


export const initSentry = async (widget?: OktaSignInAPI, options: SentryOptions = {}) => {
  opts = options;
  if (typeof SENTRY_DSN === 'undefined') {
    throw new Error('SENTRY_DSN not provided');
  }

  const makeOfflineTransport = Sentry.makeBrowserOfflineTransport(
    ('fetch' in window) ? Sentry.makeFetchTransport : Sentry.makeXHRTransport
  );

  Sentry.init({
    dsn: SENTRY_DSN,
    normalizeDepth: 10, // to view structured context data instead of "[Object]", "[Array]"
    integrations: [
      new Sentry.BrowserTracing(),
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

  if (widget) {
    await setWidgetForSentry(widget as OktaSignIn);
  }

  if (opts.sendReportOnStart) {
    sendErrorReportWithConsent();
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, 0);
  });
};

export const setWidgetForSentry = async (widget: OktaSignIn) => {
  baseUrl = widget?.options.baseUrl?.replace(/\/$/, '')
    || widget?.options.issuer?.split('/oauth2/')[0] as string;
  replay?.stop();
  replay = new Sentry.Replay({
    networkDetailAllowUrls: baseUrl ? [
      `${baseUrl}/idp/idx/`
    ] : [],
    beforeAddRecordingEvent,
    filterNetwork,
    stickySession: false,
  });
  const client = Sentry.getCurrentHub().getClient();
  if (client)
    client.addIntegration(replay);
  else
    throw new Error('No Sentry client');

  // Event listeners
  catchTranslationErrors();
  updateContextOnRender(widget);
  catchErrors(widget);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, 0);
  });
};

export const stopSentry = async (timeout = 2000) => {
  await replay?.stop();
  await Sentry.close(timeout);
};

// Manage error report

export const canSendErrorReport = () => {
  return getErrorCount() > 0;
};

export const clearErrorReport = async () => {
  await transport?.flush?.(-1);
};

export const sendErrorReport = async () => {
  console.log('***************** start sending error report to sentry')
  await transport?.flush?.();
  console.log('***************** end')
};

const sendErrorReportWithConsent = () => {
  if (canSendErrorReport()) {
    setErrorCount(0);
    if (confirm("Send last error to Sentry?")) {
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
    //console.log('sentry ignore', breadcrumb.type, breadcrumb.category, breadcrumb);
  }
  // if (breadcrumb.type === 'error' || breadcrumb.category !== 'custom') {
  //   incrErrorCount();
  // }
  return allow ? breadcrumb : null;
};

const beforeSend: BeforeSend = (event, _hint) => {
  // delete event.breadcrumbs;
  console.log('>>> [sentry] event: ', event.level, event);
  if (event.level === 'error' || event.level === 'fatal') {
    incrErrorCount();
  }
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
  if (e?.data?.tag == 'breadcrumb') {
    console.log('@@@ [replay]', e?.data?.tag, e?.data?.payload?.category, e)
  }
  return e;
};

// Manually capture errors

export const captureWidgetError = (err: RenderError) => {
  const ignore = KNOWN_ERROR_NAMES.includes(err?.name) || !(err instanceof Error);
  if (!ignore) {
    Sentry.captureException(err);
    incrErrorCount();
  }
};

// Event listeners

const catchErrors = (widget: OktaSignInAPI) => {
  if (!widget) return;
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

const updateContextOnRender = (widget: OktaSignInAPI) => {
  if (!widget) return;
  widget.on('afterRender', function (context: EventContext) {
    Sentry.addBreadcrumb({
      type: 'debug',
      category: 'custom',
      data: {
        context
      },
    });
    updateContextFromWidget(widget as OktaSignIn);
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
