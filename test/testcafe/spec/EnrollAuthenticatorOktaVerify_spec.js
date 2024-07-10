import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import EnrollOktaVerifyPageObject from '../framework/page-objects/EnrollOktaVerifyPageObject';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import SwitchOVEnrollChannelPageObject from '../framework/page-objects/SwitchOVEnrollChannelPageObject';
import EnrollOVViaEmailPageObject from '../framework/page-objects/EnrollOVViaEmailPageObject';
import EnrollOVViaSMSPageObject from '../framework/page-objects/EnrollOVViaSMSPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages, oktaDashboardContent, renderWidget as rerenderWidget } from '../framework/shared';
import xhrAuthenticatorEnrollOktaVerifyQr from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr.json';
import xhrAuthenticatorEnrollOktaVerifySameDevice from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-same-device.json';
import xhrAuthenticatorEnrollOktaVerifyIosSameDeviceAnySecurity from '@okta/mocks/data/idp/idx/authenticator-enroll-ov-same-device-ios-any-security.json';
import xhrAuthenticatorEnrollOktaVerifyAndroidSameDeviceHighSecurity from '@okta/mocks/data/idp/idx/authenticator-enroll-ov-same-device-android-high-security.json';
import xhrAuthenticatorEnrollOktaVerifyOsxSameDeviceAnySecurity from '@okta/mocks/data/idp/idx/authenticator-enroll-ov-same-device-osx-any-security.json';
import xhrAuthenticatorEnrollOktaVerifyWindowsSameDeviceHighSecurity from '@okta/mocks/data/idp/idx/authenticator-enroll-ov-same-device-windows-high-security.json';
import xhrAuthenticatorEnrollOktaVerifyDeviceBootstrap from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-device-bootstrap.json';
import xhrAuthenticatorEnrollOktaVerifyDeviceBootstrapMultipleDevices from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-device-bootstrap-multiple-devices.json';
import xhrAuthenticatorEnrollOktaVerifyViaEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-via-email.json';
import xhrAuthenticatorEnrollOktaVerifyEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email.json';
import xhrAuthenticatorEnrollOktaVerifyViaSMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-via-sms.json';
import xhrAuthenticatorEnrollOktaVerifySMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms.json';

import xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgrade from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email-version-upgrade.json';
import xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms-version-upgrade.json';
import xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgrade from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr-version-upgrade.json';

import xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgradeNonIos from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email-version-upgrade-non-ios.json';
import xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgradeNonIos from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms-version-upgrade-non-ios.json';
import xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgradeNonIos from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr-version-upgrade-non-ios.json';

import xhrAuthenticatorEnrollEnableBiometricsQr from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr-enable-biometrics.json';
import xhrAuthenticatorEnrollEnableBiometricsEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email-enable-biometrics.json';
import xhrAuthenticatorEnrollEnableBiometricsSMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms-enable-biometrics.json';

import xhrSuccess from '../../../playground/mocks/data/idp/idx/success.json';

const logger = RequestLogger(/introspect|poll|send|enroll/, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const mock = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail);
const mock1 = mock(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);

const enrollViaQRcodeMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaQRcodeMocks1 = enrollViaQRcodeMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaQRcodeMocks2 = enrollViaQRcodeMocks(xhrSuccess);

// this mock doesn't need poll to return successful response
const enrollSameDeviceMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifySameDevice);
if (userVariables.gen3) {
  enrollSameDeviceMocks
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond(xhrAuthenticatorEnrollOktaVerifySameDevice);
}

const enrollSameDeviceIosWithAnySecurity = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyIosSameDeviceAnySecurity);
if (userVariables.gen3) {
  enrollSameDeviceIosWithAnySecurity
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond(xhrAuthenticatorEnrollOktaVerifyIosSameDeviceAnySecurity);
}

const enrollSameDeviceOsxWithAnySecurity = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyOsxSameDeviceAnySecurity);
if (userVariables.gen3) {
  enrollSameDeviceOsxWithAnySecurity
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond(xhrAuthenticatorEnrollOktaVerifyOsxSameDeviceAnySecurity);
}

const enrollSameDeviceAndroidWithHighSecurity = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyAndroidSameDeviceHighSecurity);
if (userVariables.gen3) {
  enrollSameDeviceAndroidWithHighSecurity
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond(xhrAuthenticatorEnrollOktaVerifyAndroidSameDeviceHighSecurity);
}

const enrollSameDeviceWindowsWithHighSecurity = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyWindowsSameDeviceHighSecurity);
if (userVariables.gen3) {
  enrollSameDeviceWindowsWithHighSecurity
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond(xhrAuthenticatorEnrollOktaVerifyWindowsSameDeviceHighSecurity);
}

// this mock doesn't need poll to return successful response
const enrollDeviceBootstrapMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyDeviceBootstrap);
if (userVariables.gen3) {
  enrollDeviceBootstrapMocks
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond(xhrAuthenticatorEnrollOktaVerifyDeviceBootstrap);
}

const enrollDeviceBootstrapMocksMultipleDevices = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyDeviceBootstrapMultipleDevices);
if (userVariables.gen3) {
  enrollDeviceBootstrapMocksMultipleDevices
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond(xhrAuthenticatorEnrollOktaVerifyDeviceBootstrapMultipleDevices);
}

const enrollViaEmailMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaEmailMocks1 = enrollViaEmailMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaEmailMocks2 = enrollViaEmailMocks(xhrSuccess);

const resendEmailMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail);

const enrollViaSmsMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaSmsMocks1 = enrollViaSmsMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaSmsMocks2 = enrollViaSmsMocks(xhrSuccess);

const resendSmsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS);

const enrollViaSmsVersionUpgradeMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaSmsVersionUpgradeMocks1 = enrollViaSmsVersionUpgradeMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaSmsVersionUpgradeMocks2 = enrollViaSmsVersionUpgradeMocks(xhrSuccess);

const enrollViaSmsVersionUpgradeMocksGoBack = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaSmsVersionUpgradeMocksGoBack1 = enrollViaSmsVersionUpgradeMocksGoBack(!userVariables.gen3 ? xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaSmsVersionUpgradeMocksGoBack2 = enrollViaSmsVersionUpgradeMocksGoBack(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade);

const enrollViaSmsVersionUpgradeMocksNonIos = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaSmsVersionUpgradeMocksNonIos1 = enrollViaSmsVersionUpgradeMocksNonIos(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaSmsVersionUpgradeMocksNonIos2 = enrollViaSmsVersionUpgradeMocksNonIos(xhrSuccess);

const enrollViaEmailVersionUpgradeMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaEmailVersionUpgradeMocks1 = enrollViaEmailVersionUpgradeMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaEmailVersionUpgradeMocks2 = enrollViaEmailVersionUpgradeMocks(xhrSuccess);

const enrollViaEmailVersionUpgradeMocksNonIos = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaEmailVersionUpgradeMocksNonIos1 = enrollViaEmailVersionUpgradeMocksNonIos(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaEmailVersionUpgradeMocksNonIos2 = enrollViaEmailVersionUpgradeMocksNonIos(xhrSuccess);

const enrollViaQRcodeVersionUpgradeMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaQRcodeVersionUpgradeMocks1 = enrollViaQRcodeVersionUpgradeMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgrade);
const enrollViaQRcodeVersionUpgradeMocks2 = enrollViaQRcodeVersionUpgradeMocks(xhrSuccess);

const enrollViaQRcodeVersionUpgradeMocksNonIos = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaQRcodeVersionUpgradeMocksNonIos1 = enrollViaQRcodeVersionUpgradeMocksNonIos(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgradeNonIos);
const enrollViaQRcodeVersionUpgradeMocksNonIos2 = enrollViaQRcodeVersionUpgradeMocksNonIos(xhrSuccess);

const enrollViaQRcodeEnableBiometricsMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollEnableBiometricsQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaQRcodeEnableBiometricsMocks1 = enrollViaQRcodeEnableBiometricsMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollEnableBiometricsQr);
const enrollViaQRcodeEnableBiometricsMocks2 = enrollViaQRcodeEnableBiometricsMocks(xhrSuccess);

const enrollViaEmailEnableBiometricsMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollEnableBiometricsEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaEmailEnableBiometricsMocks1 = enrollViaEmailEnableBiometricsMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaEmailEnableBiometricsMocks2 = enrollViaEmailEnableBiometricsMocks(xhrSuccess);

const enrollViaSMSEnableBiometricsMocks = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollEnableBiometricsSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);
const enrollViaSMSEnableBiometricsMocks1 = enrollViaSMSEnableBiometricsMocks(!userVariables.gen3 ? xhrSuccess : xhrAuthenticatorEnrollOktaVerifyQr);
const enrollViaSMSEnableBiometricsMocks2 = enrollViaSMSEnableBiometricsMocks(xhrSuccess);

const smsInstruction1 = 'We sent an SMS to +18008885555 with an Okta Verify setup link. To continue, open the link on your mobile device.';
const smsInstruction2 = 'Or try a different way to set up Okta Verify.';
const emailInstruction1 = 'We sent an email to joy@okta.com with an Okta Verify setup link. To continue, open the link on your mobile device.';
const emailInstruction2 = 'Or try a different way to set up Okta Verify.';
const qrCodeInstruction1 = 'On your mobile device, download the Okta Verify app from the App Store (iPhone and iPad) or Google Play (Android devices).';
const qrCodeInstruction2 = 'Open the app and follow the instructions to add your account';
const qrCodeInstruction3 = 'When prompted, tap Scan a QR code, then scan the QR code below:';
const sameDeviceSubtitle = 'To continue, you\'ll need an Okta Verify account on this device.';
const sameDeviceInstruction1 = 'If you don’t have Okta Verify installed, download the app.';
const sameDeviceInstruction2 = 'Open Okta Verify and follow the steps to add your account.';
const sameDeviceInstruction3 = 'When prompted, choose Sign In, then enter the sign-in URL:';
const sameDeviceOVEnrollmentTitle = 'Set up Okta Verify';
const sameDeviceOVEnrollmentSubtitle = 'To continue, make sure you have the Okta Verify app.';
const sameDeviceOVEnrollmentInstructions1 = 'Once Okta Verify is installed, return to this page and tap Set up Okta Verify.';
const sameDeviceOVEnrollmentInstructions3 = 'set up Okta Verify on another mobile device';
const sameDeviceOVEnrollmentDesktopInstructions1 = 'Click "Open Okta Verify" on the browser prompt to set up Okta Verify.';
const sameDeviceOVEnrollmentDesktopInstructions2 = 'Didn\'t see the prompt?';
const sameDeviceOVEnrollmentDesktopInstructions3 = 'Make sure you have Okta Verify installed.';
const sameDeviceOVEnrollmentAppleLink = 'https://apps.apple.com/us/app/okta-verify/id490179405';
const sameDeviceOVEnrollmentAndroidLink = 'https://play.google.com/store/apps/details?id=com.okta.android.auth';
const sameDeviceOVEnrollmentWindowsLink = 'https://microsoft.com/app/ov';
const sameDeviceOVEnrollmentSetupLink = 'https://login.okta.com/actions/enroll?display_url=okta.okta.com&login_hint=testUser@okta.com&pipeline=idx&app_name=office%20365';
const sameDeviceOVEnrollmentDesktopSetupLink = 'com-okta-authenticator://actions/enroll?display_url=okta.okta.com&login_hint=testUser@okta.com&pipeline=idx';
const deviceBootstrapSubtitle = 'To set up Okta Verify on additional devices, you can copy an existing Okta Verify account onto a new device.';
const deviceBootstrapInstruction1 = 'Open Okta Verify on any of your other Okta Verify devices (Such as your testDevice1).';
const deviceBootstrapInstruction2 = 'In the app, select your account.';
const deviceBootstrapInstruction3 = 'Choose Add Account to Another Device.';
const deviceBootstrapInstruction4 = 'Follow the rest of the instructions shown in Okta Verify.';
const deviceBootstrapClosing = 'This screen can be closed at any time.';

const fipsUpgradeMessage = 'The device used to set up Okta Verify does not meet your organization’s security requirements because it is not FIPS compliant. Contact your administrator for help.';
const fipsUpgradeMessageNonIos = 'The Okta Verify version on the device used does not meet your organization’s security requirements. To add your account, update Okta Verify to the latest version, then try again.';
const fipsUpgradeTitle = 'Update Okta Verify';

const enableBiometricsMessage = 'Your organization requires biometrics. To proceed, ensure your device supports biometrics, then add your account and enable biometrics when prompted.';
const enableBiometricsMessageTitle = 'Enable biometrics to add an account in Okta Verify';

const urlCopiedToClipboardMessage = 'Copy sign-in URL to clipboard';
const oktaVerifyAppStoreDownloadUrl = 'https://apps.apple.com/us/app/okta-verify/id490179405';

fixture('Enroll Okta Verify Authenticator');

async function setup(t) {
  const enrollOktaVerifyPage = new EnrollOktaVerifyPageObject(t);
  await enrollOktaVerifyPage.navigateToPage();
  await t.expect(enrollOktaVerifyPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: null,
    formName: 'enroll-poll',
    authenticatorKey: 'okta_verify',
  });

  return enrollOktaVerifyPage;
}

test.requestHooks(logger, enrollViaQRcodeMocks1)('should be able to enroll via qrcode', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollOktaVerifyPage.getFormTitle()).eql('Set up Okta Verify');
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasQRcode()).eql(true);
  const qrInstructionBullet1 = await enrollOktaVerifyPage.getQRInstruction(0);
  const qrInstructionBullet2 = await enrollOktaVerifyPage.getQRInstruction(1);
  const qrInstructionBullet3 = await enrollOktaVerifyPage.getQRInstruction(2);
  await t.expect(qrInstructionBullet1).contains(qrCodeInstruction1);
  await t.expect(qrInstructionBullet2).contains(qrCodeInstruction2);
  await t.expect(qrInstructionBullet3).contains(qrCodeInstruction3);

  // Verify links
  await t.expect(await enrollOktaVerifyPage.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(await enrollOktaVerifyPage.signoutLinkExists()).ok();

  if (userVariables.gen3) {
    await t.removeRequestHooks(enrollViaQRcodeMocks1);
    await t.addRequestHooks(enrollViaQRcodeMocks2);
  }
  await t.wait(4000);
  // V3 - higher poll requests ~ 7
  if (!userVariables.gen3) {
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(1);
  }

  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mock1)('should render switch channel view when Can\'t scan is clicked in qr code flow', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollOktaVerifyPage.getSwitchChannelText()).eql('Can\'t scan?');
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.getOptionLabel(0))
    .eql('Text me a setup link');
  await t.expect(switchChannelPageObject.getOptionLabel(1))
    .eql('Email me a setup link');
  await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);

  // Verify links
  await t.expect(await switchChannelPageObject.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(await switchChannelPageObject.signoutLinkExists()).ok();
});

test.requestHooks(resendEmailMocks)('should render switch channel view when "try different way" is clicked when in email flow', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollOktaVerifyPage.getTryDifferentWayText()).eql('try a different way');
  await enrollOktaVerifyPage.clickTryDifferentWay();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.getOptionLabel(0))
    .eql('Scan a QR code');
  await t.expect(switchChannelPageObject.getOptionLabel(1))
    .eql('Text me a setup link');
  await t.expect(switchChannelPageObject.isRadioButtonChecked('qrcode')).eql(true);

  // Verify links
  await t.expect(await switchChannelPageObject.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(await switchChannelPageObject.signoutLinkExists()).ok();
});

test.requestHooks(resendSmsMocks)('should render switch channel view when "try different way" is clicked when in sms flow', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await enrollOktaVerifyPage.clickTryDifferentWay();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.getOptionLabel(0))
    .eql('Scan a QR code');
  await t.expect(switchChannelPageObject.getOptionLabel(1))
    .eql('Email me a setup link');
  await t.expect(switchChannelPageObject.isRadioButtonChecked('qrcode')).eql(true);
});

test.requestHooks(enrollViaEmailMocks1)('should be able enroll via email', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaEmailPageObject = new EnrollOVViaEmailPageObject(t);
  await t.expect(enrollViaEmailPageObject.getFormTitle()).eql('Set up Okta Verify via email link');
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.hasCountryField()).notOk();
  await t.expect(enrollViaEmailPageObject.hasSwitchChannelText).ok();
  await enrollViaEmailPageObject.fillEmailField('test@gmail.com');
  await enrollViaEmailPageObject.clickSendSetupLink();
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction1);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction2);

  if (userVariables.gen3) {
    await t.removeRequestHooks(enrollViaEmailMocks1);
    await t.addRequestHooks(enrollViaEmailMocks2);
  }
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(resendEmailMocks)('after timeout should be able see and click send again link when enrolling via email', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction1);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction2);
  await t.expect(enrollOktaVerifyPage.resendViewExists()).notOk();
  await t.wait(30000);
  await t.expect(enrollOktaVerifyPage.resendViewExists()).ok();
  const resendView = enrollOktaVerifyPage.resendView();
  await t.expect(resendView.innerText).contains('Haven’t received an email? Check your spam folder or send again');
  await enrollOktaVerifyPage.clickSendAgainLink();
  await t.expect(enrollOktaVerifyPage.resendViewExists()).notOk();
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction1);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction2);
});

test.requestHooks(logger, enrollViaSmsMocks1)('should be able enroll via sms', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
  await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).match(/\+1/);
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickSendSetupLink();
  // logger.count ~ 10 in v3, and not consistent
  if (!userVariables.gen3) {
    await t.expect(logger.count(() => true)).eql(3);
    const { request: { body: answerRequestBodyString }} = logger.requests[2];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
  }
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction1);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction2);

  if (userVariables.gen3) {
    await t.removeRequestHooks(enrollViaSmsMocks1);
    await t.addRequestHooks(enrollViaSmsMocks2);
  }
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(logger, enrollViaSmsMocks1)('respects settings.defaultCountryCode', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);

  // drive to SMS page (click next)
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);

  // Default country code US (+1)
  const defaultCountryCodeText = await enrollViaSMSPageObject.getCountryLabel();
  await t.expect(defaultCountryCodeText).match(/\+1/);

  await rerenderWidget({
    defaultCountryCode: 'GB'  // United Kingdom
  });
  // drive to SMS page (click next) - required again after rerender
  await enrollOktaVerifyPage.clickSwitchChannel();
  await switchChannelPageObject.clickNextButton();

  // United Kingdom (+44)
  const gbCountryCodeText = await enrollViaSMSPageObject.getCountryLabel();
  await t.expect(gbCountryCodeText).match(/\+44/);
});

test.requestHooks(resendSmsMocks)('after timeout should be able see and click send again link when enrolling via sms', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction1);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction2);
  await t.expect(enrollOktaVerifyPage.resendView().visible).notOk();
  await t.wait(30000);
  await t.expect(enrollOktaVerifyPage.resendViewExists()).ok();
  const resendView = enrollOktaVerifyPage.resendView();
  await t.expect(resendView.innerText).contains('Haven’t received an SMS? Send again');
  await enrollOktaVerifyPage.clickSendSMSAgainLink();
  await t.expect(enrollOktaVerifyPage.resendViewExists()).notOk();
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction1);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction2);
});

const testSmsMsg = async (t, isIos) => {
  const message = isIos ? fipsUpgradeMessage: fipsUpgradeMessageNonIos;
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
  await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).match(/\+1/);
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickSendSetupLink();

  // logger.count ~ 10 in v3, and not consistent
  if (!userVariables.gen3) {
    await t.expect(logger.count(() => true)).eql(3);
    const { request: { body: answerRequestBodyString }} = logger.requests[2];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
  }
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction1);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction2);

  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(message);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);

  if (isIos && userVariables.gen3) {
    await t.removeRequestHooks(enrollViaSmsVersionUpgradeMocks1);
    await t.addRequestHooks(enrollViaSmsVersionUpgradeMocks2);
  }
  if (!isIos && userVariables.gen3) {
    await t.removeRequestHooks(enrollViaSmsVersionUpgradeMocksNonIos1);
    await t.addRequestHooks(enrollViaSmsVersionUpgradeMocksNonIos2);
  }
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
};

test
  .requestHooks(logger, enrollViaSmsVersionUpgradeMocks1)('should see ov upgrade error message during enroll via sms', async t => {
    await testSmsMsg(t, true);
  });

test
  .requestHooks(logger, enrollViaSmsVersionUpgradeMocksNonIos1)('should see ov upgrade error message during enroll via sms for non ios devices', async t => {
    await testSmsMsg(t, false);
  });

const testEmailMsg = async (t, isIos) => {
  const message = isIos ? fipsUpgradeMessage: fipsUpgradeMessageNonIos;
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaEmailPageObject = new EnrollOVViaEmailPageObject(t);
  await t.expect(enrollViaEmailPageObject.getFormTitle()).eql('Set up Okta Verify via email link');
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.hasCountryField()).notOk();
  await t.expect(enrollViaEmailPageObject.hasSwitchChannelText).ok();
  await enrollViaEmailPageObject.fillEmailField('test@gmail.com');
  await enrollViaEmailPageObject.clickSendSetupLink();
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction1);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction2);

  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(message);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);
  if (isIos && userVariables.gen3) {
    await t.removeRequestHooks(enrollViaEmailVersionUpgradeMocks1);
    await t.addRequestHooks(enrollViaEmailVersionUpgradeMocks2);
  }
  if (!isIos && userVariables.gen3) {
    await t.removeRequestHooks(enrollViaEmailVersionUpgradeMocksNonIos1);
    await t.addRequestHooks(enrollViaEmailVersionUpgradeMocksNonIos2);
  }
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
};

test.requestHooks(enrollViaEmailVersionUpgradeMocks1)('should see ov upgrade error message during enroll via email', async t => {
  await testEmailMsg(t, true);
});

test
  .requestHooks(enrollViaEmailVersionUpgradeMocksNonIos1)('should see ov upgrade error message during enroll via email for non ios devices', async t => {
    await testEmailMsg(t, false);
  });

const testQRcodeMsg = async (t, isIos) => {
  const message = isIos ? fipsUpgradeMessage: fipsUpgradeMessageNonIos;
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollOktaVerifyPage.getFormTitle(1)).eql('Set up Okta Verify');
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasQRcode()).eql(true);
  await t.expect(await enrollOktaVerifyPage.getAlt()).eql('QR code. If you can\'t scan, click on the link below to ' +
    'select an alternative activation method');
  const qrInstructionBullet1 = await enrollOktaVerifyPage.getQRInstruction(0);
  const qrInstructionBullet2 = await enrollOktaVerifyPage.getQRInstruction(1);
  const qrInstructionBullet3 = await enrollOktaVerifyPage.getQRInstruction(2);
  await t.expect(qrInstructionBullet1).contains(qrCodeInstruction1);
  await t.expect(qrInstructionBullet2).contains(qrCodeInstruction2);
  await t.expect(qrInstructionBullet3).contains(qrCodeInstruction3);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(message);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);

  // v3 - logger.count = 0
  if (!userVariables.gen3) {
    await t.wait(4000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(1);
  }

  if (isIos && userVariables.gen3) {
    await t.removeRequestHooks(enrollViaQRcodeVersionUpgradeMocks1);
    await t.addRequestHooks(enrollViaQRcodeVersionUpgradeMocks2);
  }
  if (!isIos && userVariables.gen3) {
    await t.removeRequestHooks(enrollViaQRcodeVersionUpgradeMocksNonIos1);
    await t.addRequestHooks(enrollViaQRcodeVersionUpgradeMocksNonIos2);
  }
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
};

test.requestHooks(logger, enrollViaQRcodeVersionUpgradeMocks1)('should see ov upgrade error message during enroll via qrcode', async t => {
  await testQRcodeMsg(t, true);
});

test.requestHooks(logger, enrollViaQRcodeVersionUpgradeMocksNonIos1)('should see ov upgrade error message during enroll via qrcode for non ios devices', async t => {
  await testQRcodeMsg(t, false);
});

test.requestHooks(logger, enrollViaSmsVersionUpgradeMocksGoBack1)('should not show version upgrade message after user hits go back', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
  await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).match(/\+1/);
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickSendSetupLink();
  // logger.count ~ 10 in v3, and not consistent
  if (!userVariables.gen3) {
    await t.expect(logger.count(() => true)).eql(3);
    const { request: { body: answerRequestBodyString }} = logger.requests[2];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
  }

  if (userVariables.gen3) {
    await t.removeRequestHooks(enrollViaSmsVersionUpgradeMocksGoBack1);
    await t.addRequestHooks(enrollViaSmsVersionUpgradeMocksGoBack2);
  }

  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction1);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction2);

  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(fipsUpgradeMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);
  // hit go back
  await enrollOktaVerifyPage.switchAuthenticator();
  await t.expect(errorBox.exists).notOk;
});

test.requestHooks(logger, enrollViaQRcodeEnableBiometricsMocks1)('should see ov enable biometrics message during enroll via QR code', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollOktaVerifyPage.getFormTitle(1)).eql('Set up Okta Verify');
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasQRcode()).eql(true);
  const qrInstructionBullet1 = await enrollOktaVerifyPage.getQRInstruction(0);
  const qrInstructionBullet2 = await enrollOktaVerifyPage.getQRInstruction(1);
  const qrInstructionBullet3 = await enrollOktaVerifyPage.getQRInstruction(2);
  await t.expect(qrInstructionBullet1).contains(qrCodeInstruction1);
  await t.expect(qrInstructionBullet2).contains(qrCodeInstruction2);
  await t.expect(qrInstructionBullet3).contains(qrCodeInstruction3);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(enableBiometricsMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(enableBiometricsMessageTitle);
  if (!userVariables.gen3) {
    await t.wait(4000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(1);
  }

  if (userVariables.gen3) {
    await t.removeRequestHooks(enrollViaQRcodeEnableBiometricsMocks1);
    await t.addRequestHooks(enrollViaQRcodeEnableBiometricsMocks2);
  }
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(enrollViaEmailEnableBiometricsMocks1)('should see ov enable biometrics message during enroll via email', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaEmailPageObject = new EnrollOVViaEmailPageObject(t);
  await t.expect(enrollViaEmailPageObject.getFormTitle()).eql('Set up Okta Verify via email link');
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.hasCountryField()).notOk();
  await t.expect(enrollViaEmailPageObject.hasSwitchChannelText).ok();
  await enrollViaEmailPageObject.fillEmailField('test@gmail.com');
  await enrollViaEmailPageObject.clickSendSetupLink();
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction1);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction2);

  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(enableBiometricsMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(enableBiometricsMessageTitle);
  if (userVariables.gen3) {
    await t.removeRequestHooks(enrollViaEmailEnableBiometricsMocks1);
    await t.addRequestHooks(enrollViaEmailEnableBiometricsMocks2);
  }
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test
  .requestHooks(logger, enrollViaSMSEnableBiometricsMocks1)('should see ov enable biometrics message during enroll via sms', async t => {
    const enrollOktaVerifyPage = await setup(t);
    await checkA11y(t);
    await enrollOktaVerifyPage.clickSwitchChannel();
    const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
    await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
    await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
    await t.expect(switchChannelPageObject.isRadioButtonChecked('sms')).eql(true);
    await switchChannelPageObject.clickNextButton();
    const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
    await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
    await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
    await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
    await t.expect(enrollViaSMSPageObject.getCountryLabel()).match(/\+1/);
    await enrollViaSMSPageObject.fillPhoneField('8887227871');
    await enrollViaSMSPageObject.clickSendSetupLink();

    // logger.count ~ 10 in v3, and not consistent
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(3);
      const { request: { body: answerRequestBodyString }} = logger.requests[2];
      const answerRequestBody = JSON.parse(answerRequestBodyString);
      await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
    }

    await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
    await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
    await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
    await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction1);
    await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction2);

    const errorBox = enrollOktaVerifyPage.getErrorBox();
    await t.expect(errorBox.innerText).contains(enableBiometricsMessage);

    const errorTitle = enrollOktaVerifyPage.getErrorTitle();
    await t.expect(errorTitle.innerText).contains(enableBiometricsMessageTitle);

    if (userVariables.gen3) {
      await t.removeRequestHooks(enrollViaSMSEnableBiometricsMocks1);
      await t.addRequestHooks(enrollViaSMSEnableBiometricsMocks2);
    }
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, enrollSameDeviceMocks)('should be able to see OV same device enrollment instructions without polling', async t => {
    const enrollOktaVerifyPage = await setup(t);
    await checkA11y(t);
    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql('Set up Okta Verify');
    await t.expect(enrollOktaVerifyPage.getSubHeader()).eql(sameDeviceSubtitle);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(0)).eql(sameDeviceInstruction1);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(1)).eql(sameDeviceInstruction2);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(2)).contains(sameDeviceInstruction3);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(2)).contains('okta.okta.com');
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(3)).eql(deviceBootstrapInstruction4);

    await t.expect(enrollOktaVerifyPage.getDownloadAppHref()).eql(oktaVerifyAppStoreDownloadUrl);
    await t.expect(enrollOktaVerifyPage.getCopyOrgLinkButtonLabel()).eql(urlCopiedToClipboardMessage);
    if (!userVariables.gen3) {
      await t.expect(enrollOktaVerifyPage.getCopiedOrgLinkValue()).eql('okta.okta.com');
    }

    await t.expect(enrollOktaVerifyPage.getTryDifferentWayText().exists).notOk();
    await t.expect(await enrollOktaVerifyPage.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await enrollOktaVerifyPage.signoutLinkExists()).ok();

    // expect no polling for same device page
    if (!userVariables.gen3) {
      await t.expect(logger.count(
        record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
      )).eql(0);
    }
    await enrollOktaVerifyPage.clickReturnToAuthenticatorListLink();
    const selectFactorPageObject = new SelectFactorPageObject(t);

    await t.expect(selectFactorPageObject.getFormTitle()).eql('Set up security methods');
    await t.expect(selectFactorPageObject.getFormSubtitle()).eql(
      'Security methods help protect your account by ensuring only you have access.');
    await t.expect(await selectFactorPageObject.getCancelLink().exists).ok();

  });

test
  .requestHooks(logger, enrollDeviceBootstrapMocks)('should be able to see OV device bootstrap enrollment instructions without polling with one device', async t => {
    const enrollOktaVerifyPage = await setup(t);
    await checkA11y(t);
    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql('Set up Okta Verify');
    await t.expect(enrollOktaVerifyPage.getSubHeader()).eql(deviceBootstrapSubtitle);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(0)).eql(deviceBootstrapInstruction1);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(1)).eql(deviceBootstrapInstruction2);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(2)).eql(deviceBootstrapInstruction3);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(3)).eql(deviceBootstrapInstruction4);
    await t.expect(await enrollOktaVerifyPage.getClosingText()).eql(deviceBootstrapClosing);

    await t.expect(enrollOktaVerifyPage.getTryDifferentWayText().exists).notOk();
    await t.expect(await enrollOktaVerifyPage.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await enrollOktaVerifyPage.signoutLinkExists()).ok();

    // expect no polling for device bootstrap page
    if (!userVariables.gen3) {
      await t.expect(logger.count(
        record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
      )).eql(0);
    }
  });

test
  .requestHooks(logger, enrollDeviceBootstrapMocksMultipleDevices)('should be able to see OV device bootstrap enrollment instructions without polling with multiple devices', async t => {
    const enrollOktaVerifyPage = await setup(t);
    await checkA11y(t);
    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql('Set up Okta Verify');
    await t.expect(enrollOktaVerifyPage.getSubHeader()).eql(deviceBootstrapSubtitle);
    const instruction1 = await enrollOktaVerifyPage.getNthInstructionBulletPoint(0);
    await t.expect(instruction1).eql(deviceBootstrapInstruction1);
    await t.expect(instruction1).notContains('device2');
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(1)).eql(deviceBootstrapInstruction2);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(2)).eql(deviceBootstrapInstruction3);
    await t.expect(await enrollOktaVerifyPage.getNthInstructionBulletPoint(3)).eql(deviceBootstrapInstruction4);
    await t.expect(await enrollOktaVerifyPage.getClosingText()).eql(deviceBootstrapClosing);

    await t.expect(enrollOktaVerifyPage.getTryDifferentWayText().exists).notOk();
    await t.expect(await enrollOktaVerifyPage.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await enrollOktaVerifyPage.signoutLinkExists()).ok();

    // expect no polling for device bootstrap page
    if (!userVariables.gen3) {
      await t.expect(logger.count(
        record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
      )).eql(0);
    }
  });

test
  .requestHooks(logger, enrollSameDeviceIosWithAnySecurity)('should be able to see OV same device enrollment instructions on ANY security level and go back (iOS)', async t => {
    const enrollOktaVerifyPage = await setup(t);

    await checkA11y(t);

    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);
    await t.expect(enrollOktaVerifyPage.getSubHeader()).eql(sameDeviceOVEnrollmentSubtitle);

    await t.expect(enrollOktaVerifyPage.getAppStoreHref()).eql(sameDeviceOVEnrollmentAppleLink);
    await t.expect(await enrollOktaVerifyPage.hasOVSetupButton()).eql(true);

    if (!userVariables.gen3) {
      await t.expect(enrollOktaVerifyPage.getOVSetupHref()).eql(sameDeviceOVEnrollmentSetupLink);
    }

    await t.expect(await enrollOktaVerifyPage.getSameDeviceReturnAndSetupText()).eql(sameDeviceOVEnrollmentInstructions1);
    await t.expect(await enrollOktaVerifyPage.getSameDeviceSetupOnMobileText()).contains(sameDeviceOVEnrollmentInstructions3);

    await t.expect(await enrollOktaVerifyPage.orAnotherMobileDeviceLinkExists()).eql(true);

    // re-render widget with sameDeviceOVEnrollmentEnabled FF on
    await rerenderWidget({
      features: { sameDeviceOVEnrollmentEnabled: true }
    });
    await checkA11y(t);
    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);
    const downloadInstruction = await enrollOktaVerifyPage.getSameDeviceDownloadText();
    await t.expect(downloadInstruction).contains('Don’t have Okta Verify?');
    await t.expect(downloadInstruction).contains('Download here');
    await t.expect(await enrollOktaVerifyPage.appStoreElementExists()).eql(false);
  });

test
  .requestHooks(logger, enrollSameDeviceAndroidWithHighSecurity)('should be able to see OV same device enrollment instructions on HIGH security level (Android)', async t => {
    const enrollOktaVerifyPage = await setup(t);

    await checkA11y(t);

    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);
    await t.expect(enrollOktaVerifyPage.getSubHeader()).eql(sameDeviceOVEnrollmentSubtitle);

    await t.expect(await enrollOktaVerifyPage.getSameDeviceReturnAndSetupText()).eql(sameDeviceOVEnrollmentInstructions1);
    await t.expect(await enrollOktaVerifyPage.sameDeviceSetupOnMobileTextExist()).eql(false);

    await t.expect(enrollOktaVerifyPage.getAppStoreHref()).eql(sameDeviceOVEnrollmentAndroidLink);
    if (!userVariables.gen3) {
      await t.expect(enrollOktaVerifyPage.getOVSetupHref()).eql(sameDeviceOVEnrollmentSetupLink);
    }

    // re-render widget with sameDeviceOVEnrollmentEnabled FF on
    await rerenderWidget({
      features: { sameDeviceOVEnrollmentEnabled: true }
    });
    await checkA11y(t);
    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);
    const downloadInstruction = await enrollOktaVerifyPage.getSameDeviceDownloadText();
    await t.expect(downloadInstruction).contains('Don’t have Okta Verify?');
    await t.expect(downloadInstruction).contains('Download here');
    await t.expect(await enrollOktaVerifyPage.appStoreElementExists()).eql(false);
  });

test
  .requestHooks(logger, enrollSameDeviceWindowsWithHighSecurity)('should be able to see OV same device enrollment instructions on HIGH security level (Windows)', async t => {
    const enrollOktaVerifyPage = await setup(t);

    await checkA11y(t);

    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);
    await t.expect(await enrollOktaVerifyPage.getDesktopPromptText()).eql(sameDeviceOVEnrollmentDesktopInstructions1);
    await t.expect(await enrollOktaVerifyPage.getDesktopNoPromptText()).eql(sameDeviceOVEnrollmentDesktopInstructions2);
    await t.expect(await enrollOktaVerifyPage.getDesktopEnsureOVInstalledText()).eql(sameDeviceOVEnrollmentDesktopInstructions3);

    await t.expect(await enrollOktaVerifyPage.sameDeviceSetupOnMobileTextExist()).eql(false);

    await t.expect(enrollOktaVerifyPage.getAppStoreHref()).eql(sameDeviceOVEnrollmentWindowsLink);
    if (!userVariables.gen3) {
      await t.expect(enrollOktaVerifyPage.getOVSetupHref()).eql(sameDeviceOVEnrollmentDesktopSetupLink);
    }

    // re-render widget with sameDeviceOVEnrollmentEnabled FF on
    await rerenderWidget({
      features: { sameDeviceOVEnrollmentEnabled: true }
    });
    await checkA11y(t);
    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);
    const downloadInstruction = await enrollOktaVerifyPage.getSameDeviceDownloadText();
    await t.expect(downloadInstruction).contains('Don’t have Okta Verify?');
    await t.expect(downloadInstruction).contains('Download here');
    await t.expect(await enrollOktaVerifyPage.appStoreElementExists()).eql(false);
  });

test
  .requestHooks(logger, enrollSameDeviceOsxWithAnySecurity)('should be able to see OV same device enrollment instructions on ANY security level (OSX)', async t => {
    const enrollOktaVerifyPage = await setup(t);

    await checkA11y(t);

    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);

    await t.expect(await enrollOktaVerifyPage.getDesktopPromptText()).eql(sameDeviceOVEnrollmentDesktopInstructions1);
    await t.expect(await enrollOktaVerifyPage.getDesktopNoPromptText()).eql(sameDeviceOVEnrollmentDesktopInstructions2);
    await t.expect(await enrollOktaVerifyPage.getDesktopEnsureOVInstalledText()).eql(sameDeviceOVEnrollmentDesktopInstructions3);

    await t.expect(enrollOktaVerifyPage.getAppStoreHref()).eql(sameDeviceOVEnrollmentAppleLink);
    if (!userVariables.gen3) {
      await t.expect(enrollOktaVerifyPage.getOVSetupHref()).eql(sameDeviceOVEnrollmentDesktopSetupLink);
    }

    // re-render widget with sameDeviceOVEnrollmentEnabled FF on
    await rerenderWidget({
      features: { sameDeviceOVEnrollmentEnabled: true }
    });
    await checkA11y(t);
    await t.expect(enrollOktaVerifyPage.getFormTitle()).eql(sameDeviceOVEnrollmentTitle);
    const downloadInstruction = await enrollOktaVerifyPage.getSameDeviceDownloadText();
    await t.expect(downloadInstruction).contains('Don’t have Okta Verify?');
    await t.expect(downloadInstruction).contains('Download here');
    await t.expect(await enrollOktaVerifyPage.appStoreElementExists()).eql(false);
  });
