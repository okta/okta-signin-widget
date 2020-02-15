import { RequestLogger, RequestMock } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/idp/idx/data/identify';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback';
import loopbackChallengeNotReceived from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback-challenge-not-received';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/idp/idx/data/identify-with-device-launch-authenticator';

const logger = RequestLogger(/introspect|probe|cancel|launch|launch-okta-verify|poll/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo('http://localhost:2000/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6511/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6512/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6513/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll/cancel')
  .respond(loopbackChallengeNotReceived)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/okta-verify/launch')
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo('http://localhost:6512/launch-okta-verify')
  .respond(null, 200, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(identify);


fixture(`Device Challenge Polling View with Loopback Failfast and Launch Okta Verify`)
  .requestHooks(logger, mock);

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

test(`loopback fails and falls back to custom uri`, async t => {
  const deviceChallengePollPageObject = await setup(t);
  await t.expect(deviceChallengePollPageObject.getHeader()).eql('Sign In');
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
      record.request.url.match(/introspect/)
  )).eql(1);
  await t.expect(logger.count(
    record => record.response.statusCode === 500 &&
      record.request.url.match(/2000|6511|6512|6513/)
  )).eql(4);
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
      record.request.url.match(/authenticators\/poll\/cancel/)
  )).eql(1);

  const firstIdentityPage = new IdentityPageObject(t);
  await firstIdentityPage.clickOktaVerifyButton();
  await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verify account access');
  await t.expect(deviceChallengePollPageObject.getFormSubtitle()).eql('Launching Okta Verify...');
  await t.expect(deviceChallengePollPageObject.getContent())
    .eql('If nothing prompts from the browser, click here to launch Okta Verify, or make sure Okta Verify is installed.');
  await t.expect(deviceChallengePollPageObject.getFooterLink().innerText).eql('Back to Sign In');
  await t.expect(deviceChallengePollPageObject.getFooterLink().getAttribute('href')).eql('http://localhost:3000');
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
      record.request.url.match(/\/okta-verify\/launch/)
  )).eql(1);
  await t.expect(logger.count(
    record => record.request.url.match(/launch-okta-verify/)
  )).eql(1);
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.url.match(/poll/)
  )).eql(1);

  const secondIdentityPage = new IdentityPageObject(t);
  await secondIdentityPage.fillIdentifierField('Test Identifier');
  await t.expect(secondIdentityPage.getIdentifierValue()).eql('Test Identifier');
});