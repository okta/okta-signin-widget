import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';

fixture(`Registration Form`);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.clickRegistrationButton();
  return new RegistrationPageObject(t);;
}

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

  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
});

test(`should show errors after empty required fields are focused out`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.fillFirstNameField('');
  await registrationPage.fillLastNameField('');
  await registrationPage.focusSignInButton();

  await registrationPage.waitForLastNameError();

  await t.expect(registrationPage.hasFirstNameError()).eql(true);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(true);
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
});

test(`should not show errors on first field if not interacted with`, async t => {
  const registrationPage = await setup(t);

  await registrationPage.fillLastNameField('');
  await registrationPage.focusSignInButton();

  await registrationPage.waitForLastNameError();

  await t.expect(registrationPage.hasFirstNameError()).eql(false);
  await t.expect(registrationPage.hasFirstNameErrorMessage()).eql(false);
  await t.expect(registrationPage.hasLastNameError()).eql(true);
  await t.expect(registrationPage.hasLastNameErrorMessage()).eql(true);
});
