import { RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import EnrollProfileViewPageObject from '../framework/page-objects/EnrollProfileViewPageObject';
import Identify from '../../../playground/mocks/data/idp/idx/identify-with-password';
import EnrollProfileSubmit from '../../../playground/mocks/data/idp/idx/enroll-profile-submit';
import EnrollProfileSignUp from '../../../playground/mocks/data/idp/idx/enroll-profile-new';
import EnrollProfileSignUpWithAdditionalFields from '../../../playground/mocks/data/idp/idx/enroll-profile-new-additional-fields';
import EnrollProfileSignUpWithBooleanFields from '../../../playground/mocks/data/idp/idx/enroll-profile-new-boolean-fields';
import EnrollProfileSignUpAllBaseAttributes from '../../../playground/mocks/data/idp/idx/enroll-profile-all-base-attributes';
import EnrollProfileSignUpWithPassword from '../../../playground/mocks/data/idp/idx/enroll-profile-with-password';
import EnrollProfileSignUpWithPasswordReturnsError from '../../../playground/mocks/data/idp/idx/enroll-profile-with-password-returns-error';
import EnrollProfileSignUpWithPasswordReturnsMultipleErrors from '../../../playground/mocks/data/idp/idx/enroll-profile-with-password-returns-multiple-errors';


const EnrollProfileSignUpMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(EnrollProfileSignUp);

const EnrollProfileSubmitMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(EnrollProfileSubmit);

const EnrollProfileSignUpWithAdditionalFieldsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(EnrollProfileSignUpWithAdditionalFields);

const EnrollProfileSignUpWithBooleanFieldsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(EnrollProfileSignUpWithBooleanFields);

const EnrollProfileSignUpAllBaseAttributesMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(EnrollProfileSignUpAllBaseAttributes);

const EnrollProfileSignUpWithPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(EnrollProfileSignUpWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(EnrollProfileSignUpWithPasswordReturnsError, 401);

const EnrollProfileSignUpWithPasswordMultipleErrorsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(EnrollProfileSignUpWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(EnrollProfileSignUpWithPasswordReturnsMultipleErrors, 401);

const requestLogger = RequestLogger(
  /idx\/*/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Enroll Profile')
  .meta('v3', true);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test.requestHooks(requestLogger, EnrollProfileSignUpMock)('should show sign up button when creating a new user', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();
  await t.expect(enrollProfilePage.getFormTitle()).eql('Sign up');
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('First name')).eql(true);
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Last name')).eql(true);
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Email')).eql(true);
  await t.expect(await enrollProfilePage.signUpButtonExists()).eql(true);
});

test.requestHooks(requestLogger, EnrollProfileSubmitMock)('should show submit button when updating info for an existing user', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('test');
  await identityPage.fillPasswordField('test 123');
  await identityPage.clickSignInButton();

  requestLogger.clear();
  await t.expect(enrollProfilePage.getFormTitle()).eql('Sign in');
  await t.expect(await enrollProfilePage.submitButtonExists()).eql(true);
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithAdditionalFieldsMock)('should show dropdown values for base properties (country code and timezone) on registration form', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();
  await t.expect(await enrollProfilePage.dropDownExistsByLabel('Country')).eql(true);
  await t.expect(await enrollProfilePage.form.getValueFromDropdown('userProfile.country')).eql('Select an Option');
  await enrollProfilePage.selectValueFromDropdown('userProfile.country', 1);

  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Country code')).eql(true);
  await enrollProfilePage.setTextBoxValue('userProfile.countryCode', 'US');

  await t.expect(await enrollProfilePage.dropDownExistsByLabel('Time zone')).eql(true);
  await t.expect(await enrollProfilePage.getValueFromDropdown('userProfile.timezone')).eql('Select an Option');
  await enrollProfilePage.selectValueFromDropdown('userProfile.timezone', 1);
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithBooleanFieldsMock)('should show radio and checkbox display for boolean data type fields', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();

  await t.expect(await enrollProfilePage.clickRadioButton('userProfile.pet', 0)).eql('Yes');

  await t.expect(await enrollProfilePage.getCheckboxValue('userProfile.subscribe')).eql(false);
  await enrollProfilePage.setCheckbox('userProfile.subscribe');
});

// TODO: OKTA-524769 - Enable this for v3 once ODY Team enables optional sub label in field elements
test.meta('v3', false).requestHooks(requestLogger, EnrollProfileSignUpAllBaseAttributesMock)('All Base Attributes are rendered based on their i18n translation, not the label in the json file', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();

  const formFieldToLabel = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    secondEmail: 'Secondary email',
    honorificPrefix: 'Honorific prefix',
    honorificSuffix: 'Honorific suffix',
    title: 'Title',
    displayName: 'Display name',
    nickName: 'Nickname',
    profileUrl: 'Profile URL',
    mobilePhone: 'Mobile phone',
    primaryPhone: 'Primary phone',
    streetAddress: 'Street address',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP Code',
    postalCode: 'Postal code',
    countryCode: 'Country code',
    postalAddress: 'Postal address',
    preferredLanguage: 'Preferred language',
    locale: 'Locale',
    userType: 'User type',
    employeeNumber: 'Employee number',
    costCenter: 'Cost center',
    organization: 'Organization',
    division: 'Division',
    department: 'Department',
    managerId: 'Manager ID',
    manager: 'Manager',
  };

  Object.keys(formFieldToLabel).forEach(async (formField) => {
    const selector = `userProfile.${formField}`;
    // verify all base attributes map to correct translation
    // all 'label' fields for base attributes in json are appended with a '1'
    await t.expect(await enrollProfilePage.getFormFieldLabel(selector)).eql(formFieldToLabel[formField]);
  });
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithPasswordMock)('should show prompt for password and password requirements', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();
  await t.expect(enrollProfilePage.getFormTitle()).eql('Sign up');
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('First name')).eql(true);
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Last name')).eql(true);
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Email')).eql(true);
  // verify prompt & field for password are rendered
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Password')).eql(true);
  // verify password text toggle is rendered
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
  // verify password requirements are rendered
  await t.expect(enrollProfilePage.getRequirements()).contains('Password requirements:');
  await t.expect(enrollProfilePage.getRequirements()).contains('At least 8 characters');
  await t.expect(enrollProfilePage.getRequirements()).contains('An uppercase letter');
  await t.expect(enrollProfilePage.getRequirements()).contains('A lowercase letter');
  await t.expect(enrollProfilePage.getRequirements()).contains('A number');
  await t.expect(enrollProfilePage.getRequirements()).contains('No parts of your username');

  await t.expect(await enrollProfilePage.signUpButtonExists()).eql(true);

  // Fill in attribute fields
  await enrollProfilePage.setTextBoxValue('userProfile.firstName', 'First');
  await enrollProfilePage.setTextBoxValue('userProfile.lastName', 'Last');
  await enrollProfilePage.setTextBoxValue('userProfile.email', 'first@last.com');
  await identityPage.fillPasswordField('secretPassword');
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithPasswordMock)('should show error for invalid password above form and on password field', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();

  // Fill in attribute fields
  await enrollProfilePage.setTextBoxValue('userProfile.firstName', 'First');
  await enrollProfilePage.setTextBoxValue('userProfile.lastName', 'Last');
  await enrollProfilePage.setTextBoxValue('userProfile.email', 'first@last.com');
  await identityPage.fillPasswordField('invalid');
  // click Sign Up
  await enrollProfilePage.form.clickSaveButton('Sign Up');
  // Verify error handling
  await enrollProfilePage.form.waitForErrorBox();

  await t.expect(await enrollProfilePage.form.getTextBoxErrorMessage('credentials.passcode'))
    .eql('Password requirements were not met');
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithPasswordMultipleErrorsMock)('should show multiple errors when multiple fields are invalid, including invalid password', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();

  // Fill in attribute fields
  await enrollProfilePage.setTextBoxValue('userProfile.firstName', 'First');
  await enrollProfilePage.setTextBoxValue('userProfile.lastName', 'Last');
  // Invalid email provided
  await enrollProfilePage.setTextBoxValue('userProfile.email', 'first@last');
  await identityPage.fillPasswordField('invalid');
  // click Save
  await enrollProfilePage.form.clickSaveButton('Sign Up');
  // Verify error handling
  await enrollProfilePage.form.waitForErrorBox();

  await t.expect(await enrollProfilePage.form.hasTextBoxErrorMessage('userProfile.email')).eql(true);
  await t.expect(await enrollProfilePage.form.getTextBoxErrorMessage('credentials.passcode'))
    .eql('Password requirements were not met');
});
