import { RequestMock } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import identify from '../../../playground/mocks/idp/idx/data/identify';
import enrollProfile from '../../../playground/mocks/idp/idx/data/enroll-profile';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(enrollProfile);

fixture(`Registration Form`)
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.clickRegistrationButton();
  return new RegistrationPageObject(t);
}

/* i18n tests */
test(`should have the right labels for the fields`, async t => {
  const registrationPage = await setup(t);
  await t.expect(registrationPage.getHaveAccountLabel()).eql('Already have an account ?');
});

test(`should have editable fields`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.fillFirstNameField('Test First Name');
  await registrationPage.fillLastNameField('Test Last Name');

  await t.expect(registrationPage.getFirstNameValue()).eql('Test First Name');
  await t.expect(registrationPage.getLastNameValue()).eql('Test Last Name');
});

test(`should show errors if required fields are empty`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.clickSignInButton();
  await registrationPage.waitForErrorBox();
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(true);

});

test(`should show errors after empty required fields are focused out`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.fillFirstNameField('');
  await registrationPage.fillLastNameField('');
  await registrationPage.focusSignInButton();

  await registrationPage.waitForLastNameError();

  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(true);
});

