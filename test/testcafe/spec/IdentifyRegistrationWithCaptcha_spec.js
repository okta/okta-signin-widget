import { RequestMock, Selector } from 'testcafe';
import { checkConsoleMessages } from '../framework/shared';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import enrollProfileNewWithRecaptcha from '../../../playground/mocks/data/idp/idx/enroll-profile-new-with-recaptcha-v2.json';
import enrollProfileNewWithHCaptcha from '../../../playground/mocks/data/idp/idx/enroll-profile-new-with-hcaptcha.json';
import enrollProfileFinish from '../../../playground/mocks/data/idp/idx/terminal-registration';

const mockWithReCaptcha = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfileNewWithRecaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileFinish);

const mockWithHCaptcha = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfileNewWithHCaptcha)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileFinish);  

const identifyWithoutEnrollProfile = JSON.parse(JSON.stringify(identify));
identifyWithoutEnrollProfile.remediation.value = identifyWithoutEnrollProfile
  .remediation
  .value
  .filter(r => r.name !== 'select-enroll-profile');


fixture('Registration With Captcha');

test.requestHooks(mockWithReCaptcha)('should show register page directly and be able to create account with reCaptcha enabled', async t => {
  const registrationPage = new RegistrationPageObject(t);

  // navigate to /signin/register and show registration page immediately
  await registrationPage.navigateToPage();
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'registration',
      formName: 'enroll-profile',
    },
  ]);

  // Wait for the reCaptcha container to appear in the DOM and become visible.
  const captchaContainer = Selector('#captcha-container .grecaptcha-badge');
  await captchaContainer.with({ visibilityCheck: true })();

  // click register button
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');

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

test.requestHooks(mockWithHCaptcha)('should show register page directly and be able to create account with hCaptcha enabled', async t => {
  const registrationPage = new RegistrationPageObject(t);

  // navigate to /signin/register and show registration page immediately
  await registrationPage.navigateToPage();
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'registration',
      formName: 'enroll-profile',
    },
  ]);

  // Wait for the hCaptcha container to appear in the DOM and become visible.
  const captchaContainer = Selector('#captcha-container iframe');
  await captchaContainer.with({ visibilityCheck: true })();

  // click register button
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');

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
