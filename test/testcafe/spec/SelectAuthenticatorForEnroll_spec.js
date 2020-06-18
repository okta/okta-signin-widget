import { RequestMock } from 'testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-select-enroll-options';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password';

import xhrSelectOptionalAuthenticators from '../../../playground/mocks/data/idp/idx//authenticator-select-enroll-optional';
import success from '../../../playground/mocks/data/idp/idx/success';

const mockEnrollAuthenticatorPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollPassword);

const mockOptionalAuthenticatorEnrollment = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectOptionalAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(success);


fixture(`Select Authenticator for enrollment Form`);

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test.requestHooks(mockEnrollAuthenticatorPassword)(`should load select authenticator list`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Set up authenticators to ensure that only you have access to your account.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(4);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Phone');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');


  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2))
    .eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(2)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Set up');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Security Question');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(3)).contains('mfa-okta-security-question');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Set up');
});

test.requestHooks(mockEnrollAuthenticatorPassword)(`should navigate to password enrollment page`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
});

test.requestHooks(mockOptionalAuthenticatorEnrollment)(`should skip optional enrollment and go to success`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');

  selectFactorPage.skipOptionalEnrollment();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

