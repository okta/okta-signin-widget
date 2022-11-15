import { RequestMock, Selector } from 'testcafe';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password';
import xhrAuthenticatorEnrollPasswordError from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-password-common';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const successMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const errorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrAuthenticatorEnrollPasswordError, 403);

fixture('Authenticator Enroll Password')
  .meta('v3', true);

async function setup(t) {
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await enrollPasswordPage.navigateToPage();
  await t.expect(Selector('form').exists).eql(true);
  await checkConsoleMessages({
    controller: 'enroll-password',
    formName: 'enroll-authenticator',
    authenticatorKey: 'okta_password',
    methodType:'password',
  });

  return enrollPasswordPage;
}

test.requestHooks(successMock)('should have both password and confirmPassword fields and both are required', async t => {
  const enrollPasswordPage = await setup(t);

  // Check title
  await t.expect(enrollPasswordPage.getFormTitle()).eql('Set up password');
  await t.expect(enrollPasswordPage.getSaveButtonLabel()).eql('Next');
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);

  // assert switch authenticator link shows up
  await t.expect(await enrollPasswordPage.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(enrollPasswordPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');

  // fields are required
  await enrollPasswordPage.clickNextButton();
  await enrollPasswordPage.waitForErrorBox();
  await t.expect(enrollPasswordPage.getPasswordError()).eql('This field cannot be left blank');
  await t.expect(enrollPasswordPage.getConfirmPasswordError()).eql('This field cannot be left blank');

  // password must match
  await enrollPasswordPage.fillPassword('abcd');
  await enrollPasswordPage.fillConfirmPassword('1234');
  await enrollPasswordPage.clickNextButton();
  await enrollPasswordPage.waitForErrorBox();
  await t.expect(enrollPasswordPage.hasPasswordError()).eql(false);
  await t.expect(enrollPasswordPage.getConfirmPasswordError()).eql('New passwords must match');

  await t.expect(await enrollPasswordPage.signoutLinkExists()).ok();
});

test.requestHooks(successMock)('should succeed when same values are filled', async t => {
  const enrollPasswordPage = await setup(t);
  const successPage = new SuccessPageObject(t);

  await enrollPasswordPage.fillPassword('abcdabcd');
  await enrollPasswordPage.fillConfirmPassword('abcdabcd');
  await enrollPasswordPage.clickNextButton();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(errorMock)('should show a callout when server-side field errors are received', async t => {
  const enrollPasswordPage = await setup(t);

  await enrollPasswordPage.fillPassword('abcdabcd');
  await enrollPasswordPage.fillConfirmPassword('abcdabcd');
  await enrollPasswordPage.clickNextButton();

  await enrollPasswordPage.waitForErrorBox();
  await t.expect(enrollPasswordPage.getPasswordError()).eql('This password was found in a list of commonly used passwords. Please try another password.');
});

test.requestHooks(successMock)('should have the correct requirements', async t => {
  const enrollPasswordPage = await setup(t);
  await t.expect(enrollPasswordPage.getRequirements()).contains('Password requirements:');
  await t.expect(enrollPasswordPage.getRequirements()).contains('At least 8 characters');
  await t.expect(enrollPasswordPage.getRequirements()).contains('An uppercase letter');
  await t.expect(enrollPasswordPage.getRequirements()).contains('A number');
  await t.expect(enrollPasswordPage.getRequirements()).contains('A symbol');
  await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your first name');
  await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your last name');
  // await t.expect(enrollPasswordPage.getRequirements()).contains('At least 2 hour(s) must have elapsed since you last changed your password');
  await t.expect(enrollPasswordPage.getRequirements()).contains('No parts of your username');
  // await t.expect(enrollPasswordPage.getRequirements()).contains('Your password cannot be any of your last 4 passwords');
  await t.expect(enrollPasswordPage.getRequirements()).contains('A lowercase letter');
});
