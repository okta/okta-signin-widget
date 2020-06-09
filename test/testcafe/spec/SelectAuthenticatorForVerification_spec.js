import { RequestMock } from 'testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-select-verify-options';
import xhrAuthenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrAuthenticatorRequiredEmail from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import xhrAuthenticatorRequiredWebauthn from '../../../playground/mocks/data/idp/idx/authenticator-verification-webauthn';

const mockChallengePassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredPassword);

const mockChallengeEmail = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredEmail);

const mockChallengeWebauthn = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredWebauthn);

fixture(`Select Authenticator for verification Form`);

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test.requestHooks(mockChallengePassword)(`should load select authenticator list`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(3);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Okta Password');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Security Key or Biometric Authenticator (FIDO2)');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Okta Email');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(2)).contains('mfa-okta-email');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');

});

test.requestHooks(mockChallengePassword)(`should navigate to password challenge page`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(0);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Password');
});

test.requestHooks(mockChallengeWebauthn)(`should navigate to webauthn challenge page`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(1);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Security Key or Biometric Authenticator');
});

test.requestHooks(mockChallengeEmail)(`should navigate to email challenge page`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(2);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Verify with your email');
});
