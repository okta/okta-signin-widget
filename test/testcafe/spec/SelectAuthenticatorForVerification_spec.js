import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';

import { renderWidget } from '../framework/shared';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';
import xhrSelectAuthenticatorsWithNickname from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-with-nickname';
import xhrSelectAuthenticatorsWithCustomLogo from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-custom-logo.json';
import xhrSelectAuthenticatorsWithEmail from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-with-email';
import xhrSelectAuthenticatorsNoNumber from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-no-number';
import xhrSelectAuthenticatorsOktaVerify from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-ov-m2';
import xhrSelectAuthenticatorsRecovery from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-for-recovery';
import xhrAuthenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrAuthenticatorRequiredEmail from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import xhrAuthenticatorRequiredWebauthn from '../../../playground/mocks/data/idp/idx/authenticator-verification-webauthn';
import xhrAuthenticatorRequiredOnPremMfa from '../../../playground/mocks/data/idp/idx/authenticator-verification-on-prem';
import xhrAuthenticatorRequiredRsa from '../../../playground/mocks/data/idp/idx/authenticator-verification-rsa';
import xhrAuthenticatorDuo from '../../../playground/mocks/data/idp/idx/authenticator-verification-duo';
import xhrAuthenticatorOVTotp from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-totp';
import xhrAuthenticatorOVPush from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import xhrAuthenticatorOVFastPass from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-loopback';
import xhrSelectAuthenticatorsOktaVerifyWithoutSignedNonce from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-without-signed-nonce';
import xhrAuthenticatorCustomOTP from '../../../playground/mocks/data/idp/idx/authenticator-verification-custom-otp';
import xhrAuthenticatorCustomApp from '../../../playground/mocks/data/idp/idx/authenticator-verification-custom-app-push.json';
import xhrAuthenticatorTac from '../../../playground/mocks/data/idp/idx/authenticator-verification-tac.json';

const requestLogger = RequestLogger(
  /idx\/introspect|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mockChallengePassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredPassword);

const mockChallengeWithNickname = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithNickname)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredPassword);

const mockChallengeWithCustomLogo = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithCustomLogo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredPassword);

const mockAuthenticatorListNoNumber = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsNoNumber);

const mockAuthenticatorListWithEmail = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsWithEmail);

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

const mockSelectAuthenticatorForRecovery = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsRecovery);

const mockChallengeOVTotp = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVTotp);

const mockChallengeDuo = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorDuo);

const mockChallengeCustomOTP = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorCustomOTP);

const mockChallengeCustomApp = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorCustomApp);

const mockChallengeTac = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorTac);

const xhrSelectAuthenticatorsOktaVerifyKnownDevice = JSON.parse(JSON.stringify(xhrSelectAuthenticatorsOktaVerify));
xhrSelectAuthenticatorsOktaVerifyKnownDevice.authenticators.value[0].deviceKnown = true;
const mockSelectAuthenticatorKnownDevice = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerifyKnownDevice);

const mockSelectAuthenticatorNoSignedNonce = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerifyWithoutSignedNonce);

const mockChallengeOVPush = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVPush);

const mockChallengeOVFastPass = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVFastPass)
  .onRequestTo(/6512\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6512\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, OPTIONS'
  })
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(xhrAuthenticatorOVFastPass);

const mockChallengeOnPremMFA = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredOnPremMfa);

const mockChallengeRsa = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredRsa);

fixture('Select Authenticator for verification Form');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(selectFactorPageObject.formExists()).ok();
  return selectFactorPageObject;
}

test.requestHooks(mockChallengePassword)('should load select authenticator list', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(17);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(0)).eql('Select Password.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(0)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-password');
  await t.expect(await selectFactorPage.factorCustomLogoExist(0)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_password');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Security Key or Biometric Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(1)).eql('Select Security Key or Biometric Authenticator.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(1)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-webauthn');
  await t.expect(await selectFactorPage.factorCustomLogoExist(1)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('webauthn');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Email');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(2)).eql('Select Email.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(2)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-okta-email');
  await t.expect(await selectFactorPage.factorCustomLogoExist(2)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('okta_email');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Phone');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(3)).eql('Select Phone - +1 XXX-XXX-5309.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(3)).eql(true);
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('+1 XXX-XXX-5309');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(3)).contains('mfa-okta-phone');
  await t.expect(await selectFactorPage.factorCustomLogoExist(3)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3)).eql('phone_number');

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Phone');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(4)).eql('Select Phone - +1 XXX-XXX-5310.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(4)).eql(true);
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(4)).eql('+1 XXX-XXX-5310');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(4)).contains('mfa-okta-phone');
  await t.expect(await selectFactorPage.factorCustomLogoExist(4)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(4)).eql('phone_number');

  await t.expect(selectFactorPage.getFactorLabelByIndex(5)).eql('Security Question');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(5)).eql('Select Security Question.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(5)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(5)).contains('mfa-okta-security-question');
  await t.expect(await selectFactorPage.factorCustomLogoExist(5)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(5)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(5)).eql('security_question');

  await t.expect(selectFactorPage.getFactorLabelByIndex(6)).eql(userVariables.gen3 ? 'Okta Verify' : 'Use Okta FastPass');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(6)).eql('Select Okta Verify.');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(6)).eql(userVariables.gen3 ? 'Use Okta FastPass' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(6)).contains('mfa-okta-verify');
  await t.expect(await selectFactorPage.factorCustomLogoExist(6)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(6)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(6)).eql('okta_verify-signed_nonce');

  await t.expect(selectFactorPage.getFactorLabelByIndex(7)).eql('Google Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(7)).eql('Select Google Authenticator.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(7)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(7)).contains('mfa-google-auth');
  await t.expect(await selectFactorPage.factorCustomLogoExist(7)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(7)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(7)).eql('google_otp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(8)).eql('Atko Custom On-prem');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(8)).eql('Select Atko Custom On-prem.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(8)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(8)).contains('mfa-onprem');
  await t.expect(await selectFactorPage.factorCustomLogoExist(8)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(8)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(8)).eql('onprem_mfa');

  await t.expect(selectFactorPage.getFactorLabelByIndex(9)).eql('RSA SecurID');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(9)).eql('Select RSA SecurID.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(9)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(9)).contains('mfa-rsa');
  await t.expect(await selectFactorPage.factorCustomLogoExist(9)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(9)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(9)).eql('rsa_token');

  await t.expect(selectFactorPage.getFactorLabelByIndex(10)).eql('Duo Security');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(10)).eql('Select Duo Security.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(10)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(10)).contains('mfa-duo');
  await t.expect(await selectFactorPage.factorCustomLogoExist(10)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(10)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(10)).eql('duo');

  await t.expect(selectFactorPage.getFactorLabelByIndex(11)).eql('IDP Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(11)).eql('Select IDP Authenticator.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(11)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(11)).contains('mfa-custom-factor');
  await t.expect(await selectFactorPage.factorCustomLogoExist(11)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(11)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(11)).eql('external_idp');

  // Authenticator index(11) used in SelectAuthenticatorPageObject for CUSTOM_OTP_BUTTON_SELECTOR
  await t.expect(selectFactorPage.getFactorLabelByIndex(12)).eql('Atko Custom OTP Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(12)).eql('Select Atko Custom OTP Authenticator.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(12)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(12)).contains('mfa-hotp');
  await t.expect(await selectFactorPage.factorCustomLogoExist(12)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(12)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(12)).eql('custom_otp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(13)).eql('Symantec VIP');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(13)).eql('Select Symantec VIP.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(13)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(13)).contains('mfa-symantec');
  await t.expect(await selectFactorPage.factorCustomLogoExist(13)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(13)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(13)).eql('symantec_vip');

  await t.expect(selectFactorPage.getFactorLabelByIndex(14)).eql('YubiKey Authenticator');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(14)).eql('Select YubiKey Authenticator.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(14)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(14)).contains('mfa-yubikey');
  await t.expect(await selectFactorPage.factorCustomLogoExist(14)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(14)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(14)).eql('yubikey_token');

  await t.expect(selectFactorPage.getFactorLabelByIndex(15)).eql(userVariables.gen3 ? 'Custom Push App' : 'Get a push notification');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(15)).eql('Select Custom Push App.');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(15)).eql(userVariables.gen3 ? 'Get a push notification' : 'Custom Push App');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(15)).contains('mfa-custom-app-logo');
  await t.expect(await selectFactorPage.factorCustomLogoExist(15)).eql(true);
  await t.expect(selectFactorPage.getFactorIconBgImageByIndex(15)).match(/.*\/img\/logos\/default\.png/);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(15)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(15)).eql('custom_app');

  await t.expect(selectFactorPage.getFactorLabelByIndex(16)).eql('Temporary Access Code');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(16)).eql('Select Temporary Access Code.');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(16)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(16)).contains('mfa-tac');
  await t.expect(await selectFactorPage.factorCustomLogoExist(16)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(16)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(16)).eql('tac');
  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(mockChallengeWithNickname)('should load select authenticator list with nicknames if available', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(17);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(0)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-password');
  await t.expect(await selectFactorPage.factorCustomLogoExist(0)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_password');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Security Key or Biometric Authenticator');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(1)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-webauthn');
  await t.expect(await selectFactorPage.factorCustomLogoExist(1)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('webauthn');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Email');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(2)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-okta-email');
  await t.expect(await selectFactorPage.factorCustomLogoExist(2)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('okta_email');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(2)).eql('Select Email.');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Phone');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(3)).eql(true);
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('+1 XXX-XXX-5309');
  await t.expect(await selectFactorPage.factorNicknameExistsByIndex(3)).eql(true);
  await t.expect(selectFactorPage.getFactorNicknameByIndex(3)).eql('ph-nn');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(3)).contains('mfa-okta-phone');
  await t.expect(await selectFactorPage.factorCustomLogoExist(3)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3)).eql('phone_number');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(3)).eql(
    'Select Phone - +1 XXX-XXX-5309.'
  );
  if (userVariables.gen3) {
    await t.expect(await selectFactorPage.getFactorAriaDescriptionByIndex(3)).eql(
      '+1 XXX-XXX-5309. ph-nn.'
    );
  }

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Phone');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(4)).eql(true);
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(4)).eql('+1 XXX-XXX-5310');
  await t.expect(await selectFactorPage.factorNicknameDoesNotExistByIndex(4)).eql(true);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(4)).contains('mfa-okta-phone');
  await t.expect(await selectFactorPage.factorCustomLogoExist(4)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(4)).eql('phone_number');

  await t.expect(selectFactorPage.getFactorLabelByIndex(5)).eql('Security Question');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(5)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(5)).contains('mfa-okta-security-question');
  await t.expect(await selectFactorPage.factorCustomLogoExist(5)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(5)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(5)).eql('security_question');

  await t.expect(selectFactorPage.getFactorLabelByIndex(6)).eql(userVariables.gen3 ? 'Okta Verify' : 'Get a push notification');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(6)).eql(userVariables.gen3 ? 'Get a push notification' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(6)).contains('mfa-okta-verify');
  await t.expect(await selectFactorPage.factorCustomLogoExist(6)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(6)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(6)).eql('okta_verify-push');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(6)).eql(
    'Select to get a push notification to the Okta Verify app.'
  );

  await t.expect(selectFactorPage.getFactorLabelByIndex(7)).eql('Google Authenticator');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(7)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(7)).contains('mfa-google-auth');
  await t.expect(await selectFactorPage.factorCustomLogoExist(7)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(7)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(7)).eql('google_otp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(8)).eql('Atko Custom On-prem');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(8)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(8)).contains('mfa-onprem');
  await t.expect(await selectFactorPage.factorCustomLogoExist(8)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(8)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(8)).eql('onprem_mfa');

  await t.expect(selectFactorPage.getFactorLabelByIndex(9)).eql('RSA SecurID');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(9)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(9)).contains('mfa-rsa');
  await t.expect(await selectFactorPage.factorCustomLogoExist(9)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(9)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(9)).eql('rsa_token');

  await t.expect(selectFactorPage.getFactorLabelByIndex(10)).eql('Duo Security');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(10)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(10)).contains('mfa-duo');
  await t.expect(await selectFactorPage.factorCustomLogoExist(10)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(10)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(10)).eql('duo');

  await t.expect(selectFactorPage.getFactorLabelByIndex(11)).eql('IDP Authenticator');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(11)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(11)).contains('mfa-custom-factor');
  await t.expect(await selectFactorPage.factorCustomLogoExist(11)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(11)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(11)).eql('external_idp');

  // Authenticator index(11) used in SelectAuthenticatorPageObject for CUSTOM_OTP_BUTTON_SELECTOR
  await t.expect(selectFactorPage.getFactorLabelByIndex(12)).eql('Atko Custom OTP Authenticator');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(12)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(12)).contains('mfa-hotp');
  await t.expect(await selectFactorPage.factorCustomLogoExist(12)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(12)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(12)).eql('custom_otp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(13)).eql('Symantec VIP');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(13)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(13)).contains('mfa-symantec');
  await t.expect(await selectFactorPage.factorCustomLogoExist(13)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(13)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(13)).eql('symantec_vip');

  await t.expect(selectFactorPage.getFactorLabelByIndex(14)).eql('YubiKey Authenticator');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(14)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(14)).contains('mfa-yubikey');
  await t.expect(await selectFactorPage.factorCustomLogoExist(14)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(14)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(14)).eql('yubikey_token');

  await t.expect(selectFactorPage.getFactorLabelByIndex(15)).eql(userVariables.gen3 ? 'Custom Push App' : 'Get a push notification');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(15)).eql(userVariables.gen3 ? 'Get a push notification' : 'Custom Push App');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(15)).contains('mfa-custom-app-logo');
  await t.expect(await selectFactorPage.factorCustomLogoExist(15)).eql(true);
  await t.expect(selectFactorPage.getFactorIconBgImageByIndex(15)).match(/.*\/img\/logos\/default\.png/);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(15)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(15)).eql('custom_app');
  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(15)).eql(
    'Select Custom Push App.'
  );

  await t.expect(selectFactorPage.getFactorLabelByIndex(16)).eql(userVariables.gen3 ? 'Okta Verify' : 'Use Okta FastPass');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(16)).eql(userVariables.gen3 ? 'Use Okta FastPass' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(16)).contains('mfa-okta-verify');
  await t.expect(await selectFactorPage.factorCustomLogoExist(16)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(16)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(16)).eql('okta_verify-signed_nonce');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(mockChallengeWithCustomLogo)('should load select authenticator list with custom logos if available', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(16);

  await t.expect(selectFactorPage.getFactorLabelByIndex(11)).eql('IDP Authenticator');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(11)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(11)).contains('mfa-custom-factor');
  await t.expect(await selectFactorPage.factorCustomLogoExist(11)).eql(true);
  await t.expect(selectFactorPage.getFactorIconBgImageByIndex(11)).match(/.*\/img\/logos\/default\.png/);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(11)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(11)).eql('external_idp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(15)).eql(userVariables.gen3 ? 'Custom Push App' : 'Get a push notification');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(15)).eql(userVariables.gen3 ? 'Get a push notification' : 'Custom Push App');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(15)).contains('mfa-custom-app-logo');
  await t.expect(await selectFactorPage.factorCustomLogoExist(15)).eql(true);
  await t.expect(selectFactorPage.getFactorIconBgImageByIndex(15)).match(/.*\/img\/logos\/default\.png/);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(15)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(15)).eql('custom_app');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(mockChallengePassword)('should load select authenticator list with no sign-out link', async t => {
  const selectFactorPage = await setup(t, {
    features: { hideSignOutLinkInMFA: true },
  });
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  // signout link is not visible
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(false);
});

test.requestHooks(mockAuthenticatorListNoNumber)('should not display phone number in description if not available', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Phone');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(3)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Phone');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(4)).eql(false);
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Select');
});

test.requestHooks(mockAuthenticatorListWithEmail)('should display email in description if available', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Email');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(2)).eql(true);
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2)).eql('t***r@okta.com');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('okta_email');
});

test.requestHooks(mockSelectAuthenticatorForRecovery)('should load select authenticator list for recovery password', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Reset your password');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Verify with one of the following security methods to reset your password.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(2);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Email');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-okta-email');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(mockChallengePassword)('should navigate to password challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');

  selectFactorPage.selectFactorByIndex(0);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with your password');
});

test.requestHooks(requestLogger, mockChallengePassword)('select password challenge page and hit switch authenticator and re-select password', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');

  selectFactorPage.selectFactorByIndex(0);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with your password');
  await challengeFactorPage.clickVerifyWithSomethingElseLink();
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  // re-select password
  selectFactorPage.selectFactorByIndex(0);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with your password');

  await t.expect(requestLogger.count(() => true)).eql(3);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(req2.body).eql('{"authenticator":{"id":"aidwboITrg4b4yAYd0g3"},"stateHandle":"eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdnhhU2NRWG9TbzJvMjAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..40AFMvA7ix6FA2oE.Q6jiZeKfCdON5wqqMdiDQCtgLctrIrpnQzKEwub6L5KvFWcgVpdEFcoOvT1WIq9EUVOg2m_vFLV7b-PVSoCBKhKzl0IujmkjC5XyTwnDBMmJt-2-BMez0kIkABNI1BpffStyt8uJiUqGifVrZ6AqXr6zCpkGK5f7-Mu_rVF8NS2P580n2_2p9MO9haf-z56-i3DfkX-xM1a3_AQXUGr_RzDXWPXZf6mPUhYtouJz7Qdpt6n9agvqasuSz8JLehX9TIN9Y4k_M7JKxaYfdOv9Bnp7zSEtVQeG2ADzbIMKBRXA1bP_TZ7EKHInCu4gz8JR3febZLz8EZq-kaknBB_S3AvkjtzkrUyfUNo31xZhoTWO2kiMJlo_zLRqMKW8xqPNYKjtYo9rXR_v4_wA3hOCKFyKkqCD8U1Y6bbVwoicDHOZ4fNZOtcAVB8BJ8HzpAYzF8bCKHCD9CLgIU8eCezTo_Fo90Zm138Hu0rJc0LCNlG26RFv7DZ89fJbFqobS_y8bbB-MC0wsBBxf1kx1lEFUCqZFNottzXtRnpYKqvurBj_IsV9YtO9T35WZanr2gfbl98R2YpRGMF4pfp3d_6ltntY8-a8VK9cUlkjzBNXH46O-MzOTeuWQ7XgcEqK_MNENs4JMGTixBUQeQjPaDvJ_djCigciq1qyf2peAZBDlR5lozoJbNNQtxnXTYBresTm5RvEQ7qWo5IQlNDnK9Ir5pQdgM1NTPYiVDEt4TFZ4ZjLgycdLSSOv6HSw9bS85avNswJBXwlYBDHML5NpfGL-6m8uoPmtRqCG1HTFgLdSo1iGkcPtO8zcymNlUpevIEhX8QAf0GTK66723e0Qmz8lLDcsVCBVmyvFAENJ2gnR48p4Dt96nH7KRnrXOXUYa1LxJZr_ZeT7K-5WXw5a-dESuxvg18M993Kw6yDwSHsZ-6UeppWg3PPo7dKRE1aX9fisQP1uRCJzk1CtWxPu2GcFs9UZpszLuv1Y8r9DDH7FSgzlyULzOXVcNaLzkm5-RH7jxeRTiOOZxhOBIUuVgUUnkm6x4K23-TYxf4HgV_vWrQmIdEjaP5NuYRPfLkdM8qAWCkuz5r48yjl6T5XRg1wKG7OX0JZLjbmcJsTNagXSHbPsXuBd0te_fgNYT54_eGkIIklr4LbOEhKGNpZSXSWPbTPT7zhbebrUGglldI37k8WldRGywq_ZvZX6W5hucD_yWBqqXBq45LW_iNlAvtUIXBkq4WuPgWaYRIjqWnUxbAZkL_5ejddr18MOmbwV8ftbtYhvnYbYqBvDaqpsXoVKBT0g8ZTXuSs36Rrxi6wyBnXVcM0RrC8YhU6ybBWiovNo2chyPSPhFAvmJVmVL2t3lbA7SoBnWQvNtspHY8Xd8KNf-MUSuhHKXfrSRPwWC23D9qSxoUC0ubIINYBLD-WHYv_Yn7RBU7IQ4fzoLJrE6mUBz9tZ79drLOLd7vbe8MPpWJI-MHCTHD6XTMAWqd5q22EGAUa29XV4Jl4E6xZg8CybaOUOVpuia35UPLpCKK0wDofdAAUcPCo-hj7OH3U0XsCccF0GHfo7cqoYQanqfu7mypeGEf9_471KYQVNSlc1TGrrngY6_KRBMKDcx7fZne4ypsJfumhrpfbEkeltfwFsGVs1--2bFksLI8esRxR1qUHzT0.hCv29YrLBFcW8TjKwSmCXQ"}');

  const req3 = requestLogger.requests[2].request;
  await t.expect(req3.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req3.method).eql('post');
  await t.expect(req3.body).eql('{"authenticator":{"id":"aidwboITrg4b4yAYd0g3"},"stateHandle":"eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdnhhU2NRWG9TbzJvMjAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..40AFMvA7ix6FA2oE.Q6jiZeKfCdON5wqqMdiDQCtgLctrIrpnQzKEwub6L5KvFWcgVpdEFcoOvT1WIq9EUVOg2m_vFLV7b-PVSoCBKhKzl0IujmkjC5XyTwnDBMmJt-2-BMez0kIkABNI1BpffStyt8uJiUqGifVrZ6AqXr6zCpkGK5f7-Mu_rVF8NS2P580n2_2p9MO9haf-z56-i3DfkX-xM1a3_AQXUGr_RzDXWPXZf6mPUhYtouJz7Qdpt6n9agvqasuSz8JLehX9TIN9Y4k_M7JKxaYfdOv9Bnp7zSEtVQeG2ADzbIMKBRXA1bP_TZ7EKHInCu4gz8JR3febZLz8EZq-kaknBB_S3AvkjtzkrUyfUNo31xZhoTWO2kiMJlo_zLRqMKW8xqPNYKjtYo9rXR_v4_wA3hOCKFyKkqCD8U1Y6bbVwoicDHOZ4fNZOtcAVB8BJ8HzpAYzF8bCKHCD9CLgIU8eCezTo_Fo90Zm138Hu0rJc0LCNlG26RFv7DZ89fJbFqobS_y8bbB-MC0wsBBxf1kx1lEFUCqZFNottzXtRnpYKqvurBj_IsV9YtO9T35WZanr2gfbl98R2YpRGMF4pfp3d_6ltntY8-a8VK9cUlkjzBNXH46O-MzOTeuWQ7XgcEqK_MNENs4JMGTixBUQeQjPaDvJ_djCigciq1qyf2peAZBDlR5lozoJbNNQtxnXTYBresTm5RvEQ7qWo5IQlNDnK9Ir5pQdgM1NTPYiVDEt4TFZ4ZjLgycdLSSOv6HSw9bS85avNswJBXwlYBDHML5NpfGL-6m8uoPmtRqCG1HTFgLdSo1iGkcPtO8zcymNlUpevIEhX8QAf0GTK66723e0Qmz8lLDcsVCBVmyvFAENJ2gnR48p4Dt96nH7KRnrXOXUYa1LxJZr_ZeT7K-5WXw5a-dESuxvg18M993Kw6yDwSHsZ-6UeppWg3PPo7dKRE1aX9fisQP1uRCJzk1CtWxPu2GcFs9UZpszLuv1Y8r9DDH7FSgzlyULzOXVcNaLzkm5-RH7jxeRTiOOZxhOBIUuVgUUnkm6x4K23-TYxf4HgV_vWrQmIdEjaP5NuYRPfLkdM8qAWCkuz5r48yjl6T5XRg1wKG7OX0JZLjbmcJsTNagXSHbPsXuBd0te_fgNYT54_eGkIIklr4LbOEhKGNpZSXSWPbTPT7zhbebrUGglldI37k8WldRGywq_ZvZX6W5hucD_yWBqqXBq45LW_iNlAvtUIXBkq4WuPgWaYRIjqWnUxbAZkL_5ejddr18MOmbwV8ftbtYhvnYbYqBvDaqpsXoVKBT0g8ZTXuSs36Rrxi6wyBnXVcM0RrC8YhU6ybBWiovNo2chyPSPhFAvmJVmVL2t3lbA7SoBnWQvNtspHY8Xd8KNf-MUSuhHKXfrSRPwWC23D9qSxoUC0ubIINYBLD-WHYv_Yn7RBU7IQ4fzoLJrE6mUBz9tZ79drLOLd7vbe8MPpWJI-MHCTHD6XTMAWqd5q22EGAUa29XV4Jl4E6xZg8CybaOUOVpuia35UPLpCKK0wDofdAAUcPCo-hj7OH3U0XsCccF0GHfo7cqoYQanqfu7mypeGEf9_471KYQVNSlc1TGrrngY6_KRBMKDcx7fZne4ypsJfumhrpfbEkeltfwFsGVs1--2bFksLI8esRxR1qUHzT0.hCv29YrLBFcW8TjKwSmCXQ"}');

});

test.requestHooks(mockChallengeWebauthn)('should navigate to webauthn challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');

  selectFactorPage.selectFactorByIndex(1);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with Security Key or Biometric Authenticator');
});

test.requestHooks(mockChallengeEmail)('should navigate to email challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');

  selectFactorPage.selectFactorByIndex(2);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with your email');
});

test.requestHooks(mockChallengeOVTotp)(`should load signed_nonce at bottom when device is unknown and backend returns
  signed_nonce since there is an enrollmnent with the same os user is loging in from`, async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(4);

  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(0)).eql('Select to get a push notification to the Okta Verify app.');
  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql(userVariables.gen3 ? 'Okta Verify' : 'Get a push notification');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql(userVariables.gen3 ? 'Get a push notification' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_verify-push');

  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(1)).eql('Select to enter a code from the Okta Verify app.');
  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql(userVariables.gen3 ? 'Okta Verify' : 'Enter a code');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql(userVariables.gen3 ? 'Enter a code' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('okta_verify-totp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Password');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(2)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('okta_password');

  await t.expect(await selectFactorPage.getFactorButtonAriaLabelByIndex(3)).eql('Select Okta Verify.');
  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql(userVariables.gen3 ? 'Okta Verify' : 'Use Okta FastPass');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql(userVariables.gen3 ? 'Use Okta FastPass' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(3)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3)).eql('okta_verify-signed_nonce');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(mockSelectAuthenticatorKnownDevice)('should load signed_nonce at top when device is known', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(4);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql(userVariables.gen3 ? 'Okta Verify' : 'Use Okta FastPass');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql(userVariables.gen3 ? 'Use Okta FastPass' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_verify-signed_nonce');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql(userVariables.gen3 ? 'Okta Verify' : 'Get a push notification');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql(userVariables.gen3 ? 'Get a push notification' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('okta_verify-push');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql(userVariables.gen3 ? 'Okta Verify' : 'Enter a code');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(2)).eql(userVariables.gen3 ? 'Enter a code' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('okta_verify-totp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Password');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(3)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(3)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(3)).eql('okta_password');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(mockSelectAuthenticatorNoSignedNonce)('should not display signed_nonce when signed_nonce method is not in OV remediation', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(3);

  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(3);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql(userVariables.gen3 ? 'Okta Verify' : 'Get a push notification');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(0)).eql(userVariables.gen3 ? 'Get a push notification' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(0)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(0)).eql('okta_verify-push');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql(userVariables.gen3 ? 'Okta Verify' : 'Enter a code');
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(1)).eql(userVariables.gen3 ? 'Enter a code' : 'Okta Verify');
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(1)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(1)).eql('okta_verify-totp');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Password');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(2)).eql(false);
  await t.expect(selectFactorPage.getFactorIconSelectorByIndex(2)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');
  await t.expect(selectFactorPage.getFactorSelectButtonDataSeByIndex(2)).eql('okta_password');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).eql(true);
});

test.requestHooks(requestLogger, mockChallengeOVTotp)('should navigate to okta verify totp page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');

  selectFactorPage.selectFactorByIndex(1);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Enter a code');

  await t.expect(requestLogger.count(() => true)).eql(2);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'auteq0lLiL9o1cYoN0g4',
      'methodType': 'totp'
    },
    'stateHandle': '02im-3M2f6UXHgNfS7Ns7C85EKHzGaKw0u1CC4p9_r'
  });
});

test.requestHooks(requestLogger, mockChallengeOVPush)('should navigate to okta verify push page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');

  selectFactorPage.selectFactorByIndex(0);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  if(userVariables.gen3) {
    await t.expect(challengeFactorPage.getFormTitle()).eql('Push notification sent');
  } else {
    await t.expect(challengeFactorPage.getFormTitle()).eql('Get a push notification');
  }

  await t.expect(requestLogger.count(() => true)).eql(2);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'auteq0lLiL9o1cYoN0g4',
      'methodType': 'push'
    },
    'stateHandle': '02im-3M2f6UXHgNfS7Ns7C85EKHzGaKw0u1CC4p9_r'
  });
});

test.requestHooks(requestLogger, mockChallengeOVFastPass)('should navigate to okta verify fast pass page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');

  selectFactorPage.selectFactorByIndex(3);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verifying your identity');

  await t.expect(requestLogger.count((req) => req.request.url.startsWith('http://localhost:3000'))).eql(2);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'auteq0lLiL9o1cYoN0g4',
      'methodType': 'signed_nonce'
    },
    'stateHandle': '02im-3M2f6UXHgNfS7Ns7C85EKHzGaKw0u1CC4p9_r'
  });
});

test.requestHooks(mockChallengeOnPremMFA)('should navigate to on prem mfa challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');

  selectFactorPage.selectFactorByIndex(7);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with Atko Custom On-prem');
});

test.requestHooks(mockChallengeRsa)('should navigate to RSA challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');

  selectFactorPage.selectFactorByIndex(8);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with RSA SecurID');
});

test.requestHooks(mockChallengeDuo)('should navigate to Duo challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');

  selectFactorPage.selectFactorByIndex(8);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with Duo Security');
});

test.requestHooks(mockChallengeCustomOTP)('should navigate to Custom OTP challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');

  selectFactorPage.selectFactorByIndex(9);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with Atko Custom OTP Authenticator');
});

test.requestHooks(mockChallengeTac)('should navigate to TAC challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');

  selectFactorPage.selectFactorByIndex(16);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with Temporary Access Code');
  await t.expect(challengeFactorPage.getFormSubtitle()).eql('Enter the code provided by your administrator. Contact your administrator if you need a new code.');
});

test.requestHooks(mockChallengePassword)('should show custom factor page link', async t => {
  const pageObject = await setup(t, {
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });
  await checkA11y(t);

  await t.expect(pageObject.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(pageObject.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});

test.requestHooks(mockSelectAuthenticatorForRecovery)('should not show custom factor page link', async t => {
  const pageObject = await setup(t, {
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });
  await checkA11y(t);

  await t.expect(await pageObject.factorPageHelpLinksExists()).notOk();
});

test.requestHooks(mockChallengeCustomApp)('should navigate to Custom App challenge page', async t => {
  const selectFactorPage = await setup(t);
  await checkA11y(t);
  await t.expect(selectFactorPage.getIdentifier()).eql('testUser@okta.com');
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  selectFactorPage.selectFactorByIndex(9);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  if(userVariables.gen3) {
    await t.expect(challengeFactorPage.getFormTitle()).eql('Push notification sent');
  } else {
    await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with Custom Push');
  }
});
