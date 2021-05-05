import { RequestLogger, RequestMock, ClientFunction, Selector } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';
import identifyWithSSOExtensionFallback from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback';
import identifyWithLaunchUniversalLink from '../../../playground/mocks/data/idp/idx/identify-with-universal-link';

const BEACON_CLASS = 'mfa-okta-verify';

let failureCount = 0;
const loopbackSuccessLogger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackSuccesskMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    if (failureCount === 2) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithDeviceProbingLoopback);
    }
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

const loopbackSuccessForChallengeTimeoutLogger = RequestLogger(/introspect|probe|challenge|poll|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackSuccessForChallengeTimeoutMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback)
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
  .onRequestTo(/6511\/challenge/)
  .respond(async (req, res) => {
    await new Promise((r) => setTimeout(r, 3100));
    res.statusCode = req.method !== 'POST' ? 204 : 200;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  });

const loopbackOVFallbackLogger = RequestLogger(/introspect|probe|challenge|poll|cancel/);
const loopbackOVFallbackMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
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
  .onRequestTo(/6511\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 401;
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
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 500;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived);

const loopbackFallbackLogger = RequestLogger(/introspect|probe|cancel|launch|poll/);
const loopbackFallbackMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/2000|6511|6512|6513\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator);

const identifyWithLaunchAuthenticatorHttpCustomUri = JSON.parse(JSON.stringify(identifyWithLaunchAuthenticator));
const mockHttpCustomUri = 'http://localhost:6512/launch-okta-verify';
// replace custom URI with http URL so that we can mock and verify
identifyWithLaunchAuthenticatorHttpCustomUri.authenticatorChallenge.value.href = mockHttpCustomUri;

const customURILogger = RequestLogger(/launch-okta-verify/);
const customURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri)
  .onRequestTo(/6512\/launch-okta-verify/)
  .respond('<html><h1>Launch Okta Verify Mock</h1></html>');

const identifyWithSSOExtensionFallbackWithoutLink = JSON.parse(JSON.stringify(identifyWithSSOExtensionFallback));
// remove the universal link so that Util.redirect does not open a link and the rest of the flow can be verified
delete identifyWithSSOExtensionFallbackWithoutLink.authenticatorChallenge.value.href;
// replace universal link with http URL so that we can mock and verify
identifyWithLaunchUniversalLink.authenticatorChallenge.value.href = mockHttpCustomUri;
const universalLinkWithoutLaunchMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallbackWithoutLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchUniversalLink)
  .onRequestTo(mockHttpCustomUri)
  .respond('<html><h1>open universal link</h1></html>')
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchUniversalLink);

const identifyWithSSOExtensionFallbackTarget = JSON.parse(JSON.stringify(identifyWithSSOExtensionFallback));
// replace universal link with http URL so that we can mock and verify
identifyWithSSOExtensionFallbackTarget.authenticatorChallenge.value.href = mockHttpCustomUri;
const universalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallbackTarget)
  .onRequestTo(mockHttpCustomUri)
  .respond('<html><h1>open universal link</h1></html>');

fixture('Device Challenge Polling View with the Loopback Server, Custom URI and Universal Link approaches');

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
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().innerText).eql('Cancel and take me to sign in');
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/6512\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/6512\/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);
    failureCount = 2;
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/6511\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 403 &&
        record.request.url.match(/6511\/challenge/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6513/))).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackSuccessForChallengeTimeoutLogger, loopbackSuccessForChallengeTimeoutMock)('in loopback server approach, will pool but not cancel when challenge timeout', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().innerText).eql('Cancel and take me to sign in');
    await t.expect(loopbackSuccessForChallengeTimeoutLogger.count(
      record => record.response.statusCode === 200 &&
                record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackSuccessForChallengeTimeoutLogger.count(
      record => record.response.statusCode === 500 &&
                record.request.url.match(/2000/)
    )).eql(1);
    await t.expect(loopbackSuccessForChallengeTimeoutLogger.count(
      record => record.response.statusCode === 200 &&
                record.request.url.match(/6511\/probe/)
    )).eql(1);

    await t.expect(loopbackSuccessForChallengeTimeoutLogger.contains(record => record.request.url.match(/6512/))).eql(false);
    await t.expect(loopbackSuccessForChallengeTimeoutLogger.contains(record => record.request.url.match(/6513/))).eql(false);

    await t.expect(loopbackSuccessForChallengeTimeoutLogger.count(
      record => record.response.statusCode === 200 &&
              record.request.url.match(/\/idp\/idx\/authenticators\/poll/)
    )).gte(1);
    await t.expect(loopbackSuccessForChallengeTimeoutLogger.contains(record => record.request.url.match(/\/idp\/idx\/authenticators\/poll\/cancel/))).eql(false);
  });

test
  .requestHooks(loopbackFallbackLogger, loopbackFallbackMock)('loopback fails and falls back to custom uri', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getPageTitle()).eql('Sign In');
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
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Click "Open Okta Verify" on the browser prompt');
    const content = deviceChallengePollPageObject.getContent();
    await t.expect(content).contains('Didn’t get a prompt?');
    await t.expect(content).contains('Launch Okta Verify');
    await t.expect(content).contains('Don’t have Okta Verify?');
    await t.expect(content).contains('Download here');
    await t.expect(deviceChallengePollPageObject.getDownloadOktaVerifyLink()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(deviceChallengePollPageObject.getFooterLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterLink().getAttribute('href')).eql('http://localhost:3000');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
  });

test
  .requestHooks(customURILogger, customURIMock)('in custom URI approach, Okta Verify is launched', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(customURILogger.count(
      record => record.request.url.match(/launch-okta-verify/)
    )).eql(1);
    await deviceChallengePollPageObject.clickLaunchOktaVerifyLink();
    await t.expect(customURILogger.count(
      record => record.request.url.match(/launch-okta-verify/)
    )).eql(2);
  });

const getPageUrl = ClientFunction(() => window.location.href);
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
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Sign in using Okta Verify on this device');
    await t.expect(deviceChallengePollPageObject.getSpinner().getStyleProperty('display')).eql('block');
    await t.expect(deviceChallengePollPageObject.getPrimiaryButtonText()).eql('Reopen Okta Verify');
    await t.expect(deviceChallengePollPageObject.getFooterLink().innerText).eql('Verify with something else');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    deviceChallengePollPageObject.clickUniversalLink();
    await t.expect(getPageUrl()).contains(mockHttpCustomUri);
    await t.expect(Selector('h1').innerText).eql('open universal link');
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
    await t.expect(getPageUrl()).contains(mockHttpCustomUri);
    await t.expect(Selector('h1').innerText).eql('open universal link');
  });

test
  .requestHooks(loopbackOVFallbackLogger, loopbackOVFallbackMock)('in loopback server approach, cancel polling when OV returns only fail responses', async t => {
    setup(t);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000\/probe/)
    )).eql(1);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/6511\/probe/)
    )).eql(1);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 401 &&
        record.request.url.match(/6511\/challenge/)
    )).eql(1);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/6512\/probe/)
    )).eql(1);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/6512\/challenge/)
    )).eql(1);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/\/idp\/idx\/authenticators\/poll/)
    )).lte(3);
    await t.expect(loopbackOVFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/\/idp\/idx\/authenticators\/poll\/cancel/)
    )).eql(1);
    await t.expect(loopbackOVFallbackLogger.contains(record => record.request.url.match(/6513/))).eql(false);
  });
