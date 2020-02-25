import { RequestLogger, RequestMock } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/idp/idx/data/identify';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback';
import loopbackChallengeNotReceived from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback-challenge-not-received';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/idp/idx/data/identify-with-device-launch-authenticator';

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

fixture(`Device Challenge Polling View with the Loopback Server and Custom URI approaches`);

async function setupLoopbackSuccess(t) {
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
    const deviceChallengePollPageObject = await setupLoopbackSuccess(t);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Sign In');
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