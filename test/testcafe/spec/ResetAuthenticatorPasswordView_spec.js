import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorResetPassword from '../../../playground/mocks/data/idp/idx/authenticator-reset-password';
import xhrAuthenticatorEnrollPasswordWithADReq from '../../../playground/mocks/data/idp/idx/authenticator-reset-password-with-ad-req';
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
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const withADReqMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPasswordWithADReq);

const xhrAuthenticatorResetPasswordUpdatedHistoryCount = JSON.parse(JSON.stringify(xhrAuthenticatorResetPassword));
xhrAuthenticatorResetPasswordUpdatedHistoryCount.currentAuthenticator.value.settings.age.historyCount = 1;

const updatedHistoryCountMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorResetPasswordUpdatedHistoryCount);

fixture('Authenticator Reset Password');

async function setup(t) {
  const resetPasswordPage = new FactorEnrollPasswordPageObject(t);
  await resetPasswordPage.navigateToPage();
  await t.expect(resetPasswordPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'forgot-password',
    formName: 'reset-authenticator',
    authenticatorKey: 'okta_password',
    methodType:'password',
  });

  return resetPasswordPage;
}

[
  [ mock, false],
  [ updatedHistoryCountMock, true ]
].forEach(([ localMock, isHistoryCountOne ]) => {
  test
    .requestHooks(logger, localMock)('Should have the correct labels', async t => {
      const resetPasswordPage = await setup(t);
      await checkA11y(t);
      await t.expect(resetPasswordPage.getFormTitle()).eql('Reset your password');
      await t.expect(resetPasswordPage.resetPasswordButtonExists()).eql(true);
      await t.expect(resetPasswordPage.getRequirements()).contains('Password requirements:');
      await t.expect(resetPasswordPage.getRequirements()).contains('At least 8 characters');
      await t.expect(resetPasswordPage.getRequirements()).contains('An uppercase letter');
      await t.expect(resetPasswordPage.getRequirements()).contains('A number');
      await t.expect(resetPasswordPage.getRequirements()).contains('A symbol');
      await t.expect(resetPasswordPage.getRequirements()).contains('No parts of your username');
      await t.expect(resetPasswordPage.getRequirements()).contains('A lowercase letter');
      // V3 does not display server side requirements
      if (!userVariables.gen3) {
        const historyCountMessage = isHistoryCountOne ? 
          'Password can\'t be the same as your last password'
          : 'Password can\'t be the same as your last 4 passwords';
        await t.expect(resetPasswordPage.getRequirements()).contains(historyCountMessage);
        await t.expect(resetPasswordPage.getRequirements()).contains('At least 10 minute(s) must have elapsed since you last changed your password');
      }
    });
});

test.requestHooks(withADReqMock)('should have the correct requirements when enforcing useADComplexityRequirements', async t => {
  const resetPasswordPage = await setup(t);
  await checkA11y(t);
  await t.expect(resetPasswordPage.getFormTitle()).eql('Reset your password');
  await t.expect(resetPasswordPage.resetPasswordButtonExists()).eql(true);
  await t.expect(resetPasswordPage.getRequirements()).contains('Password requirements:');
  await t.expect(resetPasswordPage.getRequirements()).contains('At least 8 characters');
  await t.expect(resetPasswordPage.getRequirements()).contains('At least 3 of the following: lowercase letter, uppercase letter, number, symbol');
  await t.expect(resetPasswordPage.getRequirements()).contains('No parts of your username');
  await t.expect(resetPasswordPage.getRequirements()).contains('Does not include your first name');
  await t.expect(resetPasswordPage.getRequirements()).contains('Does not include your last name');
});

test
  .requestHooks(logger, mock)('should have both password and confirmPassword fields and both are required', async t => {
    const resetPasswordPage = await setup(t);
    await checkA11y(t);
    await t.expect(resetPasswordPage.passwordFieldExists()).eql(true);
    await t.expect(resetPasswordPage.confirmPasswordFieldExists()).eql(true);

    // fields are required
    await resetPasswordPage.clickResetPasswordButton();
    await resetPasswordPage.waitForErrorBox();
    await t.expect(resetPasswordPage.getPasswordError()).eql('This field cannot be left blank');
    await t.expect(resetPasswordPage.getConfirmPasswordError()).eql('This field cannot be left blank');

    // password must match
    await resetPasswordPage.fillPassword('abcdabcdA3@');
    await resetPasswordPage.fillConfirmPassword('1234');
    await resetPasswordPage.clickResetPasswordButton();
    await resetPasswordPage.waitForErrorBox();
    await t.expect(resetPasswordPage.hasPasswordError()).eql(false);

    // In v3, we display the incomplete/complete checkmark next to the 'Passwords must match'
    // list item label below the confirm password field in addition to the field level error message
    if (userVariables.gen3) {
      await t.expect(resetPasswordPage.hasPasswordMatchRequirementStatus()).eql(true);
      await t.expect(resetPasswordPage.getConfirmPasswordError()).eql('Passwords must match');
    } else {
      await t.expect(resetPasswordPage.getConfirmPasswordError()).eql('New passwords must match');
    }

    await t.expect(await resetPasswordPage.signoutLinkExists()).ok();
  });

test
  .requestHooks(logger, mock)('should succeed when passwords match and should send password in payload', async t => {
    const resetPasswordPage = await setup(t);
    await checkA11y(t);
    const successPage = new SuccessPageObject(t);

    await resetPasswordPage.fillPassword('abcdabcdA3@');
    await resetPasswordPage.fillConfirmPassword('abcdabcdA3@');
    await resetPasswordPage.clickResetPasswordButton();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

    let { request: { body, method, url } } = logger.requests[0];
    await t.expect(url).eql('http://localhost:3000/idp/idx/challenge/answer');
    await t.expect(method).eql('post');
    const requestBody = JSON.parse(body);

    const expectedPayload = {
      'stateHandle': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
      'credentials': {
        'passcode': 'abcdabcdA3@'
      },
    };

    // In v3 if the idx response includes a boolean field, we will automatically include it in the payload if untoucbed
    if (userVariables.gen3) {
      expectedPayload.credentials.revokeSessions = false;
    }

    await t.expect(requestBody).eql(expectedPayload);
  });

test
  .requestHooks(logger, mock)('should succeed when session revocation is checked', async t => {
    const resetPasswordPage = await setup(t);
    await checkA11y(t);

    await resetPasswordPage.fillPassword('abcdabcdE1@');
    await resetPasswordPage.fillConfirmPassword('abcdabcdE1@');
    await resetPasswordPage.sessionRevocationToggleExist();
    await resetPasswordPage.checkSessionRevocationToggle();
    await resetPasswordPage.clickNextButton('Reset Password');

    const successPage = new SuccessPageObject(t);
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
        'passcode': 'abcdabcdE1@',
        'revokeSessions': true
      },
    });
  });
