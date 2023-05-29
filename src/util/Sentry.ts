import * as Sentry from '@sentry/browser';
import AppState from 'v2/models/AppState';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

const SENTRY_DSN = 'https://3aeb188c43df4230921b7bf857b8ac83@o4505233867538432.ingest.sentry.io/4505268101120000';

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

let baseUrl;

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    normalizeDepth: 10, // to view structured context data instead of "[Object]", "[Array]"
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.0, // disable

    // Hooks
    beforeSendTransaction(_event, _hint) {
      // don't send session replay data
      return null;
    },
    beforeBreadcrumb(breadcrumb, _hint) {
      // Filter breadcrumbs
      // - Filter out console logs, use `custom` breadcrumbs instead
      // - UI click and input events are useful to reproduce errors, contains no input data, just DOM selector
      // - Fetch info has no req/res data, just URL and status text
      // TODO: Message for `ui.*` can be "[Filtered]" by Sentry. Can be fixed by moving into `data` with whitelisted key?
      const allow = breadcrumb.category === 'fetch' && breadcrumb.data.url?.startsWith(baseUrl)
        || breadcrumb.category.startsWith('ui.')
        || breadcrumb.category.startsWith('sentry.')
        || breadcrumb.category === 'custom';
      return allow ? breadcrumb : null;
    },
    beforeSend(event, _hint) {
      // delete event.breadcrumbs;
      return event;
    },
  });

  Sentry.setTags({
    'siw.version': window['OKTA_SIW_VERSION'] || '0.0.0',
  });

  catchTranslationErrors();
};

export const configureSentry = (appState: AppState) => {
  updateSentryContext(appState);
};

export const updateSentryContext = (appState: AppState) => {
  baseUrl = appState.settings.get('baseUrl');
  const languageCode = appState.settings.get('languageCode');
  const configuredFlow = appState.settings.get('flow');
  const app = {
    ...appState.get('app'),
    baseUrl,
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

const catchTranslationErrors = () => {
  document.addEventListener('okta-i18n-error', (ev: CustomEvent) => {
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
