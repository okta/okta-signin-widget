import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import { checkConsoleMessages } from '../../framework/shared';
import ResetPasswordPageObject from '../../framework/page-objects-v1/ResetPasswordPageObject';
import recoveryPasswordResponse from '../../../../playground/mocks/data/api/v1/authn/recovery-password';
import cancelResponse from '../../../../playground/mocks/data/api/v1/authn/cancel';

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const resetPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/recovery/token')
  .respond(recoveryPasswordResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/cancel')
  .respond(cancelResponse);

fixture('Reset Password');

const logger = RequestLogger(/token|cancel/, {
  logRequestBody: true,
  stringifyRequestBody: true,
  logResponseBody: true
});

async function setup(t) {
  const resetPasswordPage = new ResetPasswordPageObject(t);
  await resetPasswordPage.navigateToPage({ render: false });
  
  await resetPasswordPage.mockCrypto();
  await renderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      router: true,
    },
  });
  return resetPasswordPage;
}

test.requestHooks(logger, resetPasswordMock)(
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
