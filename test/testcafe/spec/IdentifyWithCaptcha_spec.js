import { RequestMock, RequestLogger, Selector } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrIdentifyWithPasswordWithReCaptcha from '../../../playground/mocks/data/idp/idx/identify-with-password-with-recaptcha-v2.json';
import xhrIdentifyWithPasswordWithHCaptcha from '../../../playground/mocks/data/idp/idx/identify-with-password-with-hcaptcha.json';
import success from '../../../playground/mocks/data/idp/idx/success';

const identifyMockwithHCaptcha = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPasswordWithHCaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(success);
  
const identifyMockWithReCaptcha = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPasswordWithReCaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(success);  

const identifyRequestLogger = RequestLogger(
  /idx\/identify/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Identify + Password With Captcha');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
    authenticatorKey: 'okta_password',
    methodType: 'password',
  });

  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyMockwithHCaptcha)('should sign in with hCaptcha enabled', async t => {
  const identityPage = await setup(t);

  // Wait for the hCaptcha container to appear in the DOM and become visible.
  const captchaContainer = Selector('#captcha-container iframe');
  await captchaContainer.with({ visibilityCheck: true })();

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();
  await t.expect(await identityPage.getForgotPasswordLinkText()).eql('Forgot password?');

  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();

  await identityPage.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody.captchaVerify).contains({
    captchaId: 'capzomKHvPhLF7lrR0g3',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});

// https://oktainc.atlassian.net/browse/OKTA-393059
// We're disabling this test for now because there seems to be an underlying issue with with this test
// in Bacon. Locally this test runs with no issues but it's very flaky on Bacon. OKTA-393059 is created to investigate
// further.
test.requestHooks(identifyRequestLogger, identifyMockWithReCaptcha).skip('should sign in with reCaptcha enabled', async t => {
  const identityPage = await setup(t);

  // Wait for the reCaptcha container to appear in the DOM and become visible.
  const captchaContainer = Selector('#captcha-container .grecaptcha-badge');
  await captchaContainer.with({ visibilityCheck: true })();

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();
  await t.expect(await identityPage.getForgotPasswordLinkText()).eql('Forgot password?');

  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();

  await identityPage.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody.captchaVerify).contains({
    captchaId: 'capzomKHvPhLF7lrR0g3',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});
