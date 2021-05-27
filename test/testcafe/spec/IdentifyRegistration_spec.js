import { RequestMock, RequestLogger } from 'testcafe';
import { checkConsoleMessages, renderWidget as rerenderWidget } from '../framework/shared';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import enrollProfileNew from '../../../playground/mocks/data/idp/idx/enroll-profile-new';
import enrollProfileError from '../../../playground/mocks/data/idp/idx/error-new-signup-email';
import enrollProfileFinish from '../../../playground/mocks/data/idp/idx/terminal-registration';
import enrollProfileNewError from '../../../playground/mocks/data/idp/idx/error-new-signup-email-exists';
// import enrollProfileNewCustomLabel from '../../../playground/mocks/data/idp/idx/enroll-profile-new-custom-labels';


const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfileNew)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileFinish);

const enrollProfileNewMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfileNew)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileNewError, 403);

const enrollProfileErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfileNew)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileError, 403);

const identifyWithoutEnrollProfile = JSON.parse(JSON.stringify(identify));
identifyWithoutEnrollProfile.remediation.value = identifyWithoutEnrollProfile
  .remediation
  .value
  .filter(r => r.name !== 'select-enroll-profile');

const logger = RequestLogger(
  /new/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const enrolProfileDisabledMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithoutEnrollProfile);

fixture('Registration');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.clickSignUpLink();
  return new RegistrationPageObject(t);
}
async function verifyRegistrationPageEvent() {
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    'afterRender',
    {
      controller: 'registration',
      formName: 'enroll-profile',
    }
  ]);
}

test.requestHooks(mock)('should have editable fields and have account label', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent();

  /* i18n tests */
  await t.expect(registrationPage.getHaveAccountLabel()).eql('Already have an account?');
  await t.expect(await registrationPage.signoutLinkExists()).notOk();

  await t.expect(await registrationPage.getFormFieldLabel('userProfile.email')).eql('Email');
  await t.expect(await registrationPage.getFormFieldLabel('userProfile.firstName')).eql('First name');
  await t.expect(await registrationPage.getFormFieldLabel('userProfile.lastName')).eql('Last name');

  await registrationPage.fillFirstNameField('Test First Name');
  await registrationPage.fillLastNameField('Test Last Name');
  await registrationPage.fillEmailField('test@email.com');

  await t.expect(registrationPage.getFirstNameValue()).eql('Test First Name');
  await t.expect(registrationPage.getLastNameValue()).eql('Test Last Name');
  await t.expect(registrationPage.getEmail()).eql('test@email.com');

  await t.expect(registrationPage.form.getTitle()).eql('Sign up');
  await t.expect(registrationPage.form.getSaveButtonLabel()).eql('Sign Up');

});

test.requestHooks(mock)('should show errors if required fields are empty', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent();

  await registrationPage.clickRegisterButton();
  await registrationPage.waitForErrorBox();
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);
});

test.requestHooks(mock)('should show errors after empty required fields are focused out', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent();

  await registrationPage.fillFirstNameField('');
  await registrationPage.fillLastNameField('');
  await registrationPage.fillEmailField('');
  await registrationPage.focusRegisterButton();

  await registrationPage.waitForLastNameError();

  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);
});

test.requestHooks(enrollProfileErrorMock)('should show email field validation errors', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent();

  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('invalidemail');

  await registrationPage.clickRegisterButton();

  await registrationPage.waitForEmailError();

  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);
  await t.expect(registrationPage.getEmailErrorMessage()).contains('\'Email\' must be in the form of an email address');

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(8);
  await t.expect(log[5]).eql('===== playground widget afterError event received =====');
  await t.expect(JSON.parse(log[6])).eql({
    controller: 'registration',
    formName: 'enroll-profile',
  });
  await t.expect(JSON.parse(log[7])).eql({
    'errorSummary': '',
    'xhr': {
      'responseJSON': {
        'errorSummary': '',
        'errorCauses': [
          {
            'errorKey': [
              'registration.error.invalidLoginEmail',
              'registration.error.doesNotMatchPattern'
            ],
            'errorSummary': [
              '\'Email\' must be in the form of an email address',
              'Provided value for property \'Email\' does not match required pattern'
            ],
            'property': 'userProfile.email'
          }
        ],
        'errorSummaryKeys': [],
        'errorIntent': 'LOGIN',
      }
    }
  });
});

test.requestHooks(mock)('should show terminal screen after registration', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent();

  // click register button
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');
  await registrationPage.clickRegisterButton();

  // show successful terminal view and fires after render event
  await t.expect(registrationPage.getTerminalContent()).eql(
    'To finish signing in, check your email.'
  );

  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
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

test.requestHooks(mock)('should show register page directly and be able to create account', async t => {
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

test.requestHooks(logger, enrollProfileNewMock)('should be able to create a new account after previous attempt failed server validation', async t => {
  const registrationPage = new RegistrationPageObject(t);
  await registrationPage.navigateToPage();

  //create new account
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');

  //click register
  await registrationPage.clickRegisterButton();
  await t.expect(registrationPage.getEmailErrorMessage()).eql('A user with this Email already exists');
  let req = logger.requests[0].request;
  let reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
    userProfile: {
      firstName: 'abc',
      lastName: 'xyz',
      email: 'foo@ex.com'
    }
  });

  // change email
  await registrationPage.fillEmailField('newFoo@ex.com');
  await registrationPage.clickRegisterButton();
  req = logger.requests[1].request;
  reqBody = JSON.parse(req.body);

  await t.expect(reqBody).eql({
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
    userProfile: {
      firstName: 'abc',
      lastName: 'xyz',
      email: 'newFoo@ex.com'
    }
  });
});

test.requestHooks(enrolProfileDisabledMock)('should show terminal error when registration is not supported', async t => {
  const registrationPage = new RegistrationPageObject(t);

  // navigate to /signin/register and show registration page immediately
  await registrationPage.navigateToPage();
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: null,
      formName: 'terminal',
    }
  ]);

  // expect terminal errors
  await t.expect(registrationPage.form.getTitle()).eql('Sign up');
  await t.expect(registrationPage.form.getErrorBoxText()).eql('Sign up is not enabled for this organization.');
  await t.expect(await registrationPage.goBackLinkExists()).ok();
});

test.requestHooks(mock)('should call settings.registration.click on "Sign Up" click, instead of moving to registration page', async t => {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();

  await t.expect(identityPage.getPageTitle()).eql('Sign In');
  await rerenderWidget({
    registration: {
      // eslint-disable-next-line
      click: () => console.log('registration click handler fired')
    }
  });

  await identityPage.clickSignUpLink();
  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log[log.length - 1]).eql('registration click handler fired');

  // will not navigate to register page
  await t.expect(identityPage.getPageTitle()).eql('Sign In');
});

// TODO : OKTA-397225
// Uncomment once we support custom labels
// test.requestHooks(enrollProfileNewCustomLabelMock)('should show custom labels', async t => {
//   const registrationPage = await setup(t);

//   await t.expect(await registrationPage.getFormFieldLabel('userProfile.email')).eql('This is your awesome email address');
//   await t.expect(await registrationPage.getFormFieldLabel('userProfile.firstName')).eql('Please enter your first name');
//   await t.expect(await registrationPage.getFormFieldLabel('userProfile.lastName')).eql('Please enter your last name');

// });