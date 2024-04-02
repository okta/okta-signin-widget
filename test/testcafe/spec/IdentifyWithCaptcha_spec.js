import { RequestMock, RequestLogger, Selector, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
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

const hCaptchaScriptErrorMock = RequestMock()
  .onRequestTo((req) => req.url.startsWith('https://js.hcaptcha.com/1/api.js'))
  .respond({}, 404)
  .onRequestTo((req) => req.url.startsWith('https://hcaptcha.com/1/api.js'))
  .respond({}, 404)
  .onRequestTo((req) => req.url.startsWith('https://bad-host.hcaptcha.com/1/api.js'))
  .respond({}, 404);

const reCaptchaScriptErrorMock = RequestMock()
  .onRequestTo((req) => req.url.startsWith('https://www.google.com/recaptcha/api.js'))
  .respond({}, 404)
  .onRequestTo((req) => req.url.startsWith('https://www.google.com/recaptcha/enterprise.js'))
  .respond({}, 404);

const identifyRequestLogger = RequestLogger(
  /idx\/identify/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const reCaptchaApiRequestLogger = RequestLogger(
  /\/recaptcha\/api2\/userverify/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const reCaptchaRequestLogger = RequestLogger(
  /(google\.com|recaptcha\.net)\/recaptcha\//,
  {
    logRequestBody: false,
    stringifyRequestBody: false,
  }
);

const hCaptchaRequestLogger = RequestLogger(
  /hcaptcha\.com/,
  {
    logRequestBody: false,
    stringifyRequestBody: false,
  }
);

fixture('Identify + Password With Captcha');

async function setup(t, widgetOptions) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage({ render: false });
  await renderWidget(widgetOptions || {});
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
    authenticatorKey: 'okta_password',
    methodType: 'password',
  });

  return identityPage;
}

// TODO: Quarantined a11y check - OKTA-576351 - re-enable once fixed
test.requestHooks(identifyRequestLogger, identifyMockwithHCaptcha, hCaptchaRequestLogger)('should sign in with hCaptcha enabled', async t => {
  const identityPage = await setup(t, {
    language: 'en'
  });
  // await checkA11y(t);

  const expectedSrc = userVariables.gen3
    ? 'https://js.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit'
    : 'https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en';
  await t.expect(hCaptchaRequestLogger.requests.filter(req => req.request.url === expectedSrc).length).eql(1);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();

  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();

  // Wait for the hCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('iframe').exists).ok();
  await identityPage.clickSignInButton();
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);

  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody.captchaVerify).contains({
    captchaId: 'capzomKHvPhLF7lrR0g3',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});

// deprecated
test.requestHooks(identifyMockwithHCaptcha, hCaptchaRequestLogger)('can load hCaptcha script from custom URI', async t => {
  await setup(t, {
    hcaptcha: {
      scriptSource: 'https://cn1.hcaptcha.com/1/api.js',
      scriptParams: {
        endpoint: 'https://cn1.hcaptcha.com',
        assethost: 'https://assets-cn1.hcaptcha.com',
        imghost: 'https://imgs-cn1.hcaptcha.com',
        reportapi: 'https://reportapi-cn1.hcaptcha.com',
      }
    },
    language: 'en',
  });
  // await checkA11y(t);

  const expectedSrc = userVariables.gen3
    ? 'https://cn1.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit&assethost=https%3A%2F%2Fassets-cn1.hcaptcha.com&imghost=https%3A%2F%2Fimgs-cn1.hcaptcha.com&reportapi=https%3A%2F%2Freportapi-cn1.hcaptcha.com&endpoint=https%3A%2F%2Fcn1.hcaptcha.com'
    : 'https://cn1.hcaptcha.com/1/api.js?endpoint=https%3A%2F%2Fcn1.hcaptcha.com&assethost=https%3A%2F%2Fassets-cn1.hcaptcha.com&imghost=https%3A%2F%2Fimgs-cn1.hcaptcha.com&reportapi=https%3A%2F%2Freportapi-cn1.hcaptcha.com&onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en';
  await t.expect(hCaptchaRequestLogger.requests.filter(req => req.request.url === expectedSrc).length).eql(1);
});

test.requestHooks(identifyMockwithHCaptcha, hCaptchaScriptErrorMock, hCaptchaRequestLogger)('can load hCaptcha script from afternative URIs', async t => {
  await setup(t, {
    hcaptcha: {
      alternativeScriptSources: [
        {
          src: 'https://bad-host.hcaptcha.com/1/api.js',
        },
        {
          src: 'https://cn1.hcaptcha.com/1/api.js',
          params: {
            endpoint: 'https://cn1.hcaptcha.com',
            assethost: 'https://assets-cn1.hcaptcha.com',
            imghost: 'https://imgs-cn1.hcaptcha.com',
            reportapi: 'https://reportapi-cn1.hcaptcha.com',
          }
        },
        {
          src: 'https://cn2.hcaptcha.com/1/api.js',
        }
      ]
    },
    language: 'en',
  });
  // await checkA11y(t);

  // tries default script source  => 404
  await t.expect(hCaptchaRequestLogger.requests.filter(
    req => req.request.url.startsWith(userVariables.gen3 ?
      'https://js.hcaptcha.com/1/api.js' :
      'https://hcaptcha.com/1/api.js')
  ).length).eql(1);

  // tries alternative script source #1  => 404
  await t.expect(hCaptchaRequestLogger.requests.filter(
    req => req.request.url.startsWith('https://bad-host.hcaptcha.com/1/api.js')
  ).length).eql(1);

  // tries alternative script source #2  => OK
  const expectedSrc = userVariables.gen3
    ? 'https://cn1.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit&assethost=https%3A%2F%2Fassets-cn1.hcaptcha.com&imghost=https%3A%2F%2Fimgs-cn1.hcaptcha.com&reportapi=https%3A%2F%2Freportapi-cn1.hcaptcha.com&endpoint=https%3A%2F%2Fcn1.hcaptcha.com'
    : 'https://cn1.hcaptcha.com/1/api.js?endpoint=https%3A%2F%2Fcn1.hcaptcha.com&assethost=https%3A%2F%2Fassets-cn1.hcaptcha.com&imghost=https%3A%2F%2Fimgs-cn1.hcaptcha.com&reportapi=https%3A%2F%2Freportapi-cn1.hcaptcha.com&onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en';
  await t.expect(hCaptchaRequestLogger.requests.filter(req => req.request.url === expectedSrc).length).eql(1);

  // doesn't try alternative script source #3
  await t.expect(hCaptchaRequestLogger.requests.filter(
    req => req.request.url.startsWith('https://cn2.hcaptcha.com/1/api.js')
  ).length).eql(0);

  // only 1 script should exist
  await t.expect(Selector(`script[src="${expectedSrc}"]`).exists).ok();
  await t.expect(Selector(`script[src^="https://bad-host.hcaptcha.com/"]`).exists).notOk();
  await t.expect(Selector(`script[src^="https://js.hcaptcha.com/"]`).exists).notOk();
  await t.expect(Selector(`script[src^="https://hcaptcha.com/"]`).exists).notOk();
  await t.expect(Selector('#captcha-container').find('iframe').exists).ok();
});

test.requestHooks(identifyRequestLogger, reCaptchaApiRequestLogger, identifyMockWithReCaptcha)('should sign in with reCaptcha enabled', async t => {
  const identityPage = await setup(t, {
    language: 'en'
  });
  await checkA11y(t);

  const expectedSrc = userVariables.gen3
    ? 'https://www.google.com/recaptcha/api.js?onload=onloadcallback&render=explicit'
    : 'https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en';
  await t.expect(Selector(`script[src="${expectedSrc}"]`).exists).ok();

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();

  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();

  // Wait for the reCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('.grecaptcha-badge').exists).ok();
  await identityPage.clickSignInButton();

  // Ensure request to google's API was sent out with the correct siteKey. This is our best option to validate that this
  // flow works because otherwise in Bacon for some reason, the full reCaptcha flow does not always work - it's very flaky.
  await t.expect(reCaptchaApiRequestLogger.count(() => true)).eql(1);
  const req = reCaptchaApiRequestLogger.requests[0].request;
  await t.expect(req.url).contains('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
});

// deprecated
test.requestHooks(identifyMockWithReCaptcha)('can load reCAPTCHA script from custom URI', async t => {
  await setup(t, {
    recaptcha: {
      scriptSource: 'https://recaptcha.net/recaptcha/api.js',
    },
    language: 'en',
  });

  await checkA11y(t);

  const expectedSrc = userVariables.gen3
    ? 'https://recaptcha.net/recaptcha/api.js?onload=onloadcallback&render=explicit'
    : 'https://recaptcha.net/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en';
  await t.expect(Selector(`script[src="${expectedSrc}"]`).exists).ok();
});

test.requestHooks(identifyMockWithReCaptcha, reCaptchaRequestLogger, reCaptchaScriptErrorMock)('can load reCAPTCHA script from afternative URIs', async t => {
  await setup(t, {
    recaptcha: {
      alternativeScriptSources: [
        'https://www.google.com/recaptcha/enterprise.js',
        'https://recaptcha.net/recaptcha/api.js',
        'https://recaptcha.net/recaptcha/enterprise.js',
      ]
    },
    language: 'en',
  });

  await checkA11y(t);

  // tries default script source  => 404
  await t.expect(reCaptchaRequestLogger.requests.filter(
    req => req.request.url.startsWith('https://www.google.com/recaptcha/api.js')
  ).length).eql(1);

  // tries alternative script source #1  => 404
  await t.expect(reCaptchaRequestLogger.requests.filter(
    req => req.request.url.startsWith('https://www.google.com/recaptcha/enterprise.js')
  ).length).eql(1);

  // tries alternative script source #2  => OK
  const expectedSrc = userVariables.gen3
    ? 'https://recaptcha.net/recaptcha/api.js?onload=onloadcallback&render=explicit'
    : 'https://recaptcha.net/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en';
  await t.expect(reCaptchaRequestLogger.requests.filter(req => req.request.url === expectedSrc).length).eql(1);

  // doesn't try alternative script source #3
  await t.expect(reCaptchaRequestLogger.requests.filter(
    req => req.request.url.startsWith('https://recaptcha.net/recaptcha/enterprise.js')
  ).length).eql(0);

  // only 1 script should exist
  await t.expect(Selector(`script[src="${expectedSrc}"]`).exists).ok();
  await t.expect(Selector(`script[src^="https://www.google.com/recaptcha/"]`).exists).notOk();
  await t.expect(Selector('#captcha-container').find('.grecaptcha-badge').exists).ok();
});
