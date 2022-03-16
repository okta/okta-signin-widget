import { RequestMock, RequestLogger } from 'testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrSelectAuthenticatorsWithUsageInfo from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-with-usage-info';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password';

import xhrSelectAuthenticatorsWithSkip from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-with-skip';
import success from '../../../playground/mocks/data/idp/idx/success';

import xhrSelectAuthenticatorEnroll from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrAuthenticatorEnrollCustomOTP from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-custom-otp';

const mockEnrollAuthenticatorPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollPassword);

const mockEnrollAuthenticatorWithUsageInfo = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithUsageInfo);

const mockOptionalAuthenticatorEnrollment = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithSkip)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(success);

const mockEnrollAuthenticatorCustomOTP = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorEnroll)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond((req, res) => {
    res.statusCode = '403';
    res.setBody(xhrAuthenticatorEnrollCustomOTP);
  });

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
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Security methods help protect your account by ensuring only you have access.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(13);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_password');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql('Choose a password for your account');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(0)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Phone');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('phone_number');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql('Verify with a code sent to your phone');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(1)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2)).eql('Use a security key or a biometric authenticator to sign in');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(2)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('webauthn');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(2)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Security Question');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(3)).contains('mfa-okta-security-question');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3)).eql('security_question');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('Choose a security question and answer that will be used for signing in');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(3)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Okta Verify');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(4)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(4)).eql('okta_verify');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(4))
    .eql('Okta Verify is an authenticator app, installed on your phone, used to prove your identity');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(4)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(5)).eql('Google Authenticator');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(5)).contains('mfa-google-auth');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(5)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(5)).eql('google_otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(5))
    .eql('Enter a temporary code generated from the Google Authenticator app.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(5)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(6)).eql('Atko Custom On-prem');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(6)).contains('mfa-onprem');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(6)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(6)).eql('onprem_mfa-otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(6))
    .eql('Verify by entering a code generated by Atko Custom On-prem.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(6)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(7)).eql('RSA SecurID');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(7)).contains('mfa-rsa');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(7)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(7)).eql('rsa_token-otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(7))
    .eql('Verify by entering a code generated by RSA SecurID');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(7)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(8)).eql('Duo Security');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(8)).contains('mfa-duo');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(8)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(8)).eql('duo');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(8)).eql('Verify your identity using Duo Security.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(8)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(9)).eql('IDP Authenticator');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(9)).contains('mfa-custom-factor');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(9)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(9)).eql('external_idp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(9))
    .eql('Redirect to verify with IDP Authenticator.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(9)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(10)).eql('Atko Custom OTP Authenticator');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(10)).contains('mfa-hotp');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(10)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(10)).eql('custom_otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(10)).eql('Enter a temporary code generated from an authenticator device.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(10)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(11)).eql('Symantec VIP');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(11)).contains('mfa-symantec');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(11)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(11)).eql('symantec_vip');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(11)).eql('Verify by entering a temporary code from the Symantec VIP app.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(11)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(12)).eql('YubiKey Authenticator');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(12)).contains('mfa-yubikey');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(12)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(12)).eql('yubikey_token');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(12)).eql('Verify your identity using YubiKey');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(12)).eql(false);

  await t.expect(await selectFactorPage.signoutLinkExists()).ok();
});

test.requestHooks(mockEnrollAuthenticatorWithUsageInfo)('should load select authenticator list with or without usage text based on allowedFor value', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Security methods help protect your account by ensuring only you have access.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(4);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_password');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql('Choose a password for your account');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(0)).eql(true);
  await t.expect(selectFactorPage.getFactorUsageTextByIndex(0)).eql('Used for access');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Phone');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('phone_number');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql('Verify with a code sent to your phone');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(1)).eql(true);
  await t.expect(selectFactorPage.getFactorUsageTextByIndex(1)).eql('Used for recovery');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Okta Verify');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(2)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('okta_verify');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2))
    .eql('Okta Verify is an authenticator app, installed on your phone, used to prove your identity');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(2)).eql(true);
  await t.expect(selectFactorPage.getFactorUsageTextByIndex(2)).eql('Used for access and recovery');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Security Question');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(3)).contains('mfa-okta-security-question');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3)).eql('security_question');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('Choose a security question and answer that will be used for signing in');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(3)).eql(false);
});

test.requestHooks(mockEnrollAuthenticatorPassword)('should navigate to password enrollment page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
});

test.requestHooks(requestLogger, mockEnrollAuthenticatorPassword)('select password challenge page and hit switch authenticator and re-select password', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
  await enrollPasswordPage.clickSwitchAuthenticatorButton();
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');
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
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');

  selectFactorPage.skipOptionalEnrollment();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockEnrollAuthenticatorCustomOTP)('enroll custom OTP authenticator shows error on select authenticator enroll page', async t => {
  const selectFactorPage = await setup(t);
  await selectFactorPage.clickCustomOTP();
  const error = await selectFactorPage.getErrorFromErrorBox();
  // custom OTP is blocked for enduser. Can only be enrolled by admin
  await t.expect(error).contains('Contact your administrator to continue enrollment.');
});
