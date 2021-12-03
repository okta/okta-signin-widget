import { RequestMock, RequestLogger } from 'testcafe';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { a11yCheck, checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorResetPassword from '../../../playground/mocks/data/idp/idx/authenticator-reset-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorResetPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

fixture('Authenticator Reset Password');

async function setup(t) {
  const resetPasswordPage = new FactorEnrollPasswordPageObject(t);
  await resetPasswordPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'forgot-password',
    formName: 'reset-authenticator',
    authenticatorKey: 'okta_password',
    methodType:'password',
  });
  await a11yCheck(t);
  return resetPasswordPage;
}

test
  .requestHooks(logger, mock)('Should have the correct labels', async t => {
    const resetPasswordPage = await setup(t);
    await t.expect(resetPasswordPage.getFormTitle()).eql('Reset your password');
    await t.expect(resetPasswordPage.getSaveButtonLabel()).eql('Reset Password');
    await t.expect(resetPasswordPage.getRequirements()).contains('Password requirements:');
    await t.expect(resetPasswordPage.getRequirements()).contains('At least 8 characters');
    await t.expect(resetPasswordPage.getRequirements()).contains('An uppercase letter');
    await t.expect(resetPasswordPage.getRequirements()).contains('A number');
    await t.expect(resetPasswordPage.getRequirements()).contains('No parts of your username');
    await t.expect(resetPasswordPage.getRequirements()).contains('Your password cannot be any of your last 4 passwords');
    await t.expect(resetPasswordPage.getRequirements()).contains('A lowercase letter');
    await t.expect(resetPasswordPage.getRequirements()).contains('At least 10 minute(s) must have elapsed since you last changed your password');
  });

test
  .requestHooks(logger, mock)('should have both password and confirmPassword fields and both are required', async t => {
    const resetPasswordPage = await setup(t);
    await t.expect(resetPasswordPage.passwordFieldExists()).eql(true);
    await t.expect(resetPasswordPage.confirmPasswordFieldExists()).eql(true);

    // fields are required
    await resetPasswordPage.clickNextButton();
    await resetPasswordPage.waitForErrorBox();
    await t.expect(resetPasswordPage.getPasswordError()).eql('This field cannot be left blank');
    await t.expect(resetPasswordPage.getConfirmPasswordError()).eql('This field cannot be left blank');
    await a11yCheck(t);
    // password must match
    await resetPasswordPage.fillPassword('abcd');
    await resetPasswordPage.fillConfirmPassword('1234');
    await resetPasswordPage.clickNextButton();
    await resetPasswordPage.waitForErrorBox();
    await t.expect(resetPasswordPage.hasPasswordError()).eql(false);
    await t.expect(resetPasswordPage.getConfirmPasswordError()).eql('New passwords must match');

    await t.expect(await resetPasswordPage.signoutLinkExists()).ok();
    await a11yCheck(t);
  });

test
  .requestHooks(logger, mock)('should succeed when passwords match and should send password in payload', async t => {
    const resetPasswordPage = await setup(t);
    const successPage = new SuccessPageObject(t);

    await resetPasswordPage.fillPassword('abcdabcd');
    await resetPasswordPage.fillConfirmPassword('abcdabcd');
    await resetPasswordPage.clickNextButton();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

    let { request: { body, method, url } } = logger.requests[0];
    await t.expect(url).eql('http://localhost:3000/idp/idx/challenge/answer');
    await t.expect(method).eql('post');
    const requestBody = JSON.parse(body);

    await t.expect(requestBody).eql({
      'stateHandle': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
      'credentials': {
        'passcode': 'abcdabcd'
      },
    });
  });
