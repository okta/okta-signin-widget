import { RequestLogger, RequestMock, Selector } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received';
import launchAuthenticatorOption from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';

const logger = RequestLogger(/introspect/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(loopbackChallengeNotReceived)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/okta-verify/launch')
  .respond(launchAuthenticatorOption);

fixture('Identify + Okta Verify')
  .requestHooks(logger, mock);

async function setup(t) {
  const deviceChallengePollPage = new IdentityPageObject(t);
  await deviceChallengePollPage.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'primary-auth',
    formName: 'identify',
  });

  return deviceChallengePollPage;
}

test('should have editable fields', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');

  await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
});

test('should show errors if required fields are empty', async t => {
  const identityPage = await setup(t);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierError()).eql(true);
  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
});

test('should the correct title', async t => {
  const identityPage = await setup(t);
  const pageTitle = identityPage.getPageTitle();
  await t.expect(pageTitle).eql('Sign In');
});

test('should the correct content', async t => {
  const identityPage = await setup(t);
  await t.expect(identityPage.getPageTitle()).eql('Sign In');
  await t.expect(identityPage.getOktaVerifyButtonText()).eql('Sign in using Okta Verify on this device');
  await t.expect(identityPage.getSeparationLineText()).eql('or');
  await identityPage.clickOktaVerifyButton();
  const header = new Selector('h2[data-se="o-form-head"]');
  await t.expect(header.textContent).eql('Sign in using Okta Verify on this device');
});
