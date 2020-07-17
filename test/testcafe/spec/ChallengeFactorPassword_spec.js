import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock } from 'testcafe';
import factorRequiredPassword from '../../../playground/mocks/data/idp/idx/factor-verification-password';
import authenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidPassword from '../../../playground/mocks/data/idp/idx/error-answer-passcode-invalid';

const factorRequiredPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(factorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const authenticatorRequiredPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(authenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(authenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidPassword, 403);

fixture(`Challenge Password Form`);

async function setup(t) {
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await challengeFactorPage.navigateToPage();
  return challengeFactorPage;
}
test.requestHooks(factorRequiredPasswordMock)(`challenge password factor`, async t => {
  const challengeFactorPageObject = await setup(t);
  await challengeFactorPageObject.switchFactorExists();
  await challengeFactorPageObject.forgotPasswordExists();
  await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
  await challengeFactorPageObject.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(authenticatorRequiredPasswordMock)(`challenge password authenticator`, async t => {
  const challengeFactorPageObject = await setup(t);
  // assert switch authenticator link
  await challengeFactorPageObject.switchAuthenticatorExists();
  await t.expect(challengeFactorPageObject.getSwitchAuthenticatorButtonText()).eql('Verify using something else');

  // assert forgot password link
  await challengeFactorPageObject.forgotPasswordExists();
  await t.expect(challengeFactorPageObject.getForgotPasswordButtonText()).eql('Forgot password?');

  await t.expect(await challengeFactorPageObject.signoutLinkExists()).ok();
  await t.expect(challengeFactorPageObject.getSignoutLinkText()).eql('Sign Out');

  // verify password
  await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
  await challengeFactorPageObject.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(invalidPasswordMock)(`challege password authenticator with invalid password`, async t => {
  const challengeFactorPageObject = await setup(t);
  await challengeFactorPageObject.switchAuthenticatorExists();
  await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
  await challengeFactorPageObject.clickNextButton();
  await challengeFactorPageObject.waitForPasswordError();
  await t.expect(challengeFactorPageObject.hasPasswordError()).eql(true);
  await t.expect(challengeFactorPageObject.hasPasswordErrorMessage()).eql(true);
  await t.expect(challengeFactorPageObject.getPasswordErrorMessage()).contains('The passcode is absent or invalid');

});
