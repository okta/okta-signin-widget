import { RequestMock, Selector, RequestLogger } from 'testcafe';
import { checkConsoleMessages } from '../framework/shared';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import enrollProfileNewWithRecaptcha from '../../../playground/mocks/data/idp/idx/enroll-profile-new-with-recaptcha-v2';
import enrollProfileNewWithHCaptcha from '../../../playground/mocks/data/idp/idx/enroll-profile-new-with-hcaptcha';
import enrollProfileFinish from '../../../playground/mocks/data/idp/idx/terminal-registration';

const mockWithReCaptcha = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(enrollProfileNewWithRecaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileFinish);

const mockWithHCaptcha = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(enrollProfileNewWithHCaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileFinish);  

const reCaptchaRequestLogger = RequestLogger(
  /\/recaptcha\/api2\/userverify/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Registration With Captcha');

test.requestHooks(reCaptchaRequestLogger, mockWithReCaptcha)('should be able to create account with reCaptcha enabled', async t => {
  // mock is configured to show registration page immediately
  const registrationPage = new RegistrationPageObject(t);
  await registrationPage.navigateToPage();
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'registration',
      formName: 'enroll-profile',
    },
  ]);
  
  // click register button
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');
  
  // Wait for the reCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('.grecaptcha-badge').exists).ok();
  await registrationPage.clickRegisterButton();

  // Ensure request to google's API was sent out with the correct siteKey. This is our best option to validate that this
  // flow works because otherwise in Bacon for some reason, the full reCaptcha flow does not always work - it's very flaky.
  await t.expect(reCaptchaRequestLogger.count(() => true)).eql(1);
  const req = reCaptchaRequestLogger.requests[0].request;
  await t.expect(req.url).contains('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
});

test.requestHooks(mockWithHCaptcha)('should be able to create account with hCaptcha enabled', async t => {
  // mock is configured to show registration page immediately
  const registrationPage = new RegistrationPageObject(t);
  await registrationPage.navigateToPage();
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'registration',
      formName: 'enroll-profile',
    },
  ]);

  // click register button
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');

  // Wait for the hCaptcha container to appear in the DOM and become visible.
  await t.expect(Selector('#captcha-container').find('iframe').exists).ok();
  await registrationPage.clickRegisterButton();

  // show registration success terminal view
  await t.expect(registrationPage.getTerminalContent()).eql('To finish signing in, check your email.');
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'registration',
      formName: 'enroll-profile',
    },
    'afterRender',
    {
      controller: null,
      formName: 'terminal',
    }
  ]);
});
