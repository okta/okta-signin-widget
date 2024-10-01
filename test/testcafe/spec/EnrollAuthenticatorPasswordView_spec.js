import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password';
import xhrAuthenticatorEnrollPasswordError from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-password-common';
import xhrAuthenticatorEnrollPasswordWithADReq from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password-with-ad-req';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/challenge\/poll|challenge\/answer|challenge\/resend/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const successMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const wthADReqMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPasswordWithADReq);

const xhrAuthenticatorEnrollPasswordUpdatedHistoryCount = JSON.parse(JSON.stringify(xhrAuthenticatorEnrollPassword));
xhrAuthenticatorEnrollPasswordUpdatedHistoryCount.currentAuthenticator.value.settings.age.historyCount = 1;

const updatedHistoryCountMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPasswordUpdatedHistoryCount);  

const errorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrAuthenticatorEnrollPasswordError, 403);

fixture('Authenticator Enroll Password');

async function setup(t) {
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await enrollPasswordPage.navigateToPage();
  await t.expect(enrollPasswordPage.formExists()).ok();
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
  await checkA11y(t);

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
  await t.expect(enrollPasswordPage.getPasswordError()).match(/This field cannot be left blank/);
  await t.expect(enrollPasswordPage.getConfirmPasswordError()).match(/This field cannot be left blank/);

  // password must match
  await enrollPasswordPage.fillPassword('Abcdef1@');
  await enrollPasswordPage.fillConfirmPassword('1234');
  await enrollPasswordPage.clickNextButton();
  await enrollPasswordPage.waitForErrorBox();
  await t.expect(enrollPasswordPage.hasPasswordError()).eql(false);

  // In v3, we display the incomplete/complete checkmark next to the 'Passwords must match'
  // list item label below the confirm password field in addition to the field level error message
  if (userVariables.gen3) {
    await t.expect(enrollPasswordPage.hasPasswordMatchRequirementStatus(false)).eql(true);
    await t.expect(enrollPasswordPage.getConfirmPasswordError()).match(/Passwords must match/);
  } else {
    await t.expect(enrollPasswordPage.getConfirmPasswordError()).eql('New passwords must match');
  }

  await t.expect(await enrollPasswordPage.signoutLinkExists()).ok();
});

test.requestHooks(logger, successMock)('should succeed when same values are filled', async t => {
  const enrollPasswordPage = await setup(t);
  await checkA11y(t);
  const successPage = new SuccessPageObject(t);

  await enrollPasswordPage.fillPassword('abcdabcdA3@');
  await enrollPasswordPage.fillConfirmPassword('abcdabcdA3@');
  await enrollPasswordPage.clickNextButton();

  const { request: {
    body: answerRequestBodyString,
  }
  } = logger.requests[0];
  const expectedPayload = {
    credentials: {
      passcode: 'abcdabcdA3@',
    },
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
  };

  const answerRequestBody = JSON.parse(answerRequestBodyString);
  await t.expect(answerRequestBody).eql(expectedPayload);

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(errorMock)('should show a callout when server-side field errors are received', async t => {
  const enrollPasswordPage = await setup(t);
  await checkA11y(t);

  await enrollPasswordPage.fillPassword('abcdabcdA3@');
  await enrollPasswordPage.fillConfirmPassword('abcdabcdA3@');
  await enrollPasswordPage.clickNextButton();

  await enrollPasswordPage.waitForErrorBox();
  await t.expect(enrollPasswordPage.getPasswordError()).match(/This password was found in a list of commonly used passwords. Please try another password./);
});
[
  [ successMock, false],
  [ updatedHistoryCountMock, true ]
].forEach(([ mock, isHistoryCountOne ]) => {
  test.requestHooks(mock)('should have the correct requirements', async t => {
    const enrollPasswordPage = await setup(t);
    await checkA11y(t);
    await t.expect(enrollPasswordPage.getRequirements()).contains('Password requirements:');
    await t.expect(enrollPasswordPage.getRequirements()).contains('At least 8 characters');
    await t.expect(enrollPasswordPage.getRequirements()).contains('An uppercase letter');
    await t.expect(enrollPasswordPage.getRequirements()).contains('A number');
    await t.expect(enrollPasswordPage.getRequirements()).contains('A symbol');
    await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your first name');
    await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your last name');
    await t.expect(enrollPasswordPage.getRequirements()).contains('Maximum 3 consecutive repeating characters');
    // In V3, UX made a conscious decision to not include server side requirements in the UI
    // to not confuse users. They are considering additional UI changes OKTA-533383 for server side requirements
    // but for now, it does not display in v3
    if (!userVariables.gen3) {
      await t.expect(enrollPasswordPage.getRequirements()).contains('At least 2 hour(s) must have elapsed since you last changed your password');

      const historyCountMessage = isHistoryCountOne ? 
        'Password can\'t be the same as your last password'
        : 'Password can\'t be the same as your last 4 passwords';
      await t.expect(enrollPasswordPage.getRequirements()).contains(historyCountMessage);
    }
    await t.expect(enrollPasswordPage.getRequirements()).contains('No parts of your username');
    await t.expect(enrollPasswordPage.getRequirements()).contains('A lowercase letter');
  });
});

test.requestHooks(wthADReqMock)('should have the correct requirements when enforcing useADComplexityRequirements', async t => {
  const enrollPasswordPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollPasswordPage.getRequirements()).contains('Password requirements:');
  await t.expect(enrollPasswordPage.getRequirements()).contains('At least 8 characters');
  await t.expect(enrollPasswordPage.getRequirements()).contains('At least 3 of the following: lowercase letter, uppercase letter, number, symbol');
  await t.expect(enrollPasswordPage.getRequirements()).contains('No parts of your username');
  await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your first name');
  await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your last name');
});
