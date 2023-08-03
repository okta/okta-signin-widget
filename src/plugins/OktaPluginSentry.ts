import * as Sentry from '@sentry/browser';
import { OktaSignInAPI } from '../types/api';
import { EventContext } from '../types/events';
import { EventErrorContext } from '../types/events';
import type AppState from '../v2/models/AppState';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

interface TranslationMeta {
  key?: string;
  type?: string;
  bundleName?: string;
};

//todo:  1. this.options.settings.callGlobalError(error);  2. updateAppState

const SENTRY_DSN = 'https://0014e1b37cf7473d977b85aea504af70@o4505233867538432.ingest.sentry.io/4505448311816192'; // siw-v2-demo-1

let transport;

// https://okta-24.sentry.io/settings/projects/siw6/security-and-privacy/
// Safe fields in project config:
//  currentAuthenticator
//  currentAuthenticatorEnrollment
//  errorCauses
//  errorSummary
//  currentFormName
//  formName
//  configuredFlow
//  contextData
//  errorContextData
//  authenticatorKey
//  controller

export const stopSentry = async () => {
  await transport?.flush?.();
  //await Sentry.close(2000);
};

export const initSentry = (widget: OktaSignInAPI) => {
  const baseUrl = widget.options['baseUrl']?.replace(/\/$/, '') || widget.options['issuer']?.split('/oauth2/')[0] as string;
  console.log('>>>> sentry init', baseUrl);

  Sentry.init({
    dsn: SENTRY_DSN,
    normalizeDepth: 10, // to view structured context data instead of "[Object]", "[Array]"
    integrations: [
      new Sentry.BrowserTracing(),
      // Replay
      new Sentry.Replay({
        networkDetailAllowUrls: [
          `${baseUrl}/idp/idx/`
        ],
        beforeAddRecordingEvent: (e) => {
          if (e.data.tag == 'breadcrumb') {
            console.log('@@@ [replay]', e?.data?.tag, e?.data?.payload?.category, e)
          }
          return e;
        },
        // https://github.com/denysoblohin-okta/sentry-javascript/pull/1
        filterNetwork: (info: any) => {
          if (info?.body?.stateHandle) {
            info.body.stateHandle = '!!! Filtered';
          }
          if (info?.body?.identifier) {
            info.body.identifier = '!!! Filtered';
          }
          if (info?.body?.credentials) {
            info.body.credentials = '!!! Filtered';
          }
          console.log('@@@ [replay] fetch: ', info);
          return info;
        }
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.0, // disable

    // Replay
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Hooks
    beforeBreadcrumb(breadcrumb, _hint) {
      // Filter breadcrumbs
      // - Filter out console logs, use `custom` breadcrumbs instead
      // - UI click and input events are useful to reproduce errors, contains no input data, just DOM selector
      // - Fetch info has no req/res data, just URL and status text
      // TODO: Message for `ui.*` can be "[Filtered]" by Sentry. Can be fixed by moving into `data` with whitelisted key?
      const allow = ['fetch', 'xhr'].includes(breadcrumb.category) && breadcrumb.data.url?.startsWith(baseUrl)
        || breadcrumb.category.startsWith('ui.')
        || breadcrumb.category.startsWith('sentry.')
        || breadcrumb.category === 'custom';
      if (allow) {
        console.log('>>> [sentry] breadcrumb: ', breadcrumb.type, breadcrumb.category, breadcrumb);
      } else {
        console.log('sentry ignore', breadcrumb.type, breadcrumb.category, breadcrumb);
      }
      if (breadcrumb.type === 'error' || breadcrumb.level === 'error') {
        console.log('!!! [sentry] found error1')
      }
      return allow ? breadcrumb : null;
    },
    beforeSend(event, _hint) {
      // delete event.breadcrumbs;
      console.log('>>> [sentry] event: ', event);
      return event;
    },
    beforeSendTransaction(event, _hint) {
      return event;
    },

    transport: (transportOptions) => {
      const makeTransport = Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport);
      transport = makeTransport(transportOptions);
      return transport;
    },

  });

  Sentry.setTags({
    'siw.version': window['OKTA_SIW_VERSION'] || '0.0.0',
  });

  // catchTranslationErrors();

  // updateContextOnRender(widget);

  // catchErrors(widget);

  console.log('@@@ inited')
};

export const updateSentryContext = (appState: AppState) => {
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

const updateContextOnRender = (widget: OktaSignInAPI) => {
  widget.on('afterRender', function (context: EventContext) {
    Sentry.addBreadcrumb({
      type: 'debug',
      category: 'custom',
      data: {
        context
      },
    });
  });
};

const catchTranslationErrors = () => {
  document.addEventListener('okta-i18n-error', (evt) => {
    const ev = evt as CustomEvent<TranslationMeta>;
    const ignore = !ev.detail.key || ev.detail.key == 'errors.undefined';
    if (!ignore) {
      Sentry.withScope(function (scope) {
        scope.setLevel("warning");
        scope.setTag('type', ev.detail.type);
        const err = new Error(`No translation for key ${ev.detail.key} in bundle ${ev.detail.bundleName}: ${ev.detail.reason}`);
        scope.setContext('L10_ERROR', ev.detail);
        Sentry.captureException(err);
      });
    }
  });
};
