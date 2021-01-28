import { RequestMock, RequestLogger } from 'testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password';

import xhrSelectAuthenticatorsWithSkip from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-with-skip';
import success from '../../../playground/mocks/data/idp/idx/success';

const mockEnrollAuthenticatorPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollPassword);

const mockOptionalAuthenticatorEnrollment = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithSkip)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(success);

const requestLogger = RequestLogger(
  /idx\/introspect|\/credential\/enroll/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Select Authenticator for enrollment Form');

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test.requestHooks(mockEnrollAuthenticatorPassword)('should load select authenticator list', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Set up authenticators to ensure that only you have access to your account.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(6);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_password');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql('Choose a password for your account');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Phone');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('phone_number');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql('Verify with a code sent to your phone');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2)).eql('Use a security key or a biometric authenticator to sign in');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(2)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('webauthn');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Security Question');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(3)).contains('mfa-okta-security-question');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3)).eql('security_question');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('Choose a security question and answer that will be used for signing in');

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Okta Verify');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(4)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(4)).eql('okta_verify');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(4))
    .eql('Okta Verify is an authenticator app, installed on your phone or computer, used to prove your identity');

  // no signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).notOk();

});

test.requestHooks(mockEnrollAuthenticatorPassword)('should navigate to password enrollment page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
});

test.requestHooks(requestLogger, mockEnrollAuthenticatorPassword)('select password challenge page and hit switch authenticator and re-select password', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
  await enrollPasswordPage.clickSwitchAuthenticatorButton();
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');
  // re-select password
  selectFactorPage.selectFactorByIndex(0);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);

  await t.expect(requestLogger.count(() => true)).eql(3);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/credential/enroll');
  await t.expect(req2.method).eql('post');
  await t.expect(req2.body).eql('{"authenticator":{"id":"autwa6eD9o02iBbtv0g3"},"stateHandle":"02CqFbzJ_zMGCqXut-1CNXfafiTkh9wGlbFqi9Xupt"}');

  const req3 = requestLogger.requests[2].request;
  await t.expect(req3.url).eql('http://localhost:3000/idp/idx/credential/enroll');
  await t.expect(req3.method).eql('post');
  await t.expect(req3.body).eql('{"authenticator":{"id":"autwa6eD9o02iBbtv0g3"},"stateHandle":"02CqFbzJ_zMGCqXut-1CNXfafiTkh9wGlbFqi9Xupt"}');
});

test.requestHooks(mockOptionalAuthenticatorEnrollment)('should skip optional enrollment and go to success', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');

  selectFactorPage.skipOptionalEnrollment();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

