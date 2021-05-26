import { RequestMock, RequestLogger, Selector } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrIdentifyRecoveryWithRecaptcha from '../../../playground/mocks/data/idp/idx/identify-recovery-with-recaptcha-v2';
import xhrIdentifyRecoveryWithHcaptcha from '../../../playground/mocks/data/idp/idx/identify-recovery-with-hcaptcha';
import xhrAuthenticatorVerifySelect from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';

const identifyRecoveryWithReCaptchaMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyRecoveryWithRecaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorVerifySelect);

const identifyRecoveryWithHCaptchaMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyRecoveryWithHcaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorVerifySelect);

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

fixture('Identify Recovery - reset flow with Captcha');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'forgot-password',
    formName: 'identify-recovery',
  });

  return identityPage;
}

test.requestHooks(identifyRequestLogger, reCaptchaRequestLogger, identifyRecoveryWithReCaptchaMock)('should be able to submit identifier with reCaptcha enabled', async t => {
  const identityPage = await setup(t);
  
  await identityPage.fillIdentifierField('test.identifier');
  
  // Wait for the reCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('.grecaptcha-badge').exists).ok();

  await identityPage.clickNextButton();

  // Ensure request to google's API was sent out with the correct siteKey. This is our best option to validate that this
  // flow works because otherwise in Bacon for some reason, the full reCaptcha flow does not always work - it's very flaky.
  await t.expect(reCaptchaRequestLogger.count(() => true)).eql(1);
  const req = reCaptchaRequestLogger.requests[0].request;
  await t.expect(req.url).contains('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
});

test.requestHooks(identifyRequestLogger, identifyRecoveryWithHCaptchaMock)('should be able to submit identifier with hCaptcha enabled', async t => {
  const identityPage = await setup(t);

  // Wait for the hCaptcha container to appear in the DOM and become visible.
  const captchaContainer = Selector('#captcha-container iframe');
  await captchaContainer.with({ visibilityCheck: true })();

  await identityPage.fillIdentifierField('test.identifier');

  // Wait for the hCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('iframe').exists).ok();
  await identityPage.clickNextButton();
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);

  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'test.identifier',
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImV',
  });
  await t.expect(reqBody.captchaVerify).contains({
    captchaId: 'capzomKHvPhLF7lrR0g3',
  });

  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});
