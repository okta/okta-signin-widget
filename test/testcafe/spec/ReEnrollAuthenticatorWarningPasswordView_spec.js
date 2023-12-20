import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorExpiryWarningPassword from '../../../playground/mocks/data/idp/idx/authenticator-expiry-warning-password';
import xhrAuthenticatorExpiryWarningPasswordWithADReq from '../../../playground/mocks/data/idp/idx/authenticator-expiry-warning-password-with-ad-req';
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
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const wthADReqMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningPasswordWithADReq);

const xhrAuthenticatorExpiryWarningPasswordUpdatedHistoryCount = JSON.parse(JSON.stringify(xhrAuthenticatorExpiryWarningPassword));
xhrAuthenticatorExpiryWarningPasswordUpdatedHistoryCount.currentAuthenticator.value.settings.age.historyCount = 1;

const updatedHistoryCountMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningPasswordUpdatedHistoryCount);

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
  await t.expect(passwordExpiryWarningPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: null,
    formName: 'reenroll-authenticator-warning',
    authenticatorKey: 'okta_password',
    methodType:'password',
  });

  return passwordExpiryWarningPage;
}

[
  [ 'Your password will expire in 4 days', mockExpireInDays, false],
  [ 'Your password will expire in 4 days', updatedHistoryCountMock, true ],
  [ 'Your password will expire later today', mockExpireToday, false ],
  [ 'Your password is expiring soon', mockExpireSoon, false ],
].forEach(([ formTitle, mock, isHistoryCountOne ]) => {
  test
    .requestHooks(logger, mock)('Should have the correct labels - expire in days', async t => {
      const passwordExpiryWarningPage = await setup(t);
      await checkA11y(t);
      await t.expect(passwordExpiryWarningPage.getFormTitle()).eql(formTitle);
      await t.expect(passwordExpiryWarningPage.changePasswordButtonExists()).eql(true);
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('Password requirements:');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('At least 8 characters');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('An uppercase letter');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('A lowercase letter');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('A number');
      await t.expect(passwordExpiryWarningPage.getRequirements()).contains('No parts of your username');
      // In V3, UX made a conscious decision to not include server side requirements in the UI
      // to not confuse users. They are considering additional UI changes OKTA-533383 for server side requirements
      // but for now, it does not display in v3
      if (!userVariables.gen3) {
        const historyCountMessage = isHistoryCountOne ? 
          'Password can\'t be the same as your last password'
          : 'Password can\'t be the same as your last 4 passwords';
        await t.expect(passwordExpiryWarningPage.getRequirements()).contains(historyCountMessage);
      }
      await t.expect(passwordExpiryWarningPage.remindMeLaterLinkExists()).eql(true);
      await t.expect(passwordExpiryWarningPage.getSignoutLinkText()).eql('Back to sign in');
      await t.expect(passwordExpiryWarningPage.doesTextExist('When your password expires, you will have to change your password before you can login to your Localhost account.')).eql(true);
    });
});

test.requestHooks(wthADReqMock)('should have the correct requirements when enforcing useADComplexityRequirements', async t => {
  const passwordExpiryWarningPage = await setup(t);
  await checkA11y(t);
  await t.expect(passwordExpiryWarningPage.getRequirements()).contains('Password requirements:');
  await t.expect(passwordExpiryWarningPage.getRequirements()).contains('At least 8 characters');
  await t.expect(passwordExpiryWarningPage.getRequirements()).contains('At least 3 of the following: lowercase letter, uppercase letter, number, symbol');
  await t.expect(passwordExpiryWarningPage.getRequirements()).contains('No parts of your username');
  await t.expect(passwordExpiryWarningPage.getRequirements()).contains('Does not include your first name');
  await t.expect(passwordExpiryWarningPage.getRequirements()).contains('Does not include your last name');
});

test
  .requestHooks(logger, mockExpireInDays)('should have both password and confirmPassword fields and both are required', async t => {
    const passwordExpiryWarningPage = await setup(t);
    await checkA11y(t);
    await t.expect(passwordExpiryWarningPage.passwordFieldExists()).eql(true);
    await t.expect(passwordExpiryWarningPage.confirmPasswordFieldExists()).eql(true);

    // fields are required
    await passwordExpiryWarningPage.clickChangePasswordButton();
    await passwordExpiryWarningPage.waitForErrorBox();
    await t.expect(passwordExpiryWarningPage.getPasswordError()).eql('This field cannot be left blank');
    await t.expect(passwordExpiryWarningPage.getConfirmPasswordError()).eql('This field cannot be left blank');

    // password must match
    await passwordExpiryWarningPage.fillPassword('abcdabcdA3@');
    await passwordExpiryWarningPage.fillConfirmPassword('1234');
    await passwordExpiryWarningPage.clickChangePasswordButton();
    await passwordExpiryWarningPage.waitForErrorBox();
    await t.expect(passwordExpiryWarningPage.hasPasswordError()).eql(false);

    // In v3, we display the incomplete/complete checkmark next to the 'Passwords must match'
    // list item label below the confirm password field in addition to the field level error message
    if (userVariables.gen3) {
      await t.expect(passwordExpiryWarningPage.hasPasswordMatchRequirementStatus(false)).eql(true);
      await t.expect(passwordExpiryWarningPage.getConfirmPasswordError()).eql('Passwords must match');
    } else {
      await t.expect(passwordExpiryWarningPage.getConfirmPasswordError()).eql('New passwords must match');
    }

    await t.expect(await passwordExpiryWarningPage.signoutLinkExists()).ok();
    await t.expect(passwordExpiryWarningPage.remindMeLaterLinkExists()).eql(true);
  });

test
  .requestHooks(logger, mockExpireInDays)('should succeed when passwords match and should send password in payload', async t => {
    const passwordExpiryWarningPage = await setup(t);
    await checkA11y(t);
    const successPage = new SuccessPageObject(t);

    await passwordExpiryWarningPage.fillPassword('abcdabcdA3@');
    await passwordExpiryWarningPage.fillConfirmPassword('abcdabcdA3@');
    await passwordExpiryWarningPage.clickChangePasswordButton();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

    const { request: { body, method, url } } = logger.requests[0];
    await t.expect(url).eql('http://localhost:3000/idp/idx/challenge/answer');
    await t.expect(method).eql('post');
    const requestBody = JSON.parse(body);
    await t.expect(requestBody).eql({
      credentials: { passcode: 'abcdabcdA3@' },
      stateHandle: '022P5Fd8jBy3b77XEdFCqnjz__5wQxksRfrAS4z6wP'
    });
  });

test.meta('gen3', false) // TODO: OKTA-544016 - determine if we should match this functionality in v3
  .requestHooks(logger, mockChangePasswordNotAllowed)('can choose "skip" if password change is not allowed', async t => {
    const passwordExpiryWarningPage = await setup(t);
    await checkA11y(t);
    const successPage = new SuccessPageObject(t);

    await passwordExpiryWarningPage.fillPassword('abcdabcd');
    await passwordExpiryWarningPage.fillConfirmPassword('abcdabcd');
    await passwordExpiryWarningPage.clickChangePasswordButton();

    await passwordExpiryWarningPage.waitForErrorBox();

    const pageTitle = passwordExpiryWarningPage.getFormTitle();
    await t.expect(pageTitle).eql('Your password will expire in 4 days');
    const errorText = passwordExpiryWarningPage.form.getErrorBoxText();
    await t.expect(errorText).eql('Change password not allowed on specified user.');
    await passwordExpiryWarningPage.confirmPasswordFieldExists();
    await t.expect(passwordExpiryWarningPage.remindMeLaterLinkExists()).eql(true);
    await passwordExpiryWarningPage.clickRemindMeLaterLink();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });
