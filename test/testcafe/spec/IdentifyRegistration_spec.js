import { RequestMock, ClientFunction } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import enrollProfile from '../../../playground/mocks/data/idp/idx/enroll-profile';
import enrollProfileNew from '../../../playground/mocks/data/idp/idx/enroll-profile-new';
import enrollProfileError from '../../../playground/mocks/data/idp/idx/error-new-signup-email';
import enrollProfileFinish from '../../../playground/mocks/data/idp/idx/terminal-registration.json';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfile);

const enrollProfileErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfileNew)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(enrollProfileError, 403);

const enrollProfileFinishMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfileFinish);

const rerenderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

fixture('Registration');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.clickSignUpLink();
  return new RegistrationPageObject(t);
}
async function verifyRegistrationPageEvent(t) {
  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(5);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'primary-auth',
    formName: 'identify',
  });

  await t.expect(log[3]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[4])).eql({
    controller: 'registration',
    formName: 'enroll-profile',
  });

}

/* i18n tests */
test.requestHooks(mock)('should have the right labels for the fields', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent(t);
  await t.expect(registrationPage.getHaveAccountLabel()).eql('Already have an account ?');
  await t.expect(await registrationPage.signoutLinkExists()).notOk();

});

test.requestHooks(mock)('should have editable fields', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent(t);

  await registrationPage.fillFirstNameField('Test First Name');
  await registrationPage.fillLastNameField('Test Last Name');
  await registrationPage.fillEmailField('test@email.com');

  await t.expect(registrationPage.getFirstNameValue()).eql('Test First Name');
  await t.expect(registrationPage.getLastNameValue()).eql('Test Last Name');
  await t.expect(registrationPage.getEmail()).eql('test@email.com');
});

test.requestHooks(mock)('should show errors if required fields are empty', async t => {
  const registrationPage = await setup(t);
  await verifyRegistrationPageEvent(t);

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
  await verifyRegistrationPageEvent(t);

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
  await verifyRegistrationPageEvent(t);

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
            'errorSummary': [
              '\'Email\' must be in the form of an email address',
              'Provided value for property \'Email\' does not match required pattern'
            ],
            'property': 'userProfile.email'
          }
        ],
        'errorSummaryKeys': []
      }
    }
  });

});


test.requestHooks(enrollProfileFinishMock)('should show terminal screen after registration', async t => {
  const registrationPage = await setup(t);

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(5);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'primary-auth',
    formName: 'identify',
  });

  await t.expect(log[3]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[4])).eql({
    controller: null,
    formName: 'terminal',
  });

  await t.expect(registrationPage.getTerminalContent()).eql('An activation email has been sent to john@gmail.com. Follow instructions in the email to finish creating your account');
});

test.requestHooks(mock)('should call settings.registration.click on "Sign Up" click, instead of moving to registration page', async t => {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await rerenderWidget({
    baseUrl: 'http://localhost:3000',
    registration: {
      // eslint-disable-next-line
      click: () => console.log('hello')
    }
  });

  await identityPage.clickSignUpLink();
  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log[log.length-1]).eql('hello');
});
