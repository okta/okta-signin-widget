import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
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
import EnrollProfileSignUpWithIdps from '../../../playground/mocks/data/idp/idx/enroll-profile-with-idps';


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

const EnrollProfileSignUpWIthIdpsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(EnrollProfileSignUpWithIdps);

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
  await checkA11y(t);
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
  await checkA11y(t);
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
  await checkA11y(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();
  await t.expect(await enrollProfilePage.dropDownExistsByLabel('Country')).eql(true);
  const defaultOptionLabel = userVariables.v3 ? 'Select an option' : 'Select an Option';
  await t.expect(await enrollProfilePage.form.getValueFromDropdown('userProfile.country')).eql(defaultOptionLabel);
  await enrollProfilePage.selectValueFromDropdown('userProfile.country', 1);

  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Country code')).eql(true);
  await enrollProfilePage.setTextBoxValue('userProfile.countryCode', 'US');

  await t.expect(await enrollProfilePage.dropDownExistsByLabel('Time zone')).eql(true);
  await t.expect(await enrollProfilePage.getValueFromDropdown('userProfile.timezone')).eql(defaultOptionLabel);
  await enrollProfilePage.selectValueFromDropdown('userProfile.timezone', 1);
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithBooleanFieldsMock)('should show radio and checkbox display for boolean data type fields', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();

  await t.expect(await enrollProfilePage.clickRadioButton('userProfile.pet', 0)).eql('Yes');

  await t.expect(await enrollProfilePage.getCheckboxValue('userProfile.required')).eql(false);
  await t.expect(await enrollProfilePage.getCheckboxValue('userProfile.optional')).eql(false);
  await enrollProfilePage.setCheckbox('userProfile.required');
  await enrollProfilePage.setCheckbox('userProfile.optional');
});

// TODO: OKTA-524769 - Enable this for v3 once ODY Team enables optional sub label in field elements
test.meta('v3', false).requestHooks(requestLogger, EnrollProfileSignUpAllBaseAttributesMock)('All Base Attributes are rendered based on their i18n translation, not the label in the json file', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await checkA11y(t);
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
  await checkA11y(t);
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
  await t.expect(enrollProfilePage.hasText('Password requirements:')).eql(true);
  await t.expect(enrollProfilePage.hasText('At least 8 characters')).eql(true);
  await t.expect(enrollProfilePage.hasText('An uppercase letter')).eql(true);
  await t.expect(enrollProfilePage.hasText('A lowercase letter')).eql(true);
  await t.expect(enrollProfilePage.hasText('A number')).eql(true);
  await t.expect(enrollProfilePage.hasText('No parts of your username')).eql(true);

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
  await checkA11y(t);
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

  // Field level error for v3 has been changed to display a list of failed requirements
  // Prefixed with "Password requirements were not met"
  const passwordErrorMessage = await enrollProfilePage.form.getTextBoxErrorMessage('credentials.passcode');
  await t.expect(passwordErrorMessage).contains('Password requirements were not met');
  if (userVariables.v3) {
    await t.expect(passwordErrorMessage).contains('A number');
    await t.expect(passwordErrorMessage).contains('At least 8 characters');
    await t.expect(passwordErrorMessage).contains('An uppercase letter'); 
  }
});

test.requestHooks(requestLogger, EnrollProfileSignUpWithPasswordMultipleErrorsMock)('should show multiple errors when multiple fields are invalid, including invalid password', async t => {
  const enrollProfilePage = new EnrollProfileViewPageObject(t);
  const identityPage = await setup(t);
  await checkA11y(t);
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

  // Field level error for v3 has been changed to display a list of failed requirements
  // Prefixed with "Password requirements were not met"
  const passwordErrorMessage = await enrollProfilePage.form.getTextBoxErrorMessage('credentials.passcode');
  await t.expect(passwordErrorMessage).contains('Password requirements were not met');
  if (userVariables.v3) {
    await t.expect(passwordErrorMessage).contains('A number');
    await t.expect(passwordErrorMessage).contains('At least 8 characters');
    await t.expect(passwordErrorMessage).contains('An uppercase letter');

    // v3 implements requirements as a client-side error so we must complete and resubmit for
    // additional errors
    await identityPage.fillPasswordField('invalid3A');
    // v3 triggers field level validation on blur, so to prevent a mis-click we are triggering the blur
    await t.pressKey('tab');
    await enrollProfilePage.form.clickSaveButton('Sign Up');
  }

  await t.expect(await enrollProfilePage.form.hasTextBoxErrorMessage('userProfile.email', 0)).eql(true);
});

// OKTA-585923 Custom IDPs not yet supported in gen 3 widget
test.meta('v3', false).requestHooks(requestLogger, EnrollProfileSignUpWIthIdpsMock)('Should render social IDP buttons when returned via remediation', async t => {
  
  const enrollProfilePage = await setup(t);
  await checkA11y(t);
  await enrollProfilePage.clickSignUpLink();

  requestLogger.clear();

  await t.expect(enrollProfilePage.getIdpButton('.social-auth-facebook-button').textContent).eql('Sign in with Facebook');
  await t.expect(enrollProfilePage.getIdpButton('.social-auth-google-button').textContent).eql('Sign in with Google');
  await t.expect(enrollProfilePage.getIdpButton('.social-auth-linkedin-button').textContent).eql('Sign in with LinkedIn');
  await t.expect(enrollProfilePage.getIdpButton('.social-auth-microsoft-button').textContent).eql('Sign in with Microsoft');
});

// OKTA-585923 Custom IDPs not yet supported in gen 3 widget
test.meta('v3', false).requestHooks(requestLogger, EnrollProfileSignUpWIthIdpsMock)('Clicking IDP buttons does redirect', async t => {
  
  const enrollProfilePage = await setup(t);
  await checkA11y(t);
  await enrollProfilePage.clickSignUpLink();

  requestLogger.clear();

  await t.expect(enrollProfilePage.getIdpButton('.social-auth-facebook-button').textContent).eql('Sign in with Facebook');
  await t.expect(enrollProfilePage.getIdpButton('.social-auth-google-button').textContent).eql('Sign in with Google');
  await t.expect(enrollProfilePage.getIdpButton('.social-auth-linkedin-button').textContent).eql('Sign in with LinkedIn');
  await t.expect(enrollProfilePage.getIdpButton('.social-auth-microsoft-button').textContent).eql('Sign in with Microsoft');

  //click on social idp button
  await enrollProfilePage.clickIdpButton('.social-auth-facebook-button');
  const pageUrl = await enrollProfilePage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/sso/idps/facebook-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA');
});

// OKTA-585923 Custom IDPs not yet supported in gen 3 widget
test.meta('v3', false).requestHooks(requestLogger, EnrollProfileSignUpWIthIdpsMock)('custom idps should show correct label', async t => {
  const enrollProfilePage = await setup(t);
  await checkA11y(t);
  await enrollProfilePage.clickSignUpLink();

  requestLogger.clear();
  
  await t.expect(enrollProfilePage.getIdpsContainer().childElementCount).eql(8);
  await t.expect(enrollProfilePage.getCustomIdpButtonLabel(0)).contains('Sign in with My SAML IDP');
  await t.expect(enrollProfilePage.getCustomIdpButtonLabel(1)).eql('Sign in with SAML IDP');
});
