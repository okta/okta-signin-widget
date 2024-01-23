import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages, renderWidget as rerenderWidget } from '../framework/shared';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import enrollProfileNew from '../../../playground/mocks/data/idp/idx/enroll-profile-new';
import enrollProfileError from '../../../playground/mocks/data/idp/idx/error-new-signup-email';
import enrollProfileFinish from '../../../playground/mocks/data/idp/idx/terminal-registration';
import enrollProfileNewError from '../../../playground/mocks/data/idp/idx/error-new-signup-email-exists';

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
  /\/idp\/idx\/enroll\/new/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Registration');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await t.expect(identityPage.formExists()).ok();
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
  await checkA11y(t);
  await verifyRegistrationPageEvent();

  /* i18n tests */
  await t.expect(registrationPage.alreadyHaveAccountExists()).eql(true);
  await t.expect(await registrationPage.signoutLinkExists()).eql(false);
  await t.expect(await registrationPage.helpLinkExists()).eql(false);

  await t.expect(await registrationPage.form.fieldByLabelExists('Email')).eql(true);
  await t.expect(await registrationPage.form.fieldByLabelExists('First name')).eql(true);
  await t.expect(await registrationPage.form.fieldByLabelExists('Last name')).eql(true);

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
  await checkA11y(t);
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
  await checkA11y(t);
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

test.requestHooks(mock)('should show max length field validation errors', async t => {
  const registrationPage = await setup(t);
  await checkA11y(t);
  await verifyRegistrationPageEvent();
  // Populate first name and last name fields (maxLength = 50) with 52 characters
  await registrationPage.fillFirstNameField('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
  await registrationPage.fillLastNameField('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
  // Populate email field (maxLength = 100) with 102 characters
  await registrationPage.fillEmailField('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopq@rs.com');
  await registrationPage.focusRegisterButton();

  await registrationPage.waitForLastNameError();

  // All three enroll fields should show max length validation error
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
  await t.expect(registrationPage.getLastNameErrorMessage()).contains('This field cannot exceed the maximum allowed characters');
  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.getFirstNameErrorMessage()).contains('This field cannot exceed the maximum allowed characters');
  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);
  await t.expect(registrationPage.getEmailErrorMessage()).contains('This field cannot exceed the maximum allowed characters');

  // Populate first name and last name fields (maxLength = 50) with 50 characters
  await registrationPage.fillFirstNameField('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx');
  await registrationPage.fillLastNameField('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx');
  // Populate email field (maxLength = 100) with 100 characters
  await registrationPage.fillEmailField('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmno@pq.com');
  await registrationPage.focusRegisterButton();

  // All three enroll fields should not show max length validation error
  await t.expect(registrationPage.hasLastNameError()).eql(false);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(false);
  await t.expect(registrationPage.hasFirstNameError()).eql(false);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(false);
  await t.expect(registrationPage.hasEmailError()).eql(false);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(false);
});

test.requestHooks(mock)('should show min length field validation errors', async t => {
  const registrationPage = await setup(t);
  await checkA11y(t);
  await verifyRegistrationPageEvent();
  // Populate first and last name fields (minLength = 2) with 1 character
  await registrationPage.fillFirstNameField('a');
  await registrationPage.fillLastNameField('a');
  // Populate email field (minLength = 10) with 9 characters
  await registrationPage.fillEmailField('ab@cd.com');
  await registrationPage.focusRegisterButton();

  await registrationPage.waitForLastNameError();

  // All three enroll fields should show min length validation error
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
  await t.expect(registrationPage.getLastNameErrorMessage()).contains('This field cannot be less than the minimum required characters');
  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.getFirstNameErrorMessage()).contains('This field cannot be less than the minimum required characters');
  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);
  await t.expect(registrationPage.getEmailErrorMessage()).contains('This field cannot be less than the minimum required characters');

  // Populate first and last name fields (minLength = 2) with 2 characters
  await registrationPage.fillFirstNameField('ab');
  await registrationPage.fillLastNameField('ab');
  // Populate email field (minLength = 10) with 10 characters
  await registrationPage.fillEmailField('abc@de.com');
  await registrationPage.focusRegisterButton();

  // All three enroll fields should not show min length validation error
  await t.expect(registrationPage.hasLastNameError()).eql(false);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(false);
  await t.expect(registrationPage.hasFirstNameError()).eql(false);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(false);
  await t.expect(registrationPage.hasEmailError()).eql(false);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(false);
});

test.requestHooks(enrollProfileErrorMock)('should show email field validation errors', async t => {
  const registrationPage = await setup(t);
  await checkA11y(t);
  await verifyRegistrationPageEvent();

  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('invalidemail');

  await registrationPage.clickRegisterButton();

  await registrationPage.waitForEmailError();

  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);
  await t.expect(registrationPage.getEmailErrorMessage()).contains('\'Email\' must be in the form of an email address');

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
    'afterError',
    {
      controller: 'registration',
      formName: 'enroll-profile',
    },
    {
      errorSummary: '',
      xhr: {
        responseJSON: {
          errorSummary: '',
          errorCauses: [
            {
              errorKey: [
                'registration.error.invalidLoginEmail',
                'registration.error.doesNotMatchPattern'
              ],
              errorSummary: [
                '\'Email\' must be in the form of an email address',
                'Provided value for property \'Email\' does not match required pattern'
              ],
              property: 'userProfile.email'
            }
          ],
          errorSummaryKeys: [],
          errorIntent: 'LOGIN',
        },
      },
    },
  ]);
  await t.expect(registrationPage.getNthEmailErrorMessage(0)).eql('\'Email\' must be in the form of an email address');
  await t.expect(registrationPage.getNthEmailErrorMessage(1)).eql('Provided value for property \'Email\' does not match required pattern');
});

test.requestHooks(mock)('should show terminal screen after registration', async t => {
  const registrationPage = await setup(t);
  await checkA11y(t);
  await verifyRegistrationPageEvent();

  // click register button
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');
  await registrationPage.clickRegisterButton();

  // show successful terminal view and fires after render event
  await t.expect(registrationPage.terminalMessageExist('To finish signing in, check your email.')).eql(true);

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

test.requestHooks(mock)('should be able to create account', async t => {
  const registrationPage = await setup(t);
  await checkA11y(t);
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
  ]);

  // click register button
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');
  await registrationPage.clickRegisterButton();

  // show registration success terminal view
  await t.expect(registrationPage.terminalMessageExist('To finish signing in, check your email.')).eql(true);
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

test.requestHooks(logger, enrollProfileNewMock)('should be able to create a new account after previous attempt failed server validation', async t => {
  const registrationPage = await setup(t);
  await checkA11y(t);

  //create new account
  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('foo@ex.com');

  //click register
  await registrationPage.clickRegisterButton();
  await t.expect(registrationPage.getEmailErrorMessage()).match(/A user with this Email already exists$/);
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

test.requestHooks(mock)('should call settings.registration.click on "Sign Up" click, instead of moving to registration page', async t => {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage({ render: false });
  await rerenderWidget({
    registration: {
      // eslint-disable-next-line
      click: () => console.log('registration click handler fired')
    }
  });
  await t.expect(identityPage.formExists()).ok();
  await t.expect(identityPage.getFormTitle()).eql('Sign In');

  await identityPage.clickSignUpLink();
  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log[log.length - 1]).eql('registration click handler fired');

  // will not navigate to register page
  await t.expect(identityPage.getFormTitle()).eql('Sign In');
});

