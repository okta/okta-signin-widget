import { RequestMock } from 'testcafe';
import xhrAuthenticatorRequiredRsa from '../../../playground/mocks/data/idp/idx/authenticator-verification-rsa';
import xhrInvalidPasscode from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-rsa';
import xhrPasscodeChange from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-passcode-change-rsa';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import { checkConsoleMessages } from '../framework/shared';
import ChallengeRsaPageObject from '../framework/page-objects/ChallengeOnPremPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

const mockChallengeAuthenticatorRsa = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredRsa)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

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

fixture('Challenge Authenticator RSA');

async function setup(t) {
  const challengeRsaPage = new ChallengeRsaPageObject(t);
  await challengeRsaPage.navigateToPage();
  return challengeRsaPage;
}

test.requestHooks(mockChallengeAuthenticatorRsa)('challenge RSA authenticator', async t => {
  const challengeRsaPage = await setup(t);

  await checkConsoleMessages({
    controller: 'mfa-verify-totp',
    formName: 'challenge-authenticator',
    authenticatorKey: 'rsa_token',
    methodType: 'otp'
  });

  const pageTitle = challengeRsaPage.getPageTitle();
  const saveBtnText = challengeRsaPage.getSaveButtonLabel();
  await t.expect(saveBtnText).contains('Verify');
  await t.expect(pageTitle).contains('Verify with RSA SecurID');

  // Verify links
  await t.expect(await challengeRsaPage.switchAuthenticatorLinkExists()).ok();
  await t.expect(challengeRsaPage.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
  await t.expect(await challengeRsaPage.signoutLinkExists()).ok();
  await t.expect(challengeRsaPage.getSignoutLinkText()).eql('Back to sign in');

  // verify passcode
  await challengeRsaPage.verifyFactor('credentials.passcode', 'test');
  await challengeRsaPage.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockChallengeAuthenticatorRsa)('passcode is required', async t => {
  const challengeRsaPage = await setup(t);

  // verify passcode
  await challengeRsaPage.verifyFactor('credentials.passcode', '');
  await challengeRsaPage.clickNextButton();

  await challengeRsaPage.waitForErrorBox();
  await t.expect(challengeRsaPage.getPasscodeError()).eql('This field cannot be left blank');
});

test.requestHooks(mockInvalidPasscode)('challege RSA authenticator with invalid passcode', async t => {
  const challengeRsaPage = await setup(t);
  await challengeRsaPage.verifyFactor('credentials.passcode', 'test');
  await challengeRsaPage.clickNextButton();

  await t.expect(challengeRsaPage.getInvalidOTPError())
    .eql('Invalid code. Try again.');
});

test.requestHooks(mockPasscodeChange)('displays error and clears passcode when passcode change response', async t => {
  const challengeRsaPage = await setup(t);
  await challengeRsaPage.verifyFactor('credentials.passcode', 'test');
  await challengeRsaPage.clickNextButton();

  await t.expect(challengeRsaPage.getInvalidOTPError())
    .eql('Pin accepted, Wait for token to change, then enter new passcode.');
  await t.expect(challengeRsaPage.getPasscodeValue())
    .eql('');
});
