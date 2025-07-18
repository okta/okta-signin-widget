import { RequestLogger, RequestMock, Selector } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages } from '../framework/shared';
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
  await t.expect(deviceChallengePollPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  return deviceChallengePollPage;
}

test('should have editable fields', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');

  await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
});

test('should show errors if required fields are empty', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
});

test('should the correct title', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  const pageTitle = identityPage.getFormTitle();
  await t.expect(pageTitle).eql('Sign In');
});

test('should the correct content', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await t.expect(identityPage.getFormTitle()).eql('Sign In');
  await t.expect(identityPage.getOktaVerifyButtonText()).contains('Sign in with Okta FastPass');
  const separationText = await identityPage.getSeparationLineText();
  await t.expect(separationText.toString().toLowerCase()).eql('or');
  await identityPage.clickOktaVerifyButton();
  const header = await identityPage.getFormTitle();
  await t.expect(header).eql('Click "Open Okta Verify" on the browser prompt');
});
