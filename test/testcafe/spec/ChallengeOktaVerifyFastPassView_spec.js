import { RequestLogger, RequestMock, ClientFunction, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import SelectAuthenticatorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import identifyWithUserVerificationLoopback from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-loopback';
import identifyWithUserVerificationLoopbackWithEnhancedPolling from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-loopback-with-enhanced-polling';
import identifyWithUserVerificationBiometricsErrorMobile from '../../../playground/mocks/data/idp/idx/error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile.json';
import identifyWithUserVerificationBiometricsErrorDesktop from '../../../playground/mocks/data/idp/idx/error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop.json';
import identifyWithUserVerificationCustomURI from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-custom-uri';
import identifyWithSSOExtensionFallback from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback';
import identifyWithSSOExtensionFallbackWithoutLink from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback-no-link';
import identifyWithUserVerificationLaunchUniversalLink from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-universal-link';
import mfaSelect from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received';
import assureWithLaunchAppLink from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-app-link';
import identifyWithDeviceLaunchAuthenticator from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator.json';
import badRequestError from  '../../../playground/mocks/data/idp/idx/error-400-bad-request.json';
import { renderWidget } from '../framework/shared';

const BEACON_CLASS = 'mfa-okta-verify';

const pollCounters = {
  loopbackRedundantPolling: userVariables.gen3 ? -1 : 0,
  loopbackEnhancedPolling: userVariables.gen3 ? -1 : 0,
  loopbackFallback: userVariables.gen3 ? -1 : 0,
};

const resetPollCounter = (mockKey) => {
  // In gen3 there is an extra immediate poll request compared to gen2 so start the count at -1
  pollCounters[mockKey] = userVariables.gen3 ? -1 : 0;
};

const loopbackSuccessLogger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackSuccessInitialPollMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithUserVerificationLoopback);
const loopbackSuccessAfterProbePollMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identify);
const loopbackSuccessMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo({ url: /2000|6511\/probe/, method: 'OPTIONS' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /2000|6511\/probe/, method: 'GET' })
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
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
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithDeviceLaunchAuthenticator);

const loopbackRedundantPollingLogger = RequestLogger(/introspect|probe|challenge|poll/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackRedundantPollingMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(async (req, res) => {
    res.headers['content-type'] = 'application/json';
    switch (pollCounters.loopbackRedundantPolling++) {
    case -1:
      res.statusCode = '200';
      res.setBody(identifyWithUserVerificationLoopback);
      break;
    case 0:
      // specifically make the first poll call takes more time to complete
      // so that we can verify if there will be a redundant poll call after it
      await new Promise((r) => setTimeout(r, 5000));
      res.statusCode = '200';
      res.setBody(identify);
      break;
    default:
      res.statusCode = '400';
      res.setBody(badRequestError);
    }
  })
  .onRequestTo({ url: /2000|6511\/probe/, method: 'OPTIONS' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /2000|6511\/probe/, method: 'GET' })
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
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

const loopbackRedundantPollingForPollCancelMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(async (req, res) => {
    res.headers['content-type'] = 'application/json';
    // specifically make the /poll/cancel call to take more time
    // which simulates the JIT process in the backend
    await new Promise((r) => setTimeout(r, 10000));
    res.statusCode = '200';
    res.setBody(identify);
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(async (req, res) => {
    res.headers['content-type'] = 'application/json';
    res.statusCode = '400';
    res.setBody(badRequestError);
  })
  .onRequestTo(/2000|6511|6512|6513\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  });

const loopbackEnhancedPollingLogger = RequestLogger(/introspect|probe|challenge|poll/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackEnhancedPollingMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopbackWithEnhancedPolling)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(async (req, res) => {
    res.headers['content-type'] = 'application/json';
    switch (pollCounters.loopbackEnhancedPolling++) {
    case -1:
      res.statusCode = '200';
      res.setBody(identifyWithUserVerificationLoopbackWithEnhancedPolling);
      break;
    case 0:
      // give more time for the waiting time
      await new Promise((r) => setTimeout(r, 8000));
      res.statusCode = '200';
      res.setBody(identify);
      break;
    default:
      res.statusCode = '400';
      res.setBody(badRequestError);
    }
  })
  .onRequestTo({ url: /2000|6511\/probe/, method: 'OPTIONS' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /2000|6511\/probe/, method: 'GET' })
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
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

const loopbackBiometricsErrorInitialPollMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithUserVerificationLoopback);

const loopbackBiometricsErrorMobileAfterProbePollMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '400';
    res.setBody(identifyWithUserVerificationBiometricsErrorMobile);
  });
const loopbackBiometricsErrorMobileMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/2000|6511\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
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

const loopbackBiometricsErrorDesktopAfterProbePollMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '400';
    res.setBody(identifyWithUserVerificationBiometricsErrorDesktop);
  });
const loopbackBiometricsErrorDesktopMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/2000|6511\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
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

const loopbackBiometricsNoResponseErrorLogger = RequestLogger(
  /introspect|probe|cancel|challenge|poll/,
  { logRequestBody: true, stringifyRequestBody: true }
);
const loopbackBiometricsNoResponseErrorMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/2000|6511\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6512\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6512\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 500;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(mfaSelect)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithUserVerificationLoopback);

const loopbackFallbackLogger = RequestLogger(
  /introspect|probe|cancel|launch|poll/,
  { logRequestBody: true, stringifyRequestBody: true }
);
const loopbackFallbackMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/2000|6511|6512|6513\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(identifyWithUserVerificationCustomURI)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    switch (pollCounters.loopbackFallback++) {
    case -1:
      res.setBody(identifyWithUserVerificationLoopback);
      break;
    default:
      res.setBody(identifyWithUserVerificationCustomURI);
    }
  });

const customURILogger = RequestLogger(/okta-verify.html/);
const customURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationCustomURI)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithUserVerificationCustomURI)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithUserVerificationCustomURI);

const customURIBiometricsErrorMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationCustomURI)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '400';
    res.headers['content-type'] = 'application/json';
    res.setBody(identifyWithUserVerificationBiometricsErrorDesktop);
  });

const universalLinkWithoutLaunchLogger = RequestLogger(
  /introspect|probe|cancel|launch|poll/,
  { logRequestBody: true, stringifyRequestBody: true }
);

const universalLinkWithoutLaunchMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallbackWithoutLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithUserVerificationLaunchUniversalLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithUserVerificationLaunchUniversalLink);

const universalLinkWithoutLaunchBiometricsErrorMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLaunchUniversalLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '400';
    res.headers['content-type'] = 'application/json';
    res.setBody(identifyWithUserVerificationBiometricsErrorMobile);
  });

const universalLinkLogger = RequestLogger(
  /introspect|probe|cancel|launch|poll/,
  { logRequestBody: true, stringifyRequestBody: true }
);

const universalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallback);

const loginHintAppLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/idp\/idx\/identify/)
  .respond(assureWithLaunchAppLink)
  .onRequestTo(/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(assureWithLaunchAppLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(assureWithLaunchAppLink);

const userVerificationAppLinkBiometricsError = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(assureWithLaunchAppLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '400';
    res.headers['content-type'] = 'application/json';
    res.setBody(identifyWithUserVerificationBiometricsErrorMobile);
  });

fixture('Device Challenge Polling View for user verification and MFA with the Loopback Server, Custom URI and Universal Link approaches');

async function setup(t, mockKey) {
  if (mockKey) {
    resetPollCounter(mockKey);
  }
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  await t.expect(deviceChallengePollPage.formExists()).eql(true);
  return deviceChallengePollPage;
}

async function setupLoopbackFallback(t, widgetOptions, mockKey) {
  if (mockKey) {
    resetPollCounter(mockKey);
  }
  const options = widgetOptions ? { render: false } : {};
  const deviceChallengeFalllbackPage = new IdentityPageObject(t);
  await deviceChallengeFalllbackPage.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(deviceChallengeFalllbackPage.formExists()).eql(true);
  return deviceChallengeFalllbackPage;
}

test
  .meta('gen3', false) // Gen3 does not have the same redundant polling issue as Gen2 and does not need to implement enhancedPollingEnabled, so skip this test
  .requestHooks(loopbackRedundantPollingLogger, loopbackRedundantPollingMock)('in loopback server, redundant polling exists if server returns enhancedPollingEnabled as false', async t => {
    const deviceChallengePollPageObject = await setup(t, 'loopbackRedundantPolling');
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    await t.expect(loopbackRedundantPollingLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/challenge/) &&
        record.request.body.match(/challengeRequest":"02vQULJDA20fnlkloDn2/)
    )).eql(1);

    // If there is redundant polling, SIW will show bad request error
    await t.expect(deviceChallengePollPageObject.form.getErrorBoxText()).contains('Bad request');
    await t.expect(deviceChallengePollPageObject.hasErrorBox()).eql(true);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .meta('gen3', false) // Gen3 does not have the same redundant polling issue as Gen2 and does not need to implement enhancedPollingEnabled, so skip this test
  .requestHooks(loopbackRedundantPollingForPollCancelMock)('in loopback server, no more polling when cancel polling has been called', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');

    // this wait time makes sure we don't assert too early if /poll call happens
    await t.wait(2000);
    await t.expect(deviceChallengePollPageObject.hasErrorBox()).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackEnhancedPollingLogger, loopbackEnhancedPollingMock)('in loopback server, no redundant polling if server returns enhancedPollingEnabled as true', async t => {
    const deviceChallengePollPageObject = await setup(t, 'loopbackEnhancedPolling');
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    // in v3 all cancel buttons are the same so skip this assertion
    if (!userVariables.gen3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    await t.expect(loopbackEnhancedPollingLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/challenge/) &&
        record.request.body.match(/challengeRequest":"02vQULJDA20fnlkloDn2/)
    )).eql(1);

    // If there is no redundant polling, SIW will not show bad request error
    // This waiting time is necessary. It will make sure:
    // 1. if there is a bad request the error, the hasErrorBox will be executed after error box is visible
    // 2. if there is no error, the view is a spinner and hasErrorBox will be false
    // Hence, it's not making sense to use await inside the hasErrorBox method
    await t.wait(2500);
    await t.expect(deviceChallengePollPageObject.hasErrorBox()).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackSuccessLogger, loopbackSuccessMock, loopbackSuccessInitialPollMock)('in loopback server approach, probing and polling requests are sent and responded', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    // in v3 all cancel buttons are the same so skip this assertion
    if (!userVariables.gen3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.method !== 'options' &&
        record.request.url.match(/introspect|6512/)
    )).eql(3);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/challenge/) &&
        record.request.body.match(/challengeRequest":"02vQULJDA20fnlkloDn2/)
    )).eql(1);
    // Check if pre-flight HTTP requests were sent
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.method === 'options' &&
        record.request.url.match(/2000|6511/)
    )).eql(2);

    await t.removeRequestHooks(loopbackSuccessInitialPollMock);
    await t.addRequestHooks(loopbackSuccessAfterProbePollMock);

    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6513/))).eql(false);
    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackBiometricsNoResponseErrorLogger, loopbackBiometricsNoResponseErrorMock)('in loopback server, when user does not respond to biometrics request, cancel the polling', async t => {
    await setup(t);
    await checkA11y(t);
    const secondSelectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
    await t.expect(secondSelectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with a security method');
    await t.expect(loopbackBiometricsNoResponseErrorLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method !== 'options' &&
        record.request.url.match(/introspect|probe/)
    )).eql(2);
    await t.expect(loopbackBiometricsNoResponseErrorLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method !== 'options' &&
        record.request.url.match(/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_RETURNED_ERROR' &&
        JSON.parse(record.request.body).statusCode === 500
    )).eql(1);
    await t.expect(loopbackBiometricsNoResponseErrorLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/probe|challenge/)
    )).eql(3);
  });

test
  .requestHooks(loopbackBiometricsErrorMobileMock, loopbackBiometricsErrorInitialPollMock)('show biometrics error for mobile platform in loopback', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    // in v3 all cancel buttons are the same so skip this assertion
    if (!userVariables.gen3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');

    await t.removeRequestHooks(loopbackBiometricsErrorInitialPollMock);
    await t.addRequestHooks(loopbackBiometricsErrorMobileAfterProbePollMock);

    const errorText = deviceChallengePollPageObject.getErrorBoxText();
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).notContains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(loopbackBiometricsErrorDesktopMock, loopbackBiometricsErrorInitialPollMock)('show biometrics error for desktop platform in loopback', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    // in v3 all cancel buttons are the same so skip this assertion
    if (!userVariables.gen3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');

    await t.removeRequestHooks(loopbackBiometricsErrorInitialPollMock);
    await t.addRequestHooks(loopbackBiometricsErrorDesktopAfterProbePollMock);

    const errorText = deviceChallengePollPageObject.getErrorBoxText();
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).contains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(loopbackFallbackLogger, loopbackFallbackMock)('loopback fails and falls back to custom uri', async t => {
    await setupLoopbackFallback(t, null, 'loopbackFallback');
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_UNREACHABLE_BY_LOOPBACK' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Click "Open Okta Verify" on the browser prompt');
    const content = deviceChallengePollPageObject.getContent();
    await t.expect(content).contains('Didn’t get a prompt?');
    await t.expect(content).contains('Open Okta Verify');
    await t.expect(content).contains('Don’t have Okta Verify?');
    await t.expect(content).contains('Download here');
    await t.expect(deviceChallengePollPageObject.getDownloadOktaVerifyLink()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).notOk();
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    // Need to properly handle 'Verify with something else' link (OKTA-528630)
    if (!userVariables.gen3) {
      await deviceChallengePollPageObject.clickVerifyWithSomethingElseLink();
      const secondSelectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
      await t.expect(secondSelectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with a security method');
    }
  });

test
  .requestHooks(customURILogger, customURIMock)('in custom URI approach, Okta Verify is launched', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.wait(1000); // opening the link takes just a moment
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/)
    )).eql(1);
    await deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/)
    )).eql(2);
  });

test
  .requestHooks(customURIBiometricsErrorMock)('show biometrics error for desktop platform in custom URI', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);

    const errorText = deviceChallengePollPageObject.getErrorBoxText();
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).contains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(universalLinkWithoutLaunchLogger, universalLinkWithoutLaunchMock)('SSO Extension fails and falls back to universal link', async t => {
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getFormTitle()).eql('Sign In');
    await t.expect(universalLinkWithoutLaunchLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconSelector()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');
    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(true);
    await t.expect(deviceChallengePollPageObject.getPrimaryButtonText()).eql('Open Okta Verify');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    // in v3 all cancel buttons are the same so skip this assertion
    if (!userVariables.gen3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.wait(100); // opening the link takes just a moment
    await t.expect(await (new BasePageObject()).getPageUrl()).contains('okta-verify.html');
  });

test
  .requestHooks(universalLinkWithoutLaunchBiometricsErrorMock)('show biometrics error for mobile platform in universal link', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);

    const errorText = deviceChallengePollPageObject.getErrorBoxText();
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).notContains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(universalLinkLogger, universalLinkMock)('clicking the launch Okta Verify button opens the universal link', async t => {
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getFormTitle()).eql('Sign In');
    await t.expect(universalLinkLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    await t.wait(100); // opening the link takes just a moment
    await t.expect(await (new BasePageObject()).getPageUrl()).contains('okta-verify.html');
  });

const getPageUrl = ClientFunction(() => window.location.href);

test
  .requestHooks(userVerificationAppLinkBiometricsError)('show biometrics error for mobile platform in app link', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);

    const errorText = deviceChallengePollPageObject.getErrorBoxText();
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).notContains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(loginHintAppLinkMock)('expect login_hint in AppLink', async t => {
    const identityPage = await setupLoopbackFallback(t, {
      features: { },
    });

    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');

    const content = deviceChallengePollPageObject.getContent();
    await t.expect(content)
      .contains('If Okta Verify did not open automatically, tap Open Okta Verify.');
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');

    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    // verify login_hint has been appended to the app link url
    await t.expect(getPageUrl()).contains('login_hint='+encodeURIComponent(username));
  });
