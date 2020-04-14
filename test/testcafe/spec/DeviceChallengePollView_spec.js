import { RequestLogger, RequestMock, ClientFunction, Selector } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/idp/idx/data/identify';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback';
import loopbackChallengeNotReceived from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback-challenge-not-received';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/idp/idx/data/identify-with-device-launch-authenticator';
import identifyWithSSOExtensionFallback from '../../../playground/mocks/idp/idx/data/identify-with-apple-sso-extension-fallback';
import identifyWithLaunchUniversalLink from '../../../playground/mocks/idp/idx/data/identify-with-universal-link';

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

const loopbackFallbackLogger = RequestLogger(/introspect|probe|cancel|launch|launch-okta-verify|poll/);
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
const mockHttpCustomUri = 'http://localhost:3000/launch-okta-verify';
// replace custom URI with http URL so that we can mock and verify
identifyWithLaunchAuthenticatorHttpCustomUri.authenticatorChallenge.value.href = mockHttpCustomUri;

const customURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri);

// replace custom URI with http URL so that we can mock and verify
identifyWithLaunchUniversalLink.authenticatorChallenge.value.href = mockHttpCustomUri;
const universalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallback)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchUniversalLink)
  .onRequestTo(mockHttpCustomUri)
  .respond('<html><h1>open universal link</h1></html>')
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchUniversalLink);

fixture(`Device Challenge Polling View with the Loopback Server, Custom URI and Universal Link approaches`);

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
  .requestHooks(loopbackSuccessLogger, loopbackSuccesskMock)(`in loopback server approach, probing and polling requests are sent and responded`, async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Signing in using Okta FastPass');
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/introspect|6512/)
    )).eql(3);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/challenge/) &&
      record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);
    failureCount = 2;
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
      record.request.url.match(/2000|6511/)
    )).eql(2);
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6513/))).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackFallbackLogger, loopbackFallbackMock)(`loopback fails and falls back to custom uri`, async t => {
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
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verify account access');
    await t.expect(deviceChallengePollPageObject.getFormSubtitle()).eql('Launching Okta Verify...');
    await t.expect(deviceChallengePollPageObject.getContent())
      .eql('If nothing prompts from the browser, click here to launch Okta Verify, or make sure Okta Verify is installed.');
    await t.expect(deviceChallengePollPageObject.getFooterLink().innerText).eql('Back to Sign In');
    await t.expect(deviceChallengePollPageObject.getFooterLink().getAttribute('href')).eql('http://localhost:3000');
  });

const getPageUrl = ClientFunction(() => window.location.href);
test
  .requestHooks(customURIMock)(`in custom URI approach, Okta Verify is launched`, async t => {
    await setup(t);
    await t.expect(getPageUrl()).contains(mockHttpCustomUri);
  });

test
  .requestHooks(loopbackFallbackLogger, universalLinkMock)(`SSO Extension fails and falls back to universal link`, async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getPageTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verify your sign in');
    await t.expect(deviceChallengePollPageObject.getContent()).eql('To continue, you\'ll need to use the Okta Verify app to confirm your sign in.\nSign in with Okta Verify');
    deviceChallengePollPageObject.clickUniversalLink();
    await t.expect(getPageUrl()).contains(mockHttpCustomUri);
    await t.expect(Selector('h1').innerText).eql('open universal link');
  });