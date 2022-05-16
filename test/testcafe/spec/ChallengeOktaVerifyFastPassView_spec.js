import { RequestLogger, RequestMock, ClientFunction } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import SelectAuthenticatorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import identifyWithUserVerificationLoopback from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-loopback';
import identifyWithUserVerificationBiometricsErrorMobile from '../../../playground/mocks/data/idp/idx/error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile.json';
import identifyWithUserVerificationBiometricsErrorDesktop from '../../../playground/mocks/data/idp/idx/error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop.json';
import identifyWithUserVerificationCustomURI from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-custom-uri';
import identifyWithSSOExtensionFallback from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback';
import identifyWithSSOExtensionFallbackWithoutLink from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback-no-link';
import identifyWithUserVerificationLaunchUniversalLink from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-universal-link';
import mfaSelect from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received';
import assureWithLaunchAppLink from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-app-link';
import { renderWidget } from '../framework/shared';

const BEACON_CLASS = 'mfa-okta-verify';

let probeSuccess = false;
const loopbackSuccessLogger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackSuccesskMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    if (probeSuccess) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithUserVerificationLoopback);
    }
  })
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

const loopbackBiometricsErrorMobileMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';
    if (probeSuccess) {
      res.statusCode = '400';
      res.setBody(identifyWithUserVerificationBiometricsErrorMobile);
    } else {
      res.statusCode = '200';
      res.setBody(identifyWithUserVerificationLoopback);
    }
  });

const loopbackBiometricsErrorDesktopMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';
    if (probeSuccess) {
      res.statusCode = '400';
      res.setBody(identifyWithUserVerificationBiometricsErrorDesktop);
    } else {
      res.statusCode = '200';
      res.setBody(identifyWithUserVerificationLoopback);
    }
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
  .respond(identifyWithUserVerificationCustomURI);

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

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

async function setupLoopbackFallback(t) {
  const deviceChallengeFalllbackPage = new IdentityPageObject(t);
  await deviceChallengeFalllbackPage.navigateToPage();
  return deviceChallengeFalllbackPage;
}

test
  .requestHooks(loopbackSuccessLogger, loopbackSuccesskMock)('in loopback server approach, probing and polling requests are sent and responded', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
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
        record.request.body.match(/challengeRequest":"eyJraWQiOiJW/)
    )).eql(1);
    // Check if pre-flight HTTP requests were sent
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
      record.request.method === 'options' &&
        record.request.url.match(/2000|6511/)
    )).eql(2);
    probeSuccess = true;
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6513/))).eql(false);
    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackBiometricsNoResponseErrorLogger, loopbackBiometricsNoResponseErrorMock)('in loopback server, when user does not respond to biometrics request, cancel the polling', async t => {
    await setup(t);
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
  .requestHooks(loopbackBiometricsErrorMobileMock)('show biometrics error for mobile platform in loopback', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');

    probeSuccess = true;
    const errorText = deviceChallengePollPageObject.getErrorBox().innerText;
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).notContains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(loopbackBiometricsErrorDesktopMock)('show biometrics error for desktop platform in loopback', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');

    probeSuccess = true;
    const errorText = deviceChallengePollPageObject.getErrorBox().innerText;
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
    loopbackFallbackLogger.clear();
    await setupLoopbackFallback(t);
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_UNREACHABLE_BY_LOOPBACK' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Click "Open Okta Verify" on the browser prompt');
    const content = deviceChallengePollPageObject.getContent();
    await t.expect(content).contains('Didn’t get a prompt?');
    await t.expect(content).contains('Open Okta Verify');
    await t.expect(content).contains('Don’t have Okta Verify?');
    await t.expect(content).contains('Download here');
    await t.expect(deviceChallengePollPageObject.getDownloadOktaVerifyLink()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).notOk();
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    await deviceChallengePollPageObject.clickSwitchAuthenticatorButton();
    const secondSelectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
    await t.expect(secondSelectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with a security method');
  });

test
  .requestHooks(customURILogger, customURIMock)('in custom URI approach, Okta Verify is launched', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.wait(100); // opening the link takes just a moment
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/)
    )).eql(1);
    await deviceChallengePollPageObject.clickLaunchOktaVerifyLink();
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/)
    )).eql(2);
  });

test
  .requestHooks(customURIBiometricsErrorMock)('show biometrics error for desktop platform in custom URI', async t => {
    const deviceChallengePollPageObject = await setup(t);

    const errorText = deviceChallengePollPageObject.getErrorBox().innerText;
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).contains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(loopbackFallbackLogger, universalLinkWithoutLaunchMock)('SSO Extension fails and falls back to universal link', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getPageTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Sign in with Okta FastPass');
    await t.expect(deviceChallengePollPageObject.getSpinner().getStyleProperty('display')).eql('block');
    await t.expect(deviceChallengePollPageObject.getPrimaryButtonText()).eql('Open Okta Verify');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    deviceChallengePollPageObject.clickUniversalLink();
    await t.wait(100); // opening the link takes just a moment
    await t.expect(await (new BasePageObject()).getPageUrl()).contains('okta-verify.html');
  });
  
test
  .requestHooks(universalLinkWithoutLaunchBiometricsErrorMock)('show biometrics error for mobile platform in universal link', async t => {
    const deviceChallengePollPageObject = await setup(t);

    const errorText = deviceChallengePollPageObject.getErrorBox().innerText;
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).notContains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(loopbackFallbackLogger, universalLinkMock)('clicking the launch Okta Verify button opens the universal link', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getPageTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
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

    const errorText = deviceChallengePollPageObject.getErrorBox().innerText;
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).notContains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(loginHintAppLinkMock)('expect login_hint in AppLink when engFastpassMultipleAccounts is on', async t => {
    const identityPage = await setupLoopbackFallback(t);
    await renderWidget({
      features: { engFastpassMultipleAccounts: true },
    });

    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Sign in with Okta FastPass');

    const content = deviceChallengePollPageObject.getContent();
    await t.expect(content)
      .contains('If Okta Verify did not open automatically, tap the button below to reopen Okta Verify.');
    await t.expect(deviceChallengePollPageObject.getFooterSwitchAuthenticatorLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');

    deviceChallengePollPageObject.clickAppLink();
    // verify login_hint has been appended to the app link url
    await t.expect(getPageUrl()).contains('login_hint='+encodeURIComponent(username));
  });
