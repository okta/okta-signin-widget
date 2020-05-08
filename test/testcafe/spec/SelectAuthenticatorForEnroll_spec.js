import { RequestMock } from 'testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectFactorPageObject';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/idp/idx/data/authenticator-select-enroll-options';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/idp/idx/data/authenticator-enroll-password';

const mockChallengePassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollPassword);


fixture(`Select Authenticator for enrollment Form`);

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test.requestHooks(mockChallengePassword)(`should load select authenticator list`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Setup');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Your company requires multifactor authentication to add an additional layer of ' +
    'security when signing in to your Okta account');
  await t.expect(selectFactorPage.getFactorsCount()).eql(2);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Okta Password');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Security Key or Biometric Authenticator (FIDO2)');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');

});

test.requestHooks(mockChallengePassword)(`should navigate to password enrollment page`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Setup');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
});

