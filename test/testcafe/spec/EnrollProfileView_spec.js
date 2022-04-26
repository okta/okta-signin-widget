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

fixture('Enroll Profile');

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
  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.firstName')).eql('First name');
  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.lastName')).eql('Last name');
  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.email')).eql('Email');
  await t.expect(await enrollProfilePage.getSaveButtonLabel()).eql('Sign Up');
});

test.requestHooks(requestLogger, EnrollProfileSubmitMock)('should show submit button when updating info for an existing user', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('test');
  await identityPage.fillPasswordField('test 123');
  await identityPage.clickNextButton();

  requestLogger.clear();
  await t.expect(enrollProfilePage.getFormTitle()).eql('Sign in');
  await t.expect(await enrollProfilePage.getSaveButtonLabel()).eql('Submit');
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithAdditionalFieldsMock)('should show dropdown values for base properties (country code and timezone) on registration form', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();
  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.country')).eql('Country');
  await t.expect(await enrollProfilePage.isDropdownVisible('userProfile.country')).ok();
  await t.expect(await enrollProfilePage.getValueFromDropdown('userProfile.country')).eql('Select an Option');
  await enrollProfilePage.selectValueFromDropdown('userProfile.country', 1);

  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.countryCode')).eql('Country code');
  await enrollProfilePage.setTextBoxValue('userProfile.countryCode', 'US');

  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.timezone')).eql('Time zone');
  await t.expect(await enrollProfilePage.isDropdownVisible('userProfile.timezone')).ok();
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

test.requestHooks(requestLogger, EnrollProfileSignUpAllBaseAttributesMock)('All Base Attributes are rendered based on their i18n translation, not the label in the json file', async t => {
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
  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.firstName')).eql('First name');
  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.lastName')).eql('Last name');
  await t.expect(await enrollProfilePage.getFormFieldLabel('userProfile.email')).eql('Email');
  // verify prompt & field for password are rendered
  await t.expect(await enrollProfilePage.getFormFieldLabel('credentials.passcode')).eql('Password');
  // verify password text toggle is rendered
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
  // verify password requirements are rendered
  await t.expect(await enrollProfilePage.form.elementExist('section[data-se="password-authenticator--rules"]')).ok();
  await t.expect(await enrollProfilePage.form.getInnerTexts('div[class="password-authenticator--heading"]')).eql(['Password requirements:']);
  await t.expect(await enrollProfilePage.form.elementExist('ul[class="password-authenticator--list"]')).ok();

  await t.expect(await enrollProfilePage.getSaveButtonLabel()).eql('Sign Up');

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
  // click Save
  await enrollProfilePage.form.clickSaveButton();
  // Verify error handling
  await enrollProfilePage.form.waitForErrorBox();

  await t.expect(await enrollProfilePage.getErrorBoxText())
    .eql('We found some errors. Please review the form and make corrections.');
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
  await enrollProfilePage.form.clickSaveButton();
  // Verify error handling
  await enrollProfilePage.form.waitForErrorBox();

  await t.expect(await enrollProfilePage.getErrorBoxText())
    .eql('We found some errors. Please review the form and make corrections.');
  await t.expect(await enrollProfilePage.form.hasTextBoxErrorMessage('userProfile.email')).eql(true);
  await t.expect(await enrollProfilePage.form.getTextBoxErrorMessage('credentials.passcode'))
    .eql('Password requirements were not met');
});
