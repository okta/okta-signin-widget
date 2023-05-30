import { datadogRum } from '@datadog/browser-rum';
import AppState from 'v2/models/AppState';
import omit from 'lodash/omit';
import pick from 'lodash/pick';


let baseUrl;

export const initDatadog = () => {
  datadogRum.init({
    applicationId: '7fd06ff9-48cb-4114-8ca1-740d011ad3f6',
    clientToken: 'pub075e14f78857e7f573ab643d46db169b',
    site: 'datadoghq.eu',
    service: 'siw',
    //env: 'production',
    version: window['OKTA_SIW_VERSION'] || '0.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100, // if not included, the default is 100
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    defaultPrivacyLevel: 'mask', // 'mask-user-input', // 'mask'
  });

  datadogRum.startSessionReplayRecording();

  catchTranslationErrors();
};

export const configureDatadog = (appState: AppState) => {
  updateDatadogContext(appState);
};

export const updateDatadogContext = (appState: AppState) => {
  baseUrl = appState.settings.get('baseUrl');
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

  datadogRum.setGlobalContextProperty('state', state);
  datadogRum.setGlobalContextProperty('app', app);
  if (user) {
    datadogRum.setUser(omit(user, ['identifier']));
  } else {
    datadogRum.setUser(null);
  }
}

const catchTranslationErrors = () => {
  document.addEventListener('okta-i18n-error', (ev: CustomEvent) => {
    const ignore = !ev.detail.key || ev.detail.key == 'errors.undefined';
    if (!ignore) {
      const err = new Error(`No translation for key ${ev.detail.key} in bundle ${ev.detail.bundleName}: ${ev.detail.reason}`);
      datadogRum.addError(err, {
        ...ev.detail,
        password: '!!!private!!!',
        identifier: '!!!private!!!',
      });
    }
  });
};

