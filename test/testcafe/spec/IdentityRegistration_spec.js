import { RequestMock } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import identify from '../../../playground/mocks/idp/idx/data/identify';
import enrollProfile from '../../../playground/mocks/idp/idx/data/enroll-profile';
import enrollProfileNew from '../../../playground/mocks/idp/idx/data/enroll-profile-new';
import enrollProfileError from '../../../playground/mocks/idp/idx/data/error-new-signup-email';

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

fixture(`Registration Form`);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.clickSignUpLink();
  return new RegistrationPageObject(t);
}

/* i18n tests */
test.requestHooks(mock)(`should have the right labels for the fields`, async t => {
  const registrationPage = await setup(t);
  await t.expect(registrationPage.getHaveAccountLabel()).eql('Already have an account ?');
});

test.requestHooks(mock)(`should have editable fields`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.fillFirstNameField('Test First Name');
  await registrationPage.fillLastNameField('Test Last Name');
  await registrationPage.fillEmailField('test@email.com');

  await t.expect(registrationPage.getFirstNameValue()).eql('Test First Name');
  await t.expect(registrationPage.getLastNameValue()).eql('Test Last Name');
  await t.expect(registrationPage.getEmail()).eql('test@email.com');
});

test.requestHooks(mock)(`should show errors if required fields are empty`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.clickRegisterButton();
  await registrationPage.waitForErrorBox();
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);

});

test.requestHooks(mock)(`should show errors after empty required fields are focused out`, async t => {
  const registrationPage = await setup(t);

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

test.requestHooks(enrollProfileErrorMock)(`should show email field validation errors`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.fillFirstNameField('abc');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('invalidemail');

  await registrationPage.clickRegisterButton();

  await registrationPage.waitForEmailError();

  await t.expect(registrationPage.hasEmailError()).eql(true);
  await t.expect(registrationPage.hasEmailErrorMessage()).eql(true);
  await t.expect(registrationPage.getEmailErrorMessage()).contains('\'Email\' must be in the form of an email address');
});
