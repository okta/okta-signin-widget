import { RequestMock, RequestLogger, Selector } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { a11yCheck, checkConsoleMessages } from '../framework/shared';
import xhrIdentifyWithPasswordWithReCaptcha from '../../../playground/mocks/data/idp/idx/identify-with-password-with-recaptcha-v2';
import xhrIdentifyWithPasswordWithHCaptcha from '../../../playground/mocks/data/idp/idx/identify-with-password-with-hcaptcha';
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

const reCaptchaRequestLogger = RequestLogger(
  /\/recaptcha\/api2\/userverify/,
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
  await a11yCheck(t);
  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyMockwithHCaptcha)('should sign in with hCaptcha enabled', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();
  await t.expect(await identityPage.getForgotPasswordLinkText()).eql('Forgot password?');

  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();

  // Wait for the hCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('iframe').exists).ok();
  await identityPage.clickNextButton();
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);

  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody.captchaVerify).contains({
    captchaId: 'capzomKHvPhLF7lrR0g3',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
  await a11yCheck(t);
});

test.requestHooks(identifyRequestLogger, reCaptchaRequestLogger, identifyMockWithReCaptcha)('should sign in with reCaptcha enabled', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();
  await t.expect(await identityPage.getForgotPasswordLinkText()).eql('Forgot password?');
  
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
  
  // Wait for the reCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('.grecaptcha-badge').exists).ok();
  await identityPage.clickNextButton();

  // Ensure request to google's API was sent out with the correct siteKey. This is our best option to validate that this
  // flow works because otherwise in Bacon for some reason, the full reCaptcha flow does not always work - it's very flaky.
  await t.expect(reCaptchaRequestLogger.count(() => true)).eql(1);
  const req = reCaptchaRequestLogger.requests[0].request;
  await t.expect(req.url).contains('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
  await a11yCheck(t);
});
