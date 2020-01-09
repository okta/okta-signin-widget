import { RequestLogger, RequestMock } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/idp/idx/data/identify-with-device-launch-authenticator';

const logger = RequestLogger(/introspect|launch-okta-verify/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo('http://localhost:6512/launch-okta-verify')
  .respond(null, 200, { 'access-control-allow-origin': '*' })

fixture(`Device Challenge Polling View with Okta Verify`)
  .requestHooks(logger, mock)

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

test(`should have the correct content`, async t => {
  const deviceChallengePollPageObject = await setup(t);
  await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verify account access');
  await t.expect(deviceChallengePollPageObject.getSubtitle()).eql('Launching Okta Verify...');
  await t.expect(deviceChallengePollPageObject.getContent())
    .eql('If nothing prompts from the browser, click here to launch Okta Verify, or make sure Okta Verify is installed.');
  await t.expect(deviceChallengePollPageObject.getFooterLink().innerText).eql('Back to Sign In');
  await t.expect(deviceChallengePollPageObject.getFooterLink().getAttribute('href')).eql('http://localhost:3000');
});

test(`should have the correct links`, async t => {
  const deviceChallengePollPageObject = await setup(t);
  await t.expect(logger.count(
    record => record.request.url.match(/launch-okta-verify/)
  )).eql(1);

  await deviceChallengePollPageObject.clickLaunchOktaVerifyLink();
  await t.expect(logger.count(
    record => record.request.url.match(/launch-okta-verify/)
  )).eql(2);
});
