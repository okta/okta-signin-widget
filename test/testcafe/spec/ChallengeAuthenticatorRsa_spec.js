import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import xhrAuthenticatorRequiredRsa from '../../../playground/mocks/data/idp/idx/authenticator-verification-rsa';
import xhrInvalidPasscode from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-rsa';
import xhrPasscodeChange from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-passcode-change-rsa';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import { checkConsoleMessages, oktaDashboardContent, renderWidget } from '../framework/shared';
import ChallengeRsaPageObject from '../framework/page-objects/ChallengeOnPremPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

const mockChallengeAuthenticatorRsa = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredRsa)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const mockInvalidPasscode = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredRsa)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrInvalidPasscode, 403);

const mockPasscodeChange = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredRsa)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrPasscodeChange, 403);

fixture('Challenge Authenticator RSA').meta('v3', true);

async function setup(t) {
  const challengeRsaPage = new ChallengeRsaPageObject(t);
  await challengeRsaPage.navigateToPage();
  await t.expect(challengeRsaPage.formExists()).ok();
  return challengeRsaPage;
}

test.requestHooks(mockChallengeAuthenticatorRsa)('challenge RSA authenticator', async t => {
  const challengeRsaPage = await setup(t);
  await checkA11y(t);

  await checkConsoleMessages({
    controller: 'mfa-verify-totp',
    formName: 'challenge-authenticator',
    authenticatorKey: 'rsa_token',
    methodType: 'otp'
  });

  const pageTitle = challengeRsaPage.getFormTitle();
  const saveBtnText = challengeRsaPage.getSaveButtonLabel();
  await t.expect(saveBtnText).contains('Verify');
  await t.expect(pageTitle).contains('Verify with RSA SecurID');

  // Verify links
  await t.expect(await challengeRsaPage.verifyWithSomethingElseLinkExists()).eql(true);
  await t.expect(challengeRsaPage.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
  await t.expect(await challengeRsaPage.signoutLinkExists()).eql(true);
  await t.expect(challengeRsaPage.getSignoutLinkText()).eql('Back to sign in');

  // verify passcode
  await challengeRsaPage.verifyFactor('credentials.passcode', 'test');
  await challengeRsaPage.clickNextButton('Verify');
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockChallengeAuthenticatorRsa)('passcode is required', async t => {
  const challengeRsaPage = await setup(t);
  await checkA11y(t);

  // verify passcode
  await challengeRsaPage.verifyFactor('credentials.passcode', '');
  await t.pressKey('tab');
  await challengeRsaPage.clickNextButton('Verify');

  await challengeRsaPage.form.waitForErrorBox();
  await t.expect(challengeRsaPage.getPasscodeError()).eql('This field cannot be left blank');
});

test.requestHooks(mockInvalidPasscode)('challege RSA authenticator with invalid passcode', async t => {
  const challengeRsaPage = await setup(t);
  await checkA11y(t);
  await challengeRsaPage.verifyFactor('credentials.passcode', 'test');
  await challengeRsaPage.clickNextButton('Verify');

  await t.expect(challengeRsaPage.getInvalidOTPError())
    .eql('Invalid code. Try again.');
});

test.requestHooks(mockPasscodeChange)('displays error and clears passcode when passcode change response', async t => {
  const challengeRsaPage = await setup(t);
  await checkA11y(t);
  await challengeRsaPage.verifyFactor('credentials.passcode', 'test');
  await challengeRsaPage.clickNextButton('Verify');

  await t.expect(challengeRsaPage.getInvalidOTPError())
    .eql('Pin accepted, Wait for token to change, then enter new passcode.');
  await t.expect(challengeRsaPage.getPasscodeValue())
    .eql('');
});

test.requestHooks(mockPasscodeChange)('should show custom factor page link', async t => {
  const challengeRsaPage = await setup(t);
  await checkA11y(t);

  await renderWidget({
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });

  await t.expect(challengeRsaPage.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(challengeRsaPage.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});
