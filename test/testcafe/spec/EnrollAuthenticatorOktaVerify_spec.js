import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import EnrollOktaVerifyPageObject from '../framework/page-objects/EnrollOktaVerifyPageObject';
import SwitchOVEnrollChannelPageObject from '../framework/page-objects/SwitchOVEnrollChannelPageObject';
import EnrollOVViaEmailPageObject from '../framework/page-objects/EnrollOVViaEmailPageObject';
import EnrollOVViaSMSPageObject from '../framework/page-objects/EnrollOVViaSMSPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages, oktaDashboardContent, renderWidget as rerenderWidget } from '../framework/shared';
import xhrAuthenticatorEnrollOktaVerifyQr from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr.json';
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

let isSuccess = false;

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail);

const enrollViaQRcodeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaEmailMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const resendEmailMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail);

const enrollViaSmsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const resendSmsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS);

const enrollViaSmsVersionUpgradeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaSmsVersionUpgradeMocksGoBack = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade);
    }
    else if (isSuccess) {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaSmsVersionUpgradeMocksNonIos = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaEmailVersionUpgradeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaEmailVersionUpgradeMocksNonIos = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaQRcodeVersionUpgradeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgrade);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaQRcodeVersionUpgradeMocksNonIos = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgradeNonIos);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaQRcodeEnableBiometricsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollEnableBiometricsQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollEnableBiometricsQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaEmailEnableBiometricsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollEnableBiometricsEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const enrollViaSMSEnableBiometricsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollEnableBiometricsSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    if (!userVariables.v3) {
      res.setBody(xhrSuccess);
    }
    else if (isSuccess) {
      res.setBody(xhrSuccess);
    } else {
      res.setBody(xhrAuthenticatorEnrollOktaVerifyQr);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const smsInstruction1 = 'We sent an SMS to +18008885555 with an Okta Verify setup link. To continue, open the link on your mobile device.';
const smsInstruction2 = 'Or try a different way to set up Okta Verify.';
const emailInstruction1 = 'We sent an email to joy@okta.com with an Okta Verify setup link. To continue, open the link on your mobile device.';
const emailInstruction2 = 'Or try a different way to set up Okta Verify.';
const qrCodeInstruction1 = 'On your mobile device, download the Okta Verify app from the App Store (iPhone and iPad) or Google Play (Android devices).';
const qrCodeInstruction2 = 'Open the app and follow the instructions to add your account';
const qrCodeInstruction3 = 'When prompted, tap Scan a QR code, then scan the QR code below:';

const fipsUpgradeMessage = 'The device used to set up Okta Verify does not meet your organization’s security requirements because it is not FIPS compliant. Contact your administrator for help.';
const fipsUpgradeMessageNonIos = 'The Okta Verify version on the device used does not meet your organization’s security requirements. To add your account, update Okta Verify to the latest version, then try again.';
const fipsUpgradeTitle = 'Update Okta Verify';

const enableBiometricsMessage = 'Your organization requires biometrics. To proceed, ensure your device supports biometrics, then add your account and enable biometrics when prompted.';
const enableBiometricsMessageTitle = 'Enable biometrics to add an account in Okta Verify';

fixture('Enroll Okta Verify Authenticator')
  .meta('v3', true);

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

test.requestHooks(logger, enrollViaQRcodeMocks)('should be able to enroll via qrcode', async t => {
  isSuccess = false;
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

  isSuccess = true;
  await t.wait(4000);
  // V3 - higher poll requests ~ 7
  if (!userVariables.v3) {
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(1);
  }

  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
});

test.requestHooks(mock)('should render switch channel view when Can\'t scan is clicked in qr code flow', async t => {
  isSuccess = false;
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

test.requestHooks(enrollViaEmailMocks)('should be able enroll via email', async t => {
  isSuccess = false;
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


  isSuccess = true;
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
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
  await t.expect(resendView.innerText).eql('Haven’t received an email? Check your spam folder or send again');
  await enrollOktaVerifyPage.clickSendAgainLink();
  await t.expect(enrollOktaVerifyPage.resendViewExists()).notOk();
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction1);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).contains(emailInstruction2);
});

test.requestHooks(logger, enrollViaSmsMocks)('should be able enroll via sms', async t => {
  isSuccess = false;
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
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickSendSetupLink();
  // logger.count ~ 10 in v3, and not consistent
  if (!userVariables.v3) {
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

  isSuccess = true;
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
});

test.requestHooks(logger, enrollViaSmsMocks)('respects settings.defaultCountryCode', async t => {
  isSuccess = false;
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);

  // drive to SMS page (click next)
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);

  // Default country code US (+1)
  const defaultCountryCodeText = await enrollViaSMSPageObject.getCountryLabel();
  await t.expect(defaultCountryCodeText.trim()).eql('+1');

  await rerenderWidget({
    defaultCountryCode: 'GB'  // United Kingdom
  });
  // drive to SMS page (click next) - required again after rerender
  await enrollOktaVerifyPage.clickSwitchChannel();
  await switchChannelPageObject.clickNextButton();

  // United Kingdom (+44)
  const gbCountryCodeText = await enrollViaSMSPageObject.getCountryLabel();
  await t.expect(gbCountryCodeText.trim()).eql('+44');
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
  await t.expect(resendView.innerText).eql('Haven’t received an SMS? Send again');
  await enrollOktaVerifyPage.clickSendSMSAgainLink();
  await t.expect(enrollOktaVerifyPage.resendViewExists()).notOk();
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction1);
  await t.expect(await enrollOktaVerifyPage.getSmsInstruction()).contains(smsInstruction2);
});

const testSmsMsg = async (t, isIos) => {
  isSuccess = false;
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
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickSendSetupLink();

  // logger.count ~ 10 in v3, and not consistent
  if (!userVariables.v3) {
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

  isSuccess = true;
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
};

test.requestHooks(logger, enrollViaSmsVersionUpgradeMocks)('should see ov upgrade error message during enroll via sms', async t => {
  await testSmsMsg(t, true);
});

test
  .meta('flaky', true)
  .requestHooks(logger, enrollViaSmsVersionUpgradeMocksNonIos)('should see ov upgrade error message during enroll via sms for non ios devices', async t => {
    await testSmsMsg(t, false);
  });

const testEmailMsg = async (t, isIos) => {
  isSuccess = false;
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
  isSuccess = true;
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
};

test.requestHooks(enrollViaEmailVersionUpgradeMocks)('should see ov upgrade error message during enroll via email', async t => {
  await testEmailMsg(t, true);
});

test
  .meta('flaky', true)
  .requestHooks(enrollViaEmailVersionUpgradeMocksNonIos)('should see ov upgrade error message during enroll via email for non ios devices', async t => {
    await testEmailMsg(t, false);
  });

const testQRcodeMsg = async (t, isIos) => {
  isSuccess = false;
  const message = isIos ? fipsUpgradeMessage: fipsUpgradeMessageNonIos;
  const enrollOktaVerifyPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollOktaVerifyPage.getFormTitle(1)).eql('Set up Okta Verify');
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(true);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(await enrollOktaVerifyPage.hasQRcode()).eql(true);
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
  if (!userVariables.v3) {
    await t.wait(4000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(1);
  }

  isSuccess = true;
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
};

test.requestHooks(logger, enrollViaQRcodeVersionUpgradeMocks)('should see ov upgrade error message during enroll via qrcode', async t => {
  await testQRcodeMsg(t, true);
});

test.requestHooks(logger, enrollViaQRcodeVersionUpgradeMocksNonIos)('should see ov upgrade error message during enroll via qrcode for non ios devices', async t => {
  await testQRcodeMsg(t, false);
});

test.requestHooks(logger, enrollViaSmsVersionUpgradeMocksGoBack)('should not show version upgrade message after user hits go back', async t => {
  isSuccess = false;
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
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickSendSetupLink();
  // logger.count ~ 10 in v3, and not consistent
  if (!userVariables.v3) {
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
  await t.expect(errorBox.innerText).contains(fipsUpgradeMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);
  // hit go back
  await enrollOktaVerifyPage.switchAuthenticator();
  await t.expect(errorBox.exists).notOk;
});

test.requestHooks(logger, enrollViaQRcodeEnableBiometricsMocks)('should see ov enable biometrics message during enroll via QR code', async t => {
  isSuccess = false;
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
  if (!userVariables.v3) {
    await t.wait(4000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(1);
  }

  isSuccess = true;
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
});

test.requestHooks(enrollViaEmailEnableBiometricsMocks)('should see ov enable biometrics message during enroll via email', async t => {
  isSuccess = false;
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
  isSuccess = true;
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  isSuccess = false;
});

test
  .meta('flaky', true)
  .requestHooks(logger, enrollViaSMSEnableBiometricsMocks)('should see ov enable biometrics message during enroll via sms', async t => {
    isSuccess = false;
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
    await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
    await enrollViaSMSPageObject.fillPhoneField('8887227871');
    await enrollViaSMSPageObject.clickSendSetupLink();

    // logger.count ~ 10 in v3, and not consistent
    if (!userVariables.v3) {
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

    isSuccess = true;
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    isSuccess = false;
  });
