import { RequestLogger, RequestMock, ClientFunction, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { renderWidget, Constants } from '../framework/shared';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';
import identifyWithDeviceProbingLoopback4 from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-4';
import identifyWithDeviceProbingHttpsLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-https-loopback';
import identifyWithDeviceProbingLoopbackAndChromeLNA from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-chrome-lna.json';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received';
import identifyWithLoopbackFallbackAndroidWithoutLink from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received-android-no-link';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';
import identifyWithSSOExtensionFallback from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback';
import identifyWithSSOExtensionFallbackWithoutLink from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback-no-link';
import identifyWithLaunchUniversalLink from '../../../playground/mocks/data/idp/idx/identify-with-universal-link';
import identifyWithLaunchAppLink from '../../../playground/mocks/data/idp/idx/identify-with-app-link';
import userIsNotAssignedError from '../../../playground/mocks/data/idp/idx/error-user-is-not-assigned.json';

const BEACON_CLASS = 'mfa-okta-verify';
const EARLY_CANCEL_CHALLENGE_REQUEST_WAIT_TIME = 4000;

let failureCount = 0, pollingError = false, appLinkLoopBackFailed = false;
const loopbackSuccessLogger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackSuccessMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    if (failureCount === 2) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo({ url: /2000\/probe/, method: 'OPTIONS' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /2000\/probe/, method: 'GET' })
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, GET, OPTIONS'
  });
const loopbackSuccessWithHttpsMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingHttpsLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    if (failureCount === 2) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithDeviceProbingHttpsLoopback);
    }
  })
  .onRequestTo(/https:\/\/randomorgid.authenticatorlocaldev.com:(2000|6512|6513)\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo('https://randomorgid.authenticatorlocaldev.com:6511/probe')
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo('https://randomorgid.authenticatorlocaldev.com:6511/challenge')
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, GET, OPTIONS'
  });

const loopbackSuccessWithHttpMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingHttpsLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    if (failureCount === 2) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithDeviceProbingHttpsLoopback);
    }
  })
  .onRequestTo(/http:\/\/localhost:(2000|6512|6513)\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo('http://localhost:6511/probe')
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo('http://localhost:6511/challenge')
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, GET, OPTIONS'
  })
  .onRequestTo(/https:\/\/randomorgid.authenticatorlocaldev.com:(2000|6511|6512|6513)\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  });

const loopbackUserCancelLogger = RequestLogger(/cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackUserCancelLoggerMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived);

const loopbackPollTimeoutLogger = RequestLogger(/poll/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackPollTimeoutMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '200';
      res.headers['content-type'] = 'application/json';
      res.setBody(identifyWithDeviceProbingLoopback);
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 2_000));
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 403;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  })
  .onRequestTo(/6512\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6512\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

const loopbackPollFailedLogger = RequestLogger(/poll/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackPollFailedMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '400';
    res.headers['content-type'] = 'application/json';
    res.setBody(userIsNotAssignedError);
  });

const loopbackSuccessButNotAssignedLogger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });

const loopbackSuccessButNotAssignedAppMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';
    if (pollingError) {
      res.statusCode = '400';
      res.setBody(userIsNotAssignedError);
    } else {
      res.statusCode = '200';
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

const loopbackChallengeErrorLogger = RequestLogger(/introspect|probe|challenge|poll|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackChallengeErrorMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo({ url: /2000\/probe/, method: 'OPTIONS'})
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /6511\/challenge/, method: 'OPTIONS'})
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /6511\/challenge/, method: 'POST'})
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  });

const loopbackChallengeWrongProfileLogger = RequestLogger(/introspect|probe|challenge|poll|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackChallengeWrongProfileMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/(2000|6512)\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/(6511|6513)\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 503;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  })
  .onRequestTo(/6513\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 500;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  });

const loopbackFallbackLogger = RequestLogger(/introspect|probe|cancel|launch|poll/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackFallbackMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/(2000|6511|6512|6513)\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator);

const customURILogger = RequestLogger(/okta-verify.html/);
const customURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator);

const universalLinkWithoutLaunchLogger = RequestLogger(/introspect|probe|cancel|launch|poll/, { logRequestBody: true, stringifyRequestBody: true });
const universalLinkWithoutLaunchMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallbackWithoutLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchUniversalLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchUniversalLink);

const universalLinkLogger = RequestLogger(/introspect|probe|cancel|launch|poll/, { logRequestBody: true, stringifyRequestBody: true });
const universalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallback);

const appLinkWithoutLaunchLogger = RequestLogger(/introspect|probe|cancel|launch|poll/, { logRequestBody: true, stringifyRequestBody: true });
const appLinkWithoutLaunchMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';
    if (appLinkLoopBackFailed) {
      res.statusCode = '500';
      res.setBody(identifyWithLaunchAppLink);
    } else {
      res.statusCode = '200';
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo(/(2000|6511|6512|6513)\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(identifyWithLoopbackFallbackAndroidWithoutLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAppLink);

const LoginHintCustomURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator);

const LoginHintUniversalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchUniversalLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchUniversalLink);

const LoginHintAppLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAppLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAppLink);

const loopbackEarlyCancelChallengeErrorLogger = RequestLogger(/introspect|probe|cancel|poll|challenge/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackEarlyCancelChallengeErrorMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback4)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(identify)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback4)
  .onRequestTo({ url: /probe/, method: 'OPTIONS' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /probe/, method: 'GET' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /challenge/, method: 'OPTIONS'})
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /challenge/, method: 'POST'})
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = 400;
      res.headers['access-control-allow-origin'] = '*';
      res.headers['access-control-allow-headers'] = 'X-Okta-Xsrftoken, Content-Type';
      res.setBody({});
      resolve(res);
    }, EARLY_CANCEL_CHALLENGE_REQUEST_WAIT_TIME));
  });

const mockChromeLNAPermissionsQuery = ClientFunction((permissionState) => {
  // Replace the original query method with a mock
  const originalQuery = navigator.permissions.query;
  navigator.permissions.query = (permissionDesc) => {
    // Return a promise that resolves to the specified state
    if (permissionDesc.name === 'local-network-access') {
      return Promise.resolve({ state: permissionState });
    }
    // Fall back to the original method for other permissions
    return originalQuery(permissionDesc);
  };
});

const loopbackLNAGrantedLogger = RequestLogger(/introspect|probe/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackLNAGrantedMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo({ url: /2000\/probe/, method: 'OPTIONS' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /2000\/probe/, method: 'GET' })
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, GET, OPTIONS'
  });

const loopbackLNAPromptTimeoutLogger = RequestLogger(/introspect|probe|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackLNAPromptTimeoutMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo(/(2000|6511|6512|6513)\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA);

const loopbackLNADeniedSilentProbeRegisteredLogger = RequestLogger(/introspect|probe|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackLNADeniedSilentProbeRegisteredMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo(/(2000|6511|6512|6513)\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived);

const loopbackLNADeniedRemediationViewLogger = RequestLogger(/introspect|probe|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackLNADeniedRemediationViewMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond(identifyWithDeviceProbingLoopbackAndChromeLNA);

fixture('Device Challenge Polling View with the Loopback Server, Custom URI, App Link, and Universal Link approaches');

async function setup(t, waitForFormExists = true, mockChromeLNAPermissionState = undefined) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage({ render: false });

  // Allow mocking of navigator.permissions.query({ name: 'local-network-access' }) for testing Chrome LNA loopback remediation flows
  if (mockChromeLNAPermissionState) {
    await mockChromeLNAPermissionsQuery(mockChromeLNAPermissionState);
  }

  await renderWidget();
  if (waitForFormExists) {
    await t.expect(deviceChallengePollPage.formExists()).eql(true);
  }
  return deviceChallengePollPage;
}

async function setupLoopbackFallback(t, widgetOptions, mockChromeLNAPermissionState = undefined) {
  const options = widgetOptions ? { render: false } : {};
  const deviceChallengeFallbackPage = new IdentityPageObject(t);
  await deviceChallengeFallbackPage.navigateToPage(options);

  // Allow mocking of navigator.permissions.query({ name: 'local-network-access' }) for testing Chrome LNA loopback remediation flows
  if (mockChromeLNAPermissionState) {
    await mockChromeLNAPermissionsQuery(mockChromeLNAPermissionState);
  }

  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(deviceChallengeFallbackPage.formExists()).ok();
  return deviceChallengeFallbackPage;
}

test
  .requestHooks(loopbackSuccessLogger, loopbackSuccessMock)('in loopback server approach, probing and polling requests are sent and responded', async t => {
    failureCount = 0;
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/6511\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/6511\/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);
    failureCount = 2;
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6512|6513/))).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackSuccessLogger, loopbackSuccessWithHttpsMock)('in loopback server approach, https loopback succeeds', async t => {
    failureCount = 0;
    // after OKTA-715718 is fixed, should use ".eql(0)" for ".lte(otherProbeCount)" assertions
    const otherProbeCount = process.env.OKTA_SIW_GEN3 === 'true' ? 0 : 1;
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/randomorgid.authenticatorlocaldev.com:2000\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/randomorgid.authenticatorlocaldev.com:6512\/probe/)
    )).lte(otherProbeCount);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/randomorgid.authenticatorlocaldev.com:6513\/probe/)
    )).lte(otherProbeCount);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/randomorgid.authenticatorlocaldev.com:6511\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/randomorgid.authenticatorlocaldev.com:6511\/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);

    failureCount = 2;

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackSuccessLogger, loopbackSuccessWithHttpMock)('in loopback server approach, https loopback fails then http loopback succeeds', async t => {
    failureCount = 0;
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);

    // Assert all https call failed
    // The most accurate assertions should be calling 1 probe for each port
    // But that would be an overkill in the test
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/randomorgid.authenticatorlocaldev.com:(2000|6511|6512|6513)\/probe/)
    )).eql(4);

    // Assert http call will continue
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/localhost:6511\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/localhost:6511\/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);

    failureCount = 2;

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackUserCancelLogger, loopbackUserCancelLoggerMock)('request body has reason value of true when user clicks cancel and go back link', async t => {
    const deviceChallengePollingPage = await setup(t);
    await checkA11y(t);

    deviceChallengePollingPage.clickCancelAndGoBackLink();
    await t.expect(loopbackUserCancelLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'USER_CANCELED' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);
  });

test
  .requestHooks(loopbackPollFailedLogger, loopbackPollFailedMock)('next poll should not start if previous is failed', async t => {
    await setup(t);
    await checkA11y(t);
    await t.wait(10_000);

    await t.expect(loopbackPollFailedLogger.count(
      record => {
        return record.request.url.match(/\/idp\/idx\/authenticators\/poll/);
      })).eql(1);
  });

test
  .requestHooks(loopbackPollTimeoutLogger, loopbackPollTimeoutMock)('new poll does not starts until last one is ended', async t => {
    // For Gen3 first /poll call is performed at widget bootstrap
    await setup(t, !userVariables.gen3);
    await checkA11y(t);
    // This test verify if new /poll calls are made only if the previous one was finished instead of polling with fixed interval.
    // Updating /poll response to take 5 sec to response.
    // Then counting the number of calls that should be done in time interval. Default Timeout for /poll is 2 sec.
    // Expecting to get only 2 calls(first at 2nd sec, second at 9th(5 sec response + 2 sec timeout) second).
    await t.wait(10_000);

    await t.expect(loopbackPollTimeoutLogger.count(
      record => record.request.url.match(/\/idp\/idx\/authenticators\/poll/)
    )).eql(2);
  });

test
  .requestHooks(loopbackChallengeErrorLogger, loopbackChallengeErrorMock)('in loopback server approach, will cancel polling when challenge errors out', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
                record.request.url.match(/introspect/)
    )).eql(1);
    await t.wait(2000); // wait a moment for all probes to fail
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 500 &&
                record.request.url.match(/2000/)
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/6511\/probe/)
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.method === 'post' &&
        record.request.url.match(/6511\/challenge/)
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
              record.request.url.match(/\/idp\/idx\/authenticators\/poll/)
    )).gte(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_RETURNED_ERROR'
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.contains(record => record.request.url.match(/6512|6513/))).eql(false);
  });

test
  .requestHooks(loopbackChallengeWrongProfileLogger, loopbackChallengeWrongProfileMock)('in loopback server approach, will cancel polling when challenge errors out with non-503 status', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 200 &&
                record.request.url.match(/introspect/)
    )).eql(1);
    await t.wait(6000); // wait a moment for all probes to fail
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 500 &&
                record.request.url.match(/(2000|6512)\/probe/)
    )).eql(2);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/(6511|6513)\/probe/)
    )).eql(2);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 503 &&
        record.request.method === 'post' &&
        record.request.url.match(/6511\/challenge/)
    )).eql(1);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.method === 'post' &&
        record.request.url.match(/6513\/challenge/)
    )).eql(1);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_RETURNED_ERROR' &&
        JSON.parse(record.request.body).statusCode === 500
    )).eql(1);
  });

test
  .requestHooks(loopbackSuccessButNotAssignedLogger, loopbackSuccessButNotAssignedAppMock)('loopback succeeds but user is not assigned to app, then clicks cancel link', async t => {
    pollingError = false;
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().visible).eql(true);
    await t.expect(loopbackSuccessButNotAssignedLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.wait(2000);
    await t.expect(loopbackSuccessButNotAssignedLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/2000\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessButNotAssignedLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/2000\/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);

    await t.expect(loopbackSuccessButNotAssignedLogger.contains(record => record.request.url.match(/6511/))).eql(false);
    await t.expect(loopbackSuccessButNotAssignedLogger.contains(record => record.request.url.match(/6512/))).eql(false);
    await t.expect(loopbackSuccessButNotAssignedLogger.contains(record => record.request.url.match(/6513/))).eql(false);

    pollingError = true;
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().visible).eql(true);
  });

test
  .requestHooks(loopbackFallbackLogger, loopbackFallbackMock)('loopback fails and falls back to custom uri', async t => {
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.wait(2000);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(4);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_UNREACHABLE_BY_LOOPBACK' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);
    deviceChallengeFallbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Click "Open Okta Verify" on the browser prompt');
    await deviceChallengePollPageObject.hasText('Didn’t get a prompt?');
    await deviceChallengePollPageObject.hasText('Open Okta Verify');
    await deviceChallengePollPageObject.hasText('Don’t have Okta Verify?');
    await deviceChallengePollPageObject.hasText('Download here');
    await t.expect(deviceChallengePollPageObject.getDownloadOktaVerifyLink()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().exists).eql(true);
  });

const getPageUrl = ClientFunction(() => window.location.href);
test
  .requestHooks(appLinkWithoutLaunchLogger, appLinkWithoutLaunchMock)('loopback fails and falls back to app link', async t => {
    appLinkLoopBackFailed = false;
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
    await t.expect(appLinkWithoutLaunchLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.wait(2000);
    await t.expect(appLinkWithoutLaunchLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(4);
    await t.expect(appLinkWithoutLaunchLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/)
    )).eql(1);
    appLinkLoopBackFailed = true;
    deviceChallengeFallbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');

    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(true);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);

    await t.wait(5000); // wait for FASTPASS_FALLBACK_SPINNER_TIMEOUT

    await t.expect(deviceChallengePollPageObject.waitForPrimaryButtonAfterSpinner().innerText).eql('Open Okta Verify');

    await t.expect(deviceChallengePollPageObject.hasAppLinkContent()).eql(true);
    await t.expect(deviceChallengePollPageObject.getPrimaryButtonText()).eql('Open Okta Verify');
    if(!userVariables.gen3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.expect(getPageUrl()).contains('okta-verify.html');
  });

test
  .requestHooks(customURILogger, customURIMock)('in custom URI approach, Okta Verify is launched', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.wait(100); // opening the page in iframe takes just a moment
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/) // in iframe
    )).eql(1);
    await deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.wait(100); // opening the page in iframe takes just a moment
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/) // in iframe
    )).eql(2);
  });

test
  .requestHooks(customURIMock)('in custom URI approach, Okta Verify iframe should be single and hidden', async t => {
    const deviceChallengePollPageObject = await setup(t);
    let iframe = deviceChallengePollPageObject.getIframe();
    await t.expect(iframe.exists).ok({ timeout: 100 });
    let attributes = await deviceChallengePollPageObject.getCustomUriIframeAttributes();
    await t.expect(attributes.src).contains('okta-verify.html');
    await t.expect(iframe.visible).eql(false);

    await deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    iframe = await deviceChallengePollPageObject.getIframe();
    await t.expect(iframe.exists).ok({ timeout: 100 });
    attributes = await deviceChallengePollPageObject.getCustomUriIframeAttributes();
    await t.expect(attributes.src).contains('okta-verify.html');
    await t.expect(iframe.visible).eql(false);
    await t.expect(deviceChallengePollPageObject.getIframe().count).eql(1);
  });

test
  .requestHooks(universalLinkWithoutLaunchLogger, universalLinkWithoutLaunchMock)('SSO Extension fails and falls back to universal link', async t => {
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
    await t.expect(universalLinkWithoutLaunchLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFallbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');
    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(true);
    await t.expect(deviceChallengePollPageObject.getPrimaryButtonText()).eql('Open Okta Verify');
    if(!userVariables.gen3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.expect(getPageUrl()).contains('okta-verify.html');
  });

test
  .requestHooks(universalLinkLogger, universalLinkMock)('clicking the launch Okta Verify button opens the universal link', async t => {
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
    await t.expect(universalLinkLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFallbackPage.clickOktaVerifyButton();
    await t.expect(getPageUrl()).contains('okta-verify.html');
  });

test
  .requestHooks(LoginHintCustomURIMock)('expect login_hint in CustomURI', async t => {
    const identityPage = await setupLoopbackFallback(t, {
      features: { },
    });

    // enter username as login_hint on the SIW page
    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Click "Open Okta Verify" on the browser prompt');

    // verify login_hint has been appended to the customURI url in the iframe
    const attributes = await deviceChallengePollPageObject.getCustomUriIframeAttributes();
    await t.expect(attributes.src).contains('login_hint='+encodeURIComponent(username));
  });

test
  .requestHooks(LoginHintUniversalLinkMock)('expect login_hint in UniversalLink', async t => {
    const identityPage = await setupLoopbackFallback(t, {
      features: { },
    });

    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');

    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    // verify login_hint has been appended to the universal link url
    await t.expect(getPageUrl()).contains('login_hint='+encodeURIComponent(username));
  });

test
  .requestHooks(LoginHintAppLinkMock)('expect login_hint in AppLink', async t => {
    const identityPage = await setupLoopbackFallback(t, {
      features: { },
    });

    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');

    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(true);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);

    await t.wait(5000); // wait for FASTPASS_FALLBACK_SPINNER_TIMEOUT

    await t.expect(deviceChallengePollPageObject.waitForPrimaryButtonAfterSpinner().innerText).eql('Open Okta Verify');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(false);

    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    // verify login_hint has been appended to the app link url
    await t.expect(getPageUrl()).contains('login_hint='+encodeURIComponent(username));
  });

test
  .requestHooks(loopbackEarlyCancelChallengeErrorLogger, loopbackEarlyCancelChallengeErrorMock)('expect no error message in view', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    
    await deviceChallengePollPageObject.clickCancelAndGoBackLink();
    const identifyPageObject = new IdentityPageObject(t);
    await t.expect(identifyPageObject.getFormTitle()).eql('Sign In');

    await t.wait(EARLY_CANCEL_CHALLENGE_REQUEST_WAIT_TIME + 1000); // wait for delayed challenge request
    
    // no errors in form
    await t.expect(identifyPageObject.getErrorBoxText().exists).notOk();
    await t.expect(loopbackEarlyCancelChallengeErrorLogger.count(
      record => record.response.statusCode === 400 && 
        record.request.method === 'post' &&
        record.request.url.match(/challenge/)
    )).eql(1);
  });

test
  .requestHooks(loopbackLNAGrantedLogger, loopbackLNAGrantedMock)('in loopback server approach, when Chrome Local Network Access permission state is granted, loopback succeeds', async t => {
    const deviceChallengePollPageObject = await setup(t, true, 'granted');
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(loopbackLNAGrantedLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackLNAGrantedLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/probe/)
    )).eql(1);
  });

test
  .requestHooks(loopbackLNAPromptTimeoutLogger, loopbackLNAPromptTimeoutMock)('in loopback server approach, when Chrome Local Network Access permission state is prompt and loopback fails due to timeout, subsequent loopback attempts proceed instead of showing error remediation view', async t => {
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t, undefined, 'prompt');
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
    await t.expect(loopbackLNAPromptTimeoutLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.wait(2000);
    await t.expect(loopbackLNAPromptTimeoutLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(4);
    await t.expect(loopbackLNAPromptTimeoutLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_UNREACHABLE_BY_LOOPBACK' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);

    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
    await deviceChallengeFallbackPage.clickOktaVerifyButton();

    // Even if loopback fails because user does not take action on permission prompt and probe times out, subsequent loopback calls should still proceed
    // though we will simulate them failing again) and not show the error remediation view since the permission state is still `prompt`
    await t.expect(loopbackLNAPromptTimeoutLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(8);
    await t.expect(loopbackLNAPromptTimeoutLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_UNREACHABLE_BY_LOOPBACK' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(2);

    // Even if subsequent loopback calls fail, we should again fall back to Sign In page again and error remediation view should never be shown
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
  });

test
  .requestHooks(loopbackLNADeniedSilentProbeRegisteredLogger, loopbackLNADeniedSilentProbeRegisteredMock)('in loopback server approach, when Chrome Local Network Access permission state is denied but loopback is triggered by registered condition silent probe, loopback fails but error remediation view is not shown', async t => {
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t, undefined, 'denied');
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
    await t.expect(loopbackLNADeniedSilentProbeRegisteredLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.wait(2000);
    await t.expect(loopbackLNADeniedSilentProbeRegisteredLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(4);
    await t.expect(loopbackLNADeniedSilentProbeRegisteredLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_UNREACHABLE_BY_LOOPBACK' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');
  });

test
  .requestHooks(loopbackLNADeniedRemediationViewLogger, loopbackLNADeniedRemediationViewMock)('in loopback server approach, when Chrome Local Network Access permission state is denied and loopback is not triggered by registered condition silent probe, error remediation view is shown', async t => {
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t, undefined, 'denied');
    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Sign In');

    await deviceChallengeFallbackPage.clickOktaVerifyButton();

    await t.expect(deviceChallengeFallbackPage.getFormTitle()).eql('Okta FastPass requires network permission');
    const errorBox = userVariables.gen3 ? deviceChallengeFallbackPage.form.getErrorBox() : deviceChallengeFallbackPage.form.getErrorBoxCallout();
    await t.expect(errorBox.withText('Unable to sign in').exists).eql(true);
    await t.expect(errorBox.withText('The browser is blocking communication with Okta Verify.').exists).eql(true);
    await t.expect(errorBox.withText('To sign in, go to your browser\'s site settings, find "Local network access", and change the permission from "Block" to "Allow." Then, reload this page.').exists).eql(true);
    await t.expect(errorBox.withText('For more information, follow the instructions on the Local Network Access page or contact your administrator for help.').exists).eql(true);
    await t.expect(errorBox.withText('Local Network Access').find('a[href="https://okta.com"]').exists).eql(true);
  });
  