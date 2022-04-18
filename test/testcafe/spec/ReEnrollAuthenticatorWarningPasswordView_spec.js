import { RequestMock, RequestLogger } from 'testcafe';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorExpiryWarningPassword from '../../../playground/mocks/data/idp/idx/authenticator-expiry-warning-password.json';
import xhrErrorChangePasswordNotAllowed from '../../../playground/mocks/data/idp/idx/error-change-password-not-allowed';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mockExpireInDays = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const xhrAuthenticatorExpiryWarningPasswordExpireToday = JSON.parse(JSON.stringify(xhrAuthenticatorExpiryWarningPassword));
xhrAuthenticatorExpiryWarningPasswordExpireToday.currentAuthenticator.value.settings.daysToExpiry = 0;

const xhrAuthenticatorExpiryWarningPasswordExpireSoon = JSON.parse(JSON.stringify(xhrAuthenticatorExpiryWarningPassword));
delete xhrAuthenticatorExpiryWarningPasswordExpireSoon.currentAuthenticator.value.settings.daysToExpiry;

const mockExpireToday = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningPasswordExpireToday);

const mockExpireSoon = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningPasswordExpireSoon);

const mockChangePasswordNotAllowed = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond((req, res) => {
    res.statusCode = '403';
    res.headers['content-type'] = 'application/json';
    res.setBody(xhrErrorChangePasswordNotAllowed);
  })
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(xhrSuccess);

fixture('Password Authenticator Expiry Warning');

async function setup(t) {
  const passwordExpiryWarningPage = new FactorEnrollPasswordPageObject(t);
  await passwordExpiryWarningPage.navigateToPage();
  await checkConsoleMessages({
    controller: null,
    formName: 'reenroll-authenticator-warning',
    authenticatorKey: 'okta_password',
    methodType:'password',
  });

  return passwordExpiryWarningPage;
}

[
  [ 'Your password will expire in 4 days', mockExpireInDays],
  [ 'Your password will expire later today', mockExpireToday ],
  [ 'Your password is expiring soon', mockExpireSoon ],
].forEach(([ formTitle, mock ]) => {
  test
    .requestHooks(logger, mock)('Should have the correct labels - expire in days', async t => {
      const passwordExpiryWarningPage = await setup(t);
      await t.expect(passwordExpiryWarningPage.getFormTitle()).eql(formTitle);
      await t.expect(passwordExpiryWarningPage.getSaveButtonLabel()).eql('Change Password');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('Password requirements:');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('At least 8 characters');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('An uppercase letter');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('A lowercase letter');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('A number');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('No parts of your username');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('Your password cannot be any of your last 4 passwords');
      await t.expect(passwordExpiryWarningPage.getSkipLinkText()).eql('Remind me later');
      await t.expect(passwordExpiryWarningPage.getSignoutLinkText()).eql('Back to sign in');
      await t.expect(passwordExpiryWarningPage.getIonMessages()).eql('When your password expires you will be locked out of your Okta account.');
    });
});

test
  .requestHooks(logger, mockExpireInDays)('should have both password and confirmPassword fields and both are required', async t => {
    const passwordExpiryWarningPage = await setup(t);
    await t.expect(passwordExpiryWarningPage.passwordFieldExists()).eql(true);
    await t.expect(passwordExpiryWarningPage.confirmPasswordFieldExists()).eql(true);

    // fields are required
    await passwordExpiryWarningPage.clickNextButton();
    await passwordExpiryWarningPage.waitForErrorBox();
    await t.expect(passwordExpiryWarningPage.getPasswordError()).eql('This field cannot be left blank');
    await t.expect(passwordExpiryWarningPage.getConfirmPasswordError()).eql('This field cannot be left blank');

    // password must match
    await passwordExpiryWarningPage.fillPassword('abcd');
    await passwordExpiryWarningPage.fillConfirmPassword('1234');
    await passwordExpiryWarningPage.clickNextButton();
    await passwordExpiryWarningPage.waitForErrorBox();
    await t.expect(passwordExpiryWarningPage.hasPasswordError()).eql(false);
    await t.expect(passwordExpiryWarningPage.getConfirmPasswordError()).eql('New passwords must match');

    await t.expect(await passwordExpiryWarningPage.signoutLinkExists()).ok();
    await t.expect(await passwordExpiryWarningPage.skipLinkExists()).ok();
  });

test
  .requestHooks(logger, mockExpireInDays)('should succeed when passwords match and should send password in payload', async t => {
    const passwordExpiryWarningPage = await setup(t);
    const successPage = new SuccessPageObject(t);

    await passwordExpiryWarningPage.fillPassword('abcdabcd');
    await passwordExpiryWarningPage.fillConfirmPassword('abcdabcd');
    await passwordExpiryWarningPage.clickNextButton();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

    const { request: { body, method, url } } = logger.requests[0];
    await t.expect(url).eql('http://localhost:3000/idp/idx/challenge/answer');
    await t.expect(method).eql('post');
    const requestBody = JSON.parse(body);
    await t.expect(requestBody).eql({
      credentials: { passcode: 'abcdabcd' },
      stateHandle: '022P5Fd8jBy3b77XEdFCqnjz__5wQxksRfrAS4z6wP'
    });
  });

test
  .requestHooks(logger, mockChangePasswordNotAllowed)('can choose "skip" if password change is not allowed', async t => {
    const passwordExpiryWarningPage = await setup(t);
    const successPage = new SuccessPageObject(t);

    await passwordExpiryWarningPage.fillPassword('abcdabcd');
    await passwordExpiryWarningPage.fillConfirmPassword('abcdabcd');
    await passwordExpiryWarningPage.clickNextButton();

    await passwordExpiryWarningPage.waitForErrorBox();

    const pageTitle = passwordExpiryWarningPage.getFormTitle();
    await t.expect(pageTitle).eql('Your password will expire in 4 days');
    const errorText = passwordExpiryWarningPage.form.getErrorBoxText();
    await t.expect(errorText).eql('Change password not allowed on specified user.');
    await passwordExpiryWarningPage.confirmPasswordFieldExists();
    const skipText = await passwordExpiryWarningPage.getSkipLinkText();
    await t.expect(skipText).eql('Remind me later');
    await passwordExpiryWarningPage.clickSkipLink();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });