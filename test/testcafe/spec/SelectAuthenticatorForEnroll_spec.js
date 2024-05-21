import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';

import { oktaDashboardContent } from '../framework/shared';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import FactorEnrollPhonePageObject from '../framework/page-objects/FactorEnrollPhonePageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrSelectAuthenticatorsWithUsageInfo from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-with-usage-info';
import xhrSelectAuthenticatorsWithCustomApp from '../../../playground/mocks/data/idp/idx/authenticator-enroll-custom-app-push';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password';
import xhrAuthenticatorEnrollDataPhone from '../../../playground/mocks/data/idp/idx/authenticator-enroll-data-phone';
import xhrAuthenticatorEnrollPhoneInvalidNumber from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-phone-invalid-number';

import xhrSelectAuthenticatorsWithSkip from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-with-skip';
import success from '../../../playground/mocks/data/idp/idx/success';

import xhrSelectAuthenticatorEnroll from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrAuthenticatorEnrollCustomOTP from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-custom-otp';

const mockEnrollAuthenticatorPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollPassword);

const mockEnrollAuthenticatorPhoneSmsInvalidPhone = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';

    const body = req.body.toString('utf-8');
    const bodyJson = JSON.parse(body);
    if (bodyJson?.authenticator?.methodType) {
      // if we POST with methodType its the enroll call when the user enters a phone number
      res.statusCode = '400';
      res.setBody(xhrAuthenticatorEnrollPhoneInvalidNumber);
    } else {
      // if we POST with methodType its the enroll call when the user clicks the authenticator from the list
      res.statusCode = '200';
      res.setBody(xhrAuthenticatorEnrollDataPhone);
    }
  });

const mockEnrollAuthenticatorWithUsageInfo = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithUsageInfo);

const mockOptionalAuthenticatorEnrollment = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithSkip)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const mockEnrollAuthenticatorCustomOTP = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorEnroll)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond((req, res) => {
    res.statusCode = '403';
    res.headers['content-type'] = 'application/json';
    res.setBody(xhrAuthenticatorEnrollCustomOTP);
  });

const mockEnrollAuthenticatorWithCustomApp = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithCustomApp);

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
  await t.expect(selectFactorPageObject.formExists()).ok();
  return selectFactorPageObject;
}

test.requestHooks(mockEnrollAuthenticatorPassword)('should load select authenticator list', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Security methods help protect your account by ensuring only you have access.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(13);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(0)).eql('Set up Password.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0, true)).eql('okta_password');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql('Choose a password for your account');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(0)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Phone');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(1)).eql('Set up Phone.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1, true)).eql('phone_number');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql('Verify with a code sent to your phone');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(1)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Security Key or Biometric Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(2)).eql('Set up Security Key or Biometric Authenticator.');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2)).eql('Use a security key or a biometric authenticator to sign in');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2, true)).eql('webauthn');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(2)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Security Question');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(3)).eql('Set up Security Question.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(3)).contains('mfa-okta-security-question');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3, true)).eql('security_question');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('Choose a security question and answer that will be used for signing in');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(3)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Okta Verify');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(4)).eql('Set up Okta Verify.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(4)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(4, true)).eql('okta_verify');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(4))
    .eql('Okta Verify is an authenticator app, installed on your phone, used to prove your identity');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(4)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(5)).eql('Google Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(5)).eql('Set up Google Authenticator.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(5)).contains('mfa-google-auth');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(5)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(5, true)).eql('google_otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(5))
    .eql('Enter a temporary code generated from the Google Authenticator app.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(5)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(6)).eql('Atko Custom On-prem');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(6)).eql('Set up Atko Custom On-prem.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(6)).contains('mfa-onprem');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(6)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(6, true)).eql('onprem_mfa-otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(6))
    .eql('Verify by entering a code generated by Atko Custom On-prem.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(6)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(7)).eql('RSA SecurID');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(7)).eql('Set up RSA SecurID.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(7)).contains('mfa-rsa');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(7)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(7, true)).eql('rsa_token-otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(7))
    .eql('Verify by entering a code generated by RSA SecurID');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(7)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(8)).eql('Duo Security');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(8)).eql('Set up Duo Security.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(8)).contains('mfa-duo');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(8)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(8, true)).eql('duo');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(8)).eql('Verify your identity using Duo Security.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(8)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(9)).eql('IDP Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(9)).eql('Set up IDP Authenticator.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(9)).contains('mfa-custom-factor');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(9)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(9, true)).eql('external_idp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(9))
    .eql('Redirect to verify with IDP Authenticator.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(9)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(10)).eql('Atko Custom OTP Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(10)).eql('Set up Atko Custom OTP Authenticator.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(10)).contains('mfa-hotp');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(10)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(10, true)).eql('custom_otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(10)).eql('Enter a temporary code generated from an authenticator device.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(10)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(11)).eql('Symantec VIP');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(11)).eql('Set up Symantec VIP.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(11)).contains('mfa-symantec');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(11)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(11, true)).eql('symantec_vip');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(11)).eql('Verify by entering a temporary code from the Symantec VIP app.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(11)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(12)).eql('YubiKey Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(12)).eql('Set up YubiKey Authenticator.');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(12)).contains('mfa-yubikey');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(12)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(12, true)).eql('yubikey_token');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(12)).eql('Verify your identity using YubiKey');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(12)).eql(false);

  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(mockEnrollAuthenticatorWithUsageInfo)('should load select authenticator list with or without usage text based on allowedFor value', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Security methods help protect your account by ensuring only you have access.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(4);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0, true)).eql('okta_password');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql('Choose a password for your account');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(0)).eql(true);
  await t.expect(selectFactorPage.getFactorUsageTextByIndex(0)).eql('Used for access');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(0)).eql('Set up Password.');
  if (userVariables.gen3) {
    await t.expect(await selectFactorPage.getFactorAriaDescriptionByIndex(0)).eql(
      'Choose a password for your account. Used for access. Set up'
    );
  }

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Phone');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1, true)).eql('phone_number');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql('Verify with a code sent to your phone');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(1)).eql(true);
  await t.expect(selectFactorPage.getFactorUsageTextByIndex(1)).eql('Used for recovery');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2, true)).eql('okta_verify');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2))
    .eql('Okta Verify is an authenticator app, installed on your phone, used to prove your identity');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(2)).eql(true);
  await t.expect(selectFactorPage.getFactorUsageTextByIndex(2)).eql('Used for access or recovery');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Security Question');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(3)).contains('mfa-okta-security-question');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3, true)).eql('security_question');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('Choose a security question and answer that will be used for signing in');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(3)).eql(false);
});

test.requestHooks(mockEnrollAuthenticatorPassword)('should navigate to password enrollment page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
});

test.requestHooks(requestLogger, mockEnrollAuthenticatorPassword)('select password challenge page and hit switch authenticator and re-select password', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');

  selectFactorPage.selectFactorByIndex(0);
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);
  await enrollPasswordPage.clickReturnToAuthenticatorListLink();
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

test.requestHooks(requestLogger, mockEnrollAuthenticatorPhoneSmsInvalidPhone)('select enroll phone sms, enter invalid phone, hit switch authenticator, and re-select phone', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');

  selectFactorPage.selectFactorByIndex(1);
  const enrollPhonePage = new FactorEnrollPhonePageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up phone authentication');
  await t.expect(enrollPhonePage.phoneNumberFieldExists()).eql(true);
  await enrollPhonePage.fillPhoneNumber('123'); // an invalid phone number
  await enrollPhonePage.clickReceiveSmsCodeButton();
  await t.expect(enrollPhonePage.getErrorBoxText()).contains('Invalid Phone Number.');
  await enrollPhonePage.clickReturnToAuthenticatorListLink();
  await t.expect(enrollPhonePage.hasErrorBox()).eql(false);
  // re-select phone
  selectFactorPage.selectFactorByIndex(1);
  await t.expect(enrollPhonePage.hasErrorBox()).eql(false);
  await t.expect(enrollPhonePage.phoneNumberFieldExists()).eql(true);

  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  // clicking phone in authenticator list
  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/credential/enroll');
  await t.expect(req2.method).eql('post');
  const req2Body = JSON.parse(req2.body);
  await t.expect(req2Body?.authenticator?.id).notEql(undefined);
  await t.expect(req2Body?.stateHandle).notEql(undefined);

  // clicking send sms button
  const req3 = requestLogger.requests[2].request;
  await t.expect(req3.url).eql('http://localhost:3000/idp/idx/credential/enroll');
  await t.expect(req3.method).eql('post');
  const req3Body = JSON.parse(req3.body);
  await t.expect(req3Body?.authenticator?.id).notEql(undefined);
  await t.expect(req3Body?.authenticator?.methodType).eql('sms');
  await t.expect(req3Body?.authenticator?.phoneNumber).eql('+1123');
  await t.expect(req3Body?.stateHandle).notEql(undefined);

  // clicking phone in authenticator list
  const req4 = requestLogger.requests[3].request;
  await t.expect(req4.url).eql('http://localhost:3000/idp/idx/credential/enroll');
  await t.expect(req4.method).eql('post');
  const req4Body = JSON.parse(req4.body);
  await t.expect(req4Body?.authenticator?.id).notEql(undefined);
  await t.expect(req4Body?.stateHandle).notEql(undefined);
});

test.requestHooks(mockOptionalAuthenticatorEnrollment)('should skip optional enrollment and go to success', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');
  await t.expect(selectFactorPage.getFactorsCount()).eql(3);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0, true)).eql('okta_password');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql('Choose a password for your account');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(0)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Phone');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1, true)).eql('phone_number');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql('Verify with a code sent to your phone');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(1)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2)).eql('Use a security key or a biometric authenticator to sign in');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql(userVariables.gen3 ? 'Set up another' : 'Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2, true)).eql('webauthn');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(2)).eql(false);

  selectFactorPage.clickSetUpLaterButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockEnrollAuthenticatorCustomOTP)('enroll custom OTP authenticator shows error on select authenticator enroll page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await selectFactorPage.clickCustomOTP();
  const error = await selectFactorPage.getErrorFromErrorBox();
  // custom OTP is blocked for enduser. Can only be enrolled by admin
  await t.expect(error).contains('Contact your administrator to continue enrollment.');
});

test.requestHooks(mockEnrollAuthenticatorWithCustomApp)('should load select authenticator list with custom app', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up security methods');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(
    'Security methods help protect your account by ensuring only you have access.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(5);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Custom OTP');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-hotp');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0, true)).eql('custom_otp');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql('Enter a temporary code generated from an authenticator device.');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(0)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('My custom push authenticator 8');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('custom-app-logo');
  await t.expect(selectFactorPage.getFactorIconBgImageByIndex(1)).match(/.*\/img\/icons\/mfa\/customPushLogo\.svg/);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1, true)).eql('custom_app');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql('My custom push authenticator 8 is an authenticator app, installed on your phone, used to prove your identity');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(1)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2, true)).eql('okta_verify');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2))
    .eql('Okta Verify is an authenticator app, installed on your phone, used to prove your identity');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(2)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Phone');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(3)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3, true)).eql('phone_number');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('Verify with a code sent to your phone');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(3)).eql(false);

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(4)).eql('Use a security key or a biometric authenticator to sign in');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(4)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Set up');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(4, true)).eql('webauthn');
  await t.expect(await selectFactorPage.factorUsageTextExistsByIndex(4)).eql(false);
});
