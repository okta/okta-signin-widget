import { RequestLogger, RequestMock, ClientFunction, Selector } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import identifyWithUserVerificationLoopback from '../../../playground/mocks/data/idp/idx/identify-with-user-verification-loopback';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received';
import identifyWithUserVerificationCustomURI from '../../../playground/mocks/data/idp/idx/identify-with-user-verification-custom-uri';
import identifyWithSSOExtensionFallback from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback';
import identifyWithUserVerificationLaunchUniversalLink from '../../../playground/mocks/data/idp/idx/identify-with-user-verification-universal-link';
import SelectAuthenticatorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import selectAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-ov-m2';
import challengeFastPassLoopback from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-loopback.json';
import challengeFastPassCustomUri from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-custom-uri.json';
import challengeFastPassUniversalLink from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-universal-link.json';

const BEACON_CLASS = 'mfa-okta-verify';

let probeSuccess = false;
const loopbackSuccessLogger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackSuccessMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    if (probeSuccess) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithUserVerificationLoopback);
    }
  })
  .onRequestTo(/2000|6511\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/6512\/probe/)
  .respond(null, 200, { 'access-control-allow-origin': '*' })
  .onRequestTo(/6512\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

const loopbackFallbackLogger = RequestLogger(/introspect|probe|cancel|launch|poll/);
const loopbackFallbackMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithUserVerificationLoopback)
  .onRequestTo(/2000|6511|6512|6513\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithUserVerificationCustomURI)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithUserVerificationCustomURI);

const identifyWithLaunchAuthenticatorHttpCustomUri = JSON.parse(JSON.stringify(identifyWithUserVerificationCustomURI));
const mockHttpCustomUri = 'http://localhost:3000/launch-okta-verify';
// replace custom URI with http URL so that we can mock and verify
identifyWithLaunchAuthenticatorHttpCustomUri.currentAuthenticator.value.contextualData.challenge.value.href = mockHttpCustomUri;

const customURILogger = RequestLogger(/launch-okta-verify/);
const customURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithUserVerificationCustomURI)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri);

const identifyWithSSOExtensionFallbackWithoutLink = JSON.parse(JSON.stringify(identifyWithSSOExtensionFallback));
// remove the universal link so that Util.redirect does not open a link and the rest of the flow can be verified
delete identifyWithSSOExtensionFallbackWithoutLink.authenticatorChallenge.value.href;
// replace universal link with http URL so that we can mock and verify
identifyWithUserVerificationLaunchUniversalLink.currentAuthenticator.value.contextualData.challenge.value.href = mockHttpCustomUri;
const universalLinkWithoutLaunchMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallbackWithoutLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithUserVerificationLaunchUniversalLink)
  .onRequestTo(mockHttpCustomUri)
  .respond('<html><h1>open universal link</h1></html>')
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithUserVerificationLaunchUniversalLink);

const identifyWithSSOExtensionFallbackTarget = JSON.parse(JSON.stringify(identifyWithSSOExtensionFallback));
// replace universal link with http URL so that we can mock and verify
identifyWithSSOExtensionFallbackTarget.authenticatorChallenge.value.href = mockHttpCustomUri;
const universalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallbackTarget)
  .onRequestTo(mockHttpCustomUri)
  .respond('<html><h1>open universal link</h1></html>');

fixture('Device Challenge Polling View for user verification with the Loopback Server, Custom URI and Universal Link approaches');

async function setupDeviceChallengePollPage(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

async function setupLoopbackFallback(t) {
  const deviceChallengeFallbackPage = new IdentityPageObject(t);
  await deviceChallengeFallbackPage.navigateToPage();
  return deviceChallengeFallbackPage;
}

test
  .requestHooks(loopbackSuccessLogger, loopbackSuccessMock)('in loopback server approach, probing and polling requests are sent and responded', async t => {
    const deviceChallengePollPageObject = await setupDeviceChallengePollPage(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Signing in using Okta FastPass');
    await t.expect(deviceChallengePollPageObject.getSwitchAuthenticatorButtonText().exists).notOk;
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/introspect|6512/)
    )).eql(3);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/challenge/) &&
      record.request.body.match(/challengeRequest":"eyJraWQiOiJW/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
      record.request.url.match(/2000|6511/)
    )).eql(2);
    probeSuccess = true;
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6513/))).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackFallbackLogger, loopbackFallbackMock)('loopback fails and falls back to custom uri', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFallbackPage.getPageTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(4);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/)
    )).eql(1);
    deviceChallengeFallbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verify account access');
    await t.expect(deviceChallengePollPageObject.getFormSubtitle()).eql('Launching Okta Verify...');
    await t.expect(deviceChallengePollPageObject.getContent())
      .eql('If nothing prompts from the browser, click here to launch Okta Verify, or make sure Okta Verify is installed.');
    await t.expect(deviceChallengePollPageObject.getSwitchAuthenticatorButtonText()).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).notOk;
  });

const getPageUrl = ClientFunction(() => window.location.href);
test
  .requestHooks(customURILogger, customURIMock)('in custom URI approach, Okta Verify is launched', async t => {
    const deviceChallengePollPageObject = await setupDeviceChallengePollPage(t);
    await t.expect(customURILogger.count(
      record => record.request.url.match(/launch-okta-verify/)
    )).eql(1);
    await deviceChallengePollPageObject.clickLaunchOktaVerifyLink();
    await t.expect(customURILogger.count(
      record => record.request.url.match(/launch-okta-verify/)
    )).eql(2);
  });

test
  .requestHooks(loopbackFallbackLogger, universalLinkWithoutLaunchMock)('SSO Extension fails and falls back to universal link', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFallbackPage.getPageTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFallbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Extra verification needed');
    await t.expect(deviceChallengePollPageObject.getContent()).eql('' +
      'Your organization needs extra verification to make sure it\'s you signing in.\n' +
      'To continue, confirm your screen lock in Okta Verify.\n' +
      'Confirm screen lock');
    deviceChallengePollPageObject.clickUniversalLink();
    await t.expect(getPageUrl()).contains(mockHttpCustomUri);
    await t.expect(Selector('h1').innerText).eql('open universal link');
  });

test
  .requestHooks(loopbackFallbackLogger, universalLinkMock)('clicking the launch Okta Verify button opens the universal link', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFallbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFallbackPage.getPageTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFallbackPage.clickOktaVerifyButton();
    await t.expect(getPageUrl()).contains(mockHttpCustomUri);
    await t.expect(Selector('h1').innerText).eql('open universal link');
  });

fixture('Device Challenge Polling View and verify with something else button after selecting FastPass authenticator in factor list');

const selectFastPassWithLoopbackMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(selectAuthenticator)
  .onRequestTo(/idp\/idx\/challenge/)
  .respond(challengeFastPassLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    if (probeSuccess) {
      res.setBody(identify);
    } else {
      res.setBody(challengeFastPassLoopback);
    }
  })
  .onRequestTo(/2000|6511\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/6512\/probe/)
  .respond(null, 200, { 'access-control-allow-origin': '*' })
  .onRequestTo(/6512\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

const selectFastPassWithCustomUriMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(selectAuthenticator)
  .onRequestTo(/idp\/idx\/challenge/)
  .respond(challengeFastPassCustomUri)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(challengeFastPassCustomUri);

const selectFastPassWithUniversalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(selectAuthenticator)
  .onRequestTo(/idp\/idx\/challenge/)
  .respond(challengeFastPassUniversalLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(challengeFastPassUniversalLink);

async function setupSelectAuthenticatorPage(t) {
  const selectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
  await selectAuthenticatorPageObject.navigateToPage();
  return selectAuthenticatorPageObject;
}

test
  .requestHooks(loopbackSuccessLogger, selectFastPassWithLoopbackMock)('select FastPass from factor list, triggers loopback server and succeeds', async t => {
    const selectAuthenticatorPageObject = await setupSelectAuthenticatorPage(t);
    await t.expect(selectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with an authenticator');
    await t.expect(selectAuthenticatorPageObject.getFormSubtitle()).eql('Select from the following options');
    selectAuthenticatorPageObject.selectFactorByIndex(0);

    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Signing in using Okta FastPass');
    await t.expect(deviceChallengePollPageObject.getSwitchAuthenticatorButtonText().exists).notOk;
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect|6512/)
    )).eql(3);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiJW/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511/)
    )).eql(2);
    probeSuccess = true;
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6513/))).eql(false);
  });

test
  .requestHooks(customURILogger, selectFastPassWithCustomUriMock)('select FastPass from factor list, triggers custom uri, and select verify with something else', async t => {
    loopbackFallbackLogger.clear();
    const selectAuthenticatorPageObject = await setupSelectAuthenticatorPage(t);
    await t.expect(selectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with an authenticator');
    await t.expect(selectAuthenticatorPageObject.getFormSubtitle()).eql('Select from the following options');
    selectAuthenticatorPageObject.selectFactorByIndex(0);

    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verify account access');
    await t.expect(deviceChallengePollPageObject.getFormSubtitle()).eql('Launching Okta Verify...');
    await t.expect(deviceChallengePollPageObject.getContent())
      .eql('If nothing prompts from the browser, click here to launch Okta Verify, or make sure Okta Verify is installed.');
    await t.expect(deviceChallengePollPageObject.getSwitchAuthenticatorButtonText()).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).notOk;

    await deviceChallengePollPageObject.clickSwitchAuthenticatorButton();
    const secondSelectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
    await t.expect(secondSelectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with an authenticator');
    await t.expect(secondSelectAuthenticatorPageObject.getFormSubtitle()).eql('Select from the following options');
  });

test
  .requestHooks(loopbackFallbackLogger, selectFastPassWithUniversalLinkMock)('select FastPass from factor list, triggers universal link, and select verify with something else', async t => {
    loopbackFallbackLogger.clear();
    const selectAuthenticatorPageObject = await setupSelectAuthenticatorPage(t);
    await t.expect(selectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with an authenticator');
    await t.expect(selectAuthenticatorPageObject.getFormSubtitle()).eql('Select from the following options');
    selectAuthenticatorPageObject.selectFactorByIndex(0);

    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Extra verification needed');
    await t.expect(deviceChallengePollPageObject.getContent()).eql('' +
      'Your organization needs extra verification to make sure it\'s you signing in.\n' +
      'To continue, confirm your screen lock in Okta Verify.\n' +
      'Confirm screen lock');

    await deviceChallengePollPageObject.clickSwitchAuthenticatorButton();
    const secondSelectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
    await t.expect(secondSelectAuthenticatorPageObject.getFormTitle()).eql('Verify it\'s you with an authenticator');
    await t.expect(secondSelectAuthenticatorPageObject.getFormSubtitle()).eql('Select from the following options');
  });