import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import { checkConsoleMessages } from '../../framework/shared';
import ResetPasswordPageObject from '../../framework/page-objects-v1/ResetPasswordPageObject';
import recoveryPasswordResponse from '../../../../playground/mocks/data/api/v1/authn/recovery-password';
import recoveryAnswerResponse from '../../../../playground/mocks/data/api/v1/authn/recovery-answer';
import cancelResponse from '../../../../playground/mocks/data/api/v1/authn/cancel';

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const cancelResetPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/recovery/token')
  .respond(recoveryPasswordResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/cancel')
  .respond(cancelResponse);

const resetPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/recovery/token')
  .respond(recoveryPasswordResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/recovery/answer')
  .respond(recoveryAnswerResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/credentials/reset_password')
  .respond(null);

fixture('Reset Password Auth Form');

const logger = RequestLogger(/token|cancel|reset_password/, {
  logRequestBody: true,
  stringifyRequestBody: true,
  logResponseBody: true
});

const defaultConfig = {
  stateToken: null, // setting stateToken to null to trigger the V1 flow
  features: {
    router: true,
    showSessionRevocation: false
  },
  useClassicEngine: true
};

async function setup(t, config = defaultConfig) {
  const resetPasswordPage = new ResetPasswordPageObject(t);
  await resetPasswordPage.navigateToPage({ render: false });
  
  await resetPasswordPage.mockCrypto();
  await renderWidget(config);
  return resetPasswordPage;
}

test.requestHooks(logger, cancelResetPasswordMock)(
  'should clear the reset password transaction after going back to sign in and not navigate back to the security question after clicking the browser back button',
  async (t) => {
    let resetPasswordPage = await setup(t);

    await checkConsoleMessages({ controller: 'recovery-loading' });
    let pageUrl = await resetPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/signin/recovery-question');

    await t.expect(resetPasswordPage.isBackToSignInPresent()).eql(true);
    await resetPasswordPage.clickBackToSignInLink();

    const goBack = ClientFunction(() => window.history.back());
    await goBack();

    pageUrl = await resetPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/');

    await t.expect(logger.requests.length).eql(2);
    
    const req1 = logger.requests[0].request;
    await t.expect(req1.url).eql('http://localhost:3000/api/v1/authn/recovery/token');
    await t.expect(req1.method).eql('post');
    
    const req2 = logger.requests[1].request;
    await t.expect(req2.url).eql('http://localhost:3000/api/v1/authn/cancel');
    await t.expect(req2.method).eql('post');
  }
);

test.requestHooks(logger, resetPasswordMock)(
  'should show the session revocation checkbox and properly handle its state by sending the value in the body of the request',
  async (t) => {
    let resetPasswordPage = await setup(t, {
      ...defaultConfig,
      features: {
        ...defaultConfig.features,
        showSessionRevocation: true
      }
    });

    await checkConsoleMessages({ controller: 'recovery-loading' });
    let pageUrl = await resetPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/signin/recovery-question');

    await resetPasswordPage.answerChallenge('okta');
    await resetPasswordPage.clickResetPasswordButton();

    pageUrl = await resetPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/signin/password-reset');

    await t.expect(resetPasswordPage.isRevokeSessionsPresent()).eql(true);

    const newPassword = 'Abcd1234';
    await resetPasswordPage.setNewPassword(newPassword);
    await resetPasswordPage.setConfirmPassword(newPassword);
    await resetPasswordPage.setRevokeSessionsCheckbox(true);

    await resetPasswordPage.clickResetPasswordButton();

    await t.expect(logger.requests.length).eql(2);

    await resetPasswordPage.setRevokeSessionsCheckbox(false);
    
    const req1 = logger.requests[0].request;
    await t.expect(req1.url).eql('http://localhost:3000/api/v1/authn/recovery/token');
    await t.expect(req1.method).eql('post');

    const req2 = logger.requests[1].request;
    await t.expect(req2.url).eql('http://localhost:3000/api/v1/authn/credentials/reset_password');
    await t.expect(req2.method).eql('post');
    const requestBody = JSON.parse(req2.body);
    await t.expect(requestBody.revokeSessions).eql(true);
  }
);

test.requestHooks(logger, resetPasswordMock)(
  'should not show the session revocation checkbox and should not send it in the body of the request',
  async (t) => {
    let resetPasswordPage = await setup(t);

    await checkConsoleMessages({ controller: 'recovery-loading' });
    let pageUrl = await resetPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/signin/recovery-question');

    await resetPasswordPage.answerChallenge('okta');
    await resetPasswordPage.clickResetPasswordButton();

    pageUrl = await resetPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/signin/password-reset');

    await t.expect(resetPasswordPage.isRevokeSessionsPresent()).eql(false);

    const newPassword = 'Abcd1234';
    await resetPasswordPage.setNewPassword(newPassword);
    await resetPasswordPage.setConfirmPassword(newPassword);

    await resetPasswordPage.clickResetPasswordButton();

    await t.expect(logger.requests.length).eql(2);
    
    const req1 = logger.requests[0].request;
    await t.expect(req1.url).eql('http://localhost:3000/api/v1/authn/recovery/token');
    await t.expect(req1.method).eql('post');

    const req2 = logger.requests[1].request;
    await t.expect(req2.url).eql('http://localhost:3000/api/v1/authn/credentials/reset_password');
    await t.expect(req2.method).eql('post');
    const requestBody = JSON.parse(req2.body);
    await t.expect(requestBody.revokeSessions).eql(undefined);
  }
);