import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ProfileEnrollmentStringOptionsViewPageObject from '../framework/page-objects/ProfileEnrollmentStringOptionsViewPageObject';
import Identify from '../../../playground/mocks/data/idp/idx/identify-with-password';
import ProfileEnrollmentStringFieldsOptions from '../../../playground/mocks/data/idp/idx/profile-enrollment-string-fields-options';
import EnrollProfileUpdateSuccess from '../../../playground/mocks/data/idp/idx/success-with-app-user';

const ProfileEnrollmentSignUpWithStringFieldsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(Identify)
  .onRequestTo('http://localhost:3000/idp/idx/enroll')
  .respond(ProfileEnrollmentStringFieldsOptions)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(EnrollProfileUpdateSuccess);

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
  await t.expect(identityPage.formExists()).ok();
  return identityPage;
}

test.requestHooks(requestLogger, ProfileEnrollmentSignUpWithStringFieldsMock)('should show dropdown values for select and radio buttons', async t => {
  const profileEnrollmentString = new ProfileEnrollmentStringOptionsViewPageObject(t);
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickSignUpLink();

  requestLogger.clear();
  await t.expect(profileEnrollmentString.getFormTitle()).eql('Sign up');

  await t.expect(await profileEnrollmentString.form.fieldByLabelExists('First name')).eql(true);
  await t.expect(await profileEnrollmentString.form.fieldByLabelExists('Last name')).eql(true);
  await t.expect(await profileEnrollmentString.form.fieldByLabelExists('Email')).eql(true);

  await t.expect(await profileEnrollmentString.dropDownFieldByLabelExists('Colors')).eql(true);
  await profileEnrollmentString.selectValueFromDropdown('userProfile.colores', 1);

  await t.expect(await profileEnrollmentString.dropDownFieldByLabelExists('Favorite Song')).eql(true);
  await profileEnrollmentString.selectValueFromDropdown('userProfile.favsong', 1);

  const favPizza = await profileEnrollmentString.clickRadioButton('userProfile.favpizza', 1);
  await t.expect(favPizza).eql('Razza');

  await t.expect(await profileEnrollmentString.form.getButton('Sign Up').exists).eql(true);
});

test.requestHooks(requestLogger, ProfileEnrollmentSignUpWithStringFieldsMock)('should submit form and remove empty optional fields from payload', async t => {
  const profileEnrollmentString = new ProfileEnrollmentStringOptionsViewPageObject(t);
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickSignUpLink();

  await profileEnrollmentString.fillEmailField('test.carlos@mycompany.com');
  await profileEnrollmentString.fillFirstNameField('Test Carlos');
  await profileEnrollmentString.fillLastNameField('Test');
  // To properly test this scenario for both gen2 and gen3, we must explicitly enter a value and then delete it
  await profileEnrollmentString.fillOptionalField('Value to Delete');
  // Delete the original string but leave some whitespace to ensure that it is trimmed and deemed an empty string
  await profileEnrollmentString.fillOptionalField(' ');

  requestLogger.clear();
  await profileEnrollmentString.clickSignUpButton();

  const req = requestLogger.requests[0].request;
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/enroll/new');
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    userProfile: {
      email: 'test.carlos@mycompany.com',
      firstName: 'Test Carlos',
      lastName: 'Test'
    },
    stateHandle: '01r2p5S9qaAjESMFuPzt7r3ZMcZZQ_vvS0Tzg56ajB',
  });
});
