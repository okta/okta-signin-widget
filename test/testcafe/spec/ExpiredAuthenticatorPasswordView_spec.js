import { RequestMock, RequestLogger } from 'testcafe';
import AuthenticatorExpiredPasswordPageObject from '../framework/page-objects/AuthenticatorExpiredPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorExpiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-expired-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

fixture(`Authenticator Expired Password`);

async function setup(t) {
  const expiredPasswordPage = new AuthenticatorExpiredPasswordPageObject(t);
  await expiredPasswordPage.navigateToPage();
  return expiredPasswordPage;
}

test
  .requestHooks(logger, mock)(`Should have the correct labels`, async t => {
    const expiredPasswordPage = await setup(t);
    await t.expect(expiredPasswordPage.getFormTitle()).eql('Your password has expired');
    await t.expect(expiredPasswordPage.getSaveButtonLabel()).eql('Change Password');
    await t.expect(expiredPasswordPage.getRequirements()).contains('Password requirements:');
    await t.expect(expiredPasswordPage.getRequirements()).contains('At least 8 characters');
    await t.expect(expiredPasswordPage.getRequirements()).contains('An uppercase letter');
    await t.expect(expiredPasswordPage.getRequirements()).contains('A number');
    await t.expect(expiredPasswordPage.getRequirements()).contains('No parts of your username');
    await t.expect(expiredPasswordPage.getRequirements()).contains('Your password cannot be any of your last 4 passwords');
    await t.expect(expiredPasswordPage.getRequirements()).contains('A lowercase letter');
    await t.expect(expiredPasswordPage.getRequirements()).contains('At least 10 minute(s) must have elapsed since you last changed your password');
  });

test
  .requestHooks(logger, mock)(`should have both password and confirmPassword fields and both are required`, async t => {
    const expiredPasswordPage = await setup(t);
    await t.expect(expiredPasswordPage.passwordFieldExists()).eql(true);
    await t.expect(expiredPasswordPage.confirmPasswordFieldExists()).eql(true);

    // fields are required
    await expiredPasswordPage.clickNextButton();
    await expiredPasswordPage.waitForErrorBox();
    await t.expect(expiredPasswordPage.getPasswordError()).eql('This field cannot be left blank');
    await t.expect(expiredPasswordPage.getConfirmPasswordError()).eql('This field cannot be left blank');

    // password must match
    await expiredPasswordPage.fillPassword('abcd');
    await expiredPasswordPage.fillConfirmPassword('1234');
    await expiredPasswordPage.clickNextButton();
    await expiredPasswordPage.waitForErrorBox();
    await t.expect(expiredPasswordPage.hasPasswordError()).eql(false);
    await t.expect(expiredPasswordPage.getConfirmPasswordError()).eql('New passwords must match');

    await t.expect(await expiredPasswordPage.signoutLinkExists()).notOk();
  });

test
  .requestHooks(logger, mock)(`should succeed when passwords match and should send password in payload`, async t => {
    const expiredPasswordPage = await setup(t);
    const successPage = new SuccessPageObject(t);

    await expiredPasswordPage.fillPassword('abcdabcd');
    await expiredPasswordPage.fillConfirmPassword('abcdabcd');
    await expiredPasswordPage.clickNextButton();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

    let { request: { body, method, url } } = logger.requests[0];
    await t.expect(url).eql('http://localhost:3000/idp/idx/challenge/answer');
    await t.expect(method).eql('post');
    const requestBody = JSON.parse(body);

    await t.expect(requestBody).eql({
      "stateHandle": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
      "credentials": {
        "passcode": "abcdabcd"
      },
    });
  });
