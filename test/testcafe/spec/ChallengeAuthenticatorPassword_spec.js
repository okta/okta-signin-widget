import { RequestLogger, RequestMock } from 'testcafe';
import xhrAuthenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrInvalidPassword from '../../../playground/mocks/data/idp/idx/error-answer-passcode-invalid';
import xhrForgotPasswordError from '../../../playground/mocks/data/idp/idx/error-forgot-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import ChallengePasswordPageObject from '../framework/page-objects/ChallengePasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

const mockChallengeAuthenticatorPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const mockInvalidPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrInvalidPassword, 403);

const mockCannotForgotPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/recover')
  .respond(xhrForgotPasswordError, 403);

const recoveryRequestLogger = RequestLogger(
  /idp\/idx\/recover/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Challenge Authenticator Password');

async function setup(t) {
  const challengePasswordPage = new ChallengePasswordPageObject(t);
  await challengePasswordPage.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'mfa-verify-password',
    formName: 'challenge-authenticator',
    authenticatorType: 'password',
  });

  return challengePasswordPage;
}

test.requestHooks(mockChallengeAuthenticatorPassword)('challenge password authenticator', async t => {
  const challengePasswordPage = await setup(t);
  // assert switch authenticator link
  await challengePasswordPage.switchAuthenticatorExists();
  await t.expect(challengePasswordPage.getSwitchAuthenticatorButtonText()).eql('Verify with something else');

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

test.requestHooks(mockInvalidPassword)('challege password authenticator with invalid password', async t => {
  const challengePasswordPage = await setup(t);
  await challengePasswordPage.switchAuthenticatorExists();
  await challengePasswordPage.verifyFactor('credentials.passcode', 'test');
  await challengePasswordPage.clickNextButton();

  await t.expect(challengePasswordPage.getPasswordFieldErrorMessage()).contains('The passcode is absent or invalid');

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(6);
  await t.expect(log[3]).eql('===== playground widget afterError event received =====');
  await t.expect(JSON.parse(log[4])).eql({
    controller: 'mfa-verify-password',
    formName: 'challenge-authenticator',
    authenticatorType: 'password',
  });
  await t.expect(JSON.parse(log[5])).eql({
    'errorSummary': '',
    'xhr': {
      'responseJSON': {
        'errorSummary': '',
        'errorCauses': [
          {
            'errorSummary': [
              'The passcode is absent or invalid.'
            ],
            'property': 'credentials.passcode'
          }
        ]
      }
    }
  });

});

test.requestHooks(recoveryRequestLogger, mockCannotForgotPassword)('can not recover password', async t => {
  const challengePasswordPage = await setup(t);
  await challengePasswordPage.forgotPasswordLink.exists();
  await challengePasswordPage.forgotPasswordLink.click();
  // show form error once even click twice and trigger API request twice.
  await challengePasswordPage.forgotPasswordLink.click();

  await t.expect(challengePasswordPage.form.getErrorBoxCount()).eql(1);
  await t.expect(challengePasswordPage.form.getErrorBoxText())
    .eql('Reset password is not allowed at this time. Please contact support for assistance.');

  await t.expect(recoveryRequestLogger.count(() => true)).eql(2);

  const req0 = recoveryRequestLogger.requests[0].request;
  const reqBody0 = JSON.parse(req0.body);
  await t.expect(reqBody0).eql({
    stateHandle: 'eyJ6aXAiOiJERUYi',
  });
  await t.expect(req0.method).eql('post');
  await t.expect(req0.url).eql('http://localhost:3000/idp/idx/recover');

  const req1 = recoveryRequestLogger.requests[1].request;
  const reqBody1 = JSON.parse(req1.body);
  await t.expect(reqBody1).eql({
    stateHandle: 'eyJ6aXAiOiJERUYi',
  });
  await t.expect(req1.method).eql('post');
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/recover');
});
