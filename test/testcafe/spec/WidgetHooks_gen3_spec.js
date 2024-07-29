import { ClientFunction, RequestMock } from 'testcafe';
import CustomizedIdentifyPageObject from '../framework/page-objects/CustomizedIdentifyPageObject';
import EnrollSecurityQuestionPageObject from '../framework/page-objects/EnrollSecurityQuestionPageObject';
import CustomizedEnrollProfileViewPageObject from '../framework/page-objects/CustomizedEnrollProfileViewPageObject';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrEnrollProfileNew from '../../../playground/mocks/data/idp/idx/enroll-profile-new.json';
import xhrAuthenticatorEnrollSecurityQuestion from '../../../playground/mocks/data/idp/idx/authenticator-enroll-security-question';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify);

const authenticatorEnrollSecurityQuestionMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollSecurityQuestion);

const enrollProfileMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollProfileNew);

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});


fixture('afterTransform hook - Gen 3').meta('gen2', false);

async function setup(t, widgetOptions) {
  const options = { render: false, customize: true };
  const identityPage = new CustomizedIdentifyPageObject(t);
  await identityPage.navigateToPage(options);
  await renderWidget(widgetOptions);
  await t.expect(identityPage.formExists()).ok();
  return identityPage;
}

async function setupEnrollSecurityQuestion(t, widgetOptions) {
  const options = { render: false, customize: true };
  const enrollSecurityQuestionPage = new EnrollSecurityQuestionPageObject(t);
  await enrollSecurityQuestionPage.navigateToPage(options);
  await renderWidget(widgetOptions);
  await t.expect(enrollSecurityQuestionPage.formExists()).ok();
  return enrollSecurityQuestionPage;
}

async function setupEnrollProfile(t, widgetOptions) {
  const options = { render: false, customize: true };
  const enrollPage = new CustomizedEnrollProfileViewPageObject(t);
  await enrollPage.navigateToPage(options);
  await renderWidget(widgetOptions);
  await t.expect(enrollPage.formExists()).ok();
  return enrollPage;
}

test.requestHooks(identifyMock)('should show custom Terms of Service link', async t => {
  const identityPage = await setup(t);

  // custom page title
  await t.expect(identityPage.getFormTitle()).eql('Login to WidgiCo');
  // custom link
  await t.expect(identityPage.getCustomLinkText()).eql('Terms of Service');
  await t.expect(identityPage.getCustomLinkUrl()).eql('https://www.okta.com/terms-of-service/');
});

test.requestHooks(authenticatorEnrollSecurityQuestionMock)('should customize enroll security question form', async t => {
  const enrollSecurityQuestionPage = await setupEnrollSecurityQuestion(t);

  // assert Question type select and Custom Question textbox don't show up
  await t.expect(enrollSecurityQuestionPage.isSecurityQuestionTypeSelectVisible()).notOk();
  await t.expect(enrollSecurityQuestionPage.isCreateMyOwnSecurityQuestionTextBoxVisible()).notOk();
});

test.requestHooks(enrollProfileMock)('should customize enroll profile form', async t => {
  const enrollProfilePage = await setupEnrollProfile(t);

  // custom page title
  await t.expect(enrollProfilePage.getFormTitle()).eql('Register new profile');
  // custom description
  await t.expect(enrollProfilePage.getFormDescriptionText()).eql('Your'+'custom'+'description');
  // custom submit button name
  await t.expect(await enrollProfilePage.signUpButtonExists('Register')).eql(true);

  // check default fields exist
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('First name')).eql(true);
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Last name')).eql(true);
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('Email')).eql(true);
  // check custom fields exist
  await t.expect(await enrollProfilePage.formFieldExistsByLabel('TIN')).eql(true);
  await t.expect(enrollProfilePage.getCustomBoolLabelText()).eql('Terms and Conditions');

  // Fill in default attribute fields and check error messages
  await enrollProfilePage.setTextBoxValue('userProfile.firstName', 'John');
  await enrollProfilePage.setTextBoxValue('userProfile.lastName', 'Doe');
  await enrollProfilePage.setTextBoxValue('userProfile.email', 'john@acme.com');
  await enrollProfilePage.form.clickSaveButton('Register');
  await enrollProfilePage.form.waitForErrorBox();
  const tinErrorMessage = await enrollProfilePage.form.getTextBoxErrorMessage('custom_string');
  await t.expect(tinErrorMessage).contains('This field cannot be left blank');

  // Fill in custom attribute fields and check error messages
  await enrollProfilePage.setTextBoxValue('custom_string', '111');
  await enrollProfilePage.form.clickSaveButton('Register');
  await enrollProfilePage.form.waitForErrorBox();
  const tinErrorMessage2 = await enrollProfilePage.form.getTextBoxErrorMessage('custom_string');
  await t.expect(tinErrorMessage2).contains('This field cannot be less than the minimum required characters');

  // Fill in custom attribute fields with correct values
  await enrollProfilePage.setCheckbox('custom_bool');
  await enrollProfilePage.setTextBoxValue('custom_string', '999888777');
  await enrollProfilePage.form.clickSaveButton('Register');
  await enrollProfilePage.form.waitForErrorBox();
  await t.expect(await enrollProfilePage.form.hasTextBoxErrorMessage('custom_bool')).eql(false);
  await t.expect(await enrollProfilePage.form.hasTextBoxErrorMessage('custom_string')).eql(false);
});
