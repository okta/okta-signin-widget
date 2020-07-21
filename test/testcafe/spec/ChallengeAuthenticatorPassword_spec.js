import { RequestMock } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengePasswordPageObject from '../framework/page-objects/ChallengePasswordPageObject';
import xhrAuthenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrAnvalidPassword from '../../../playground/mocks/data/idp/idx/error-answer-passcode-invalid';
import xhrForgotPasswordError from '../../../playground/mocks/data/idp/idx/error-forgot-password';

const mockChallengeAuthenticatorPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const mockInvalidPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrAnvalidPassword, 403);

const mockCannotForgotPassword = RequestMock()
      .onRequestTo('http://localhost:3000/idp/idx/introspect')
      .respond(xhrAuthenticatorRequiredPassword)
      .onRequestTo('http://localhost:3000/idp/idx/recover')
      .respond(xhrForgotPasswordError, 403);


fixture(`Challenge Authenticator Password`);

async function setup(t) {
  const challengePasswordPage = new ChallengePasswordPageObject(t);
  await challengePasswordPage.navigateToPage();
  return challengePasswordPage;
}

test.requestHooks(mockChallengeAuthenticatorPassword)(`challenge password authenticator`, async t => {
  const challengePasswordPage = await setup(t);
  // assert switch authenticator link
  await challengePasswordPage.switchAuthenticatorExists();
  await t.expect(challengePasswordPage.getSwitchAuthenticatorButtonText()).eql('Verify using something else');

  // assert forgot password link
  await challengePasswordPage.forgotPasswordLink.exists();
  await t.expect(challengePasswordPage.forgotPasswordLink.getLabel()).eql('Forgot password?');

  await t.expect(await challengePasswordPage.signoutLinkExists()).ok();
  await t.expect(challengePasswordPage.getSignoutLinkText()).eql('Sign Out');

  // verify password
  await challengePasswordPage.verifyFactor('credentials.passcode', 'test');
  await challengePasswordPage.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockInvalidPassword)(`challege password authenticator with invalid password`, async t => {
  const challengePasswordPage = await setup(t);
  await challengePasswordPage.switchAuthenticatorExists();
  await challengePasswordPage.verifyFactor('credentials.passcode', 'test');
  await challengePasswordPage.clickNextButton();

  await t.expect(challengePasswordPage.getPasswordFieldErrorMessage()).contains('The passcode is absent or invalid');
});

test.requestHooks(mockCannotForgotPassword)(`can not recover password`, async t => {
  const challengePasswordPage = await setup(t);
  await challengePasswordPage.forgotPasswordLink.exists();
  await challengePasswordPage.forgotPasswordLink.click();

  await t.expect(challengePasswordPage.form.getErrorBoxText())
    .eql('Reset password is not allowed at this time. Please contact support for assistance.');
});
