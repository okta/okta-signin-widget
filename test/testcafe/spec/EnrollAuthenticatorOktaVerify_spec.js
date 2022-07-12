import { RequestMock, RequestLogger } from 'testcafe';
import EnrollOktaVerifyPageObject from '../framework/page-objects/EnrollOktaVerifyPageObject';
import SwitchOVEnrollChannelPageObject from '../framework/page-objects/SwitchOVEnrollChannelPageObject';
import EnrollOVViaEmailPageObject from '../framework/page-objects/EnrollOVViaEmailPageObject';
import EnrollOVViaSMSPageObject from '../framework/page-objects/EnrollOVViaSMSPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorEnrollOktaVerifyQr from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr';
import xhrAuthenticatorEnrollOktaVerifyViaEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-via-email';
import xhrAuthenticatorEnrollOktaVerifyEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email';
import xhrAuthenticatorEnrollOktaVerifyViaSMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-via-sms';
import xhrAuthenticatorEnrollOktaVerifySMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms';

import xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgrade from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email-version-upgrade';
import xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms-version-upgrade';
import xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgrade from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr-version-upgrade';

import xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgradeNonIos from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email-version-upgrade-non-ios';
import xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgradeNonIos from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms-version-upgrade-non-ios';
import xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgradeNonIos from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr-version-upgrade-non-ios';

import xhrAuthenticatorEnrollEnableBiometricsQr from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr-enable-biometrics';
import xhrAuthenticatorEnrollEnableBiometricsEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email-enable-biometrics';
import xhrAuthenticatorEnrollEnableBiometricsSMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms-enable-biometrics';

import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/introspect|poll|send|enroll/, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr);

const enrollViaQRcodeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaEmailMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const resendEmailMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollOktaVerifyEmail);

const enrollViaSmsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const resendSmsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollOktaVerifySMS);

const enrollViaSmsVersionUpgradeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaSmsVersionUpgradeMocksGoBack = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgrade);

const enrollViaSmsVersionUpgradeMocksNonIos = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMSVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaEmailVersionUpgradeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaEmailVersionUpgradeMocksNonIos = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmailVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);


const enrollViaQRcodeVersionUpgradeMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgrade)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaQRcodeVersionUpgradeMocksNonIos = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaQRVersionUpgradeNonIos)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaQRcodeEnableBiometricsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollEnableBiometricsQr)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaEmailEnableBiometricsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollEnableBiometricsEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const enrollViaSMSEnableBiometricsMocks = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOktaVerifyQr)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrAuthenticatorEnrollOktaVerifyViaSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/send')
  .respond(xhrAuthenticatorEnrollEnableBiometricsSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrSuccess);

const smsInstruction = 'We sent an SMS to +18008885555 with an Okta Verify setup link. To continue, open the link on your mobile device.\nOr try a different way to set up Okta Verify.';
const emailInstruction = 'We sent an email to joy@okta.com with an Okta Verify setup link. To continue, open the link on your mobile device.\nOr try a different way to set up Okta Verify.';
const qrCodeInstruction = 'On your mobile device, download the Okta Verify app from the App Store (iPhone and iPad) or Google Play (Android devices).\nOpen the app and follow the instructions to add your account\nWhen prompted, tap Scan a QR code, then scan the QR code below:';

const fipsUpgradeMessage = 'The device used to set up Okta Verify does not meet your organization’s security requirements because it is not FIPS compliant. Contact your administrator for help.';
const fipsUpgradeMessageNonIos = 'The Okta Verify version on the device used does not meet your organization’s security requirements. To add your account, update Okta Verify to the latest version, then try again.';
const fipsUpgradeTitle = 'Update Okta Verify';

const enableBiometricsMessage = 'Your organization requires biometrics. To proceed, ensure your device supports biometrics, then add your account and enable biometrics when prompted.';
const enableBiometricsMessageTitle = 'Enable biometrics to add an account in Okta Verify';

fixture('Enroll Okta Verify Authenticator');

async function setup(t) {
  const enrollOktaVerifyPage = new EnrollOktaVerifyPageObject(t);
  await enrollOktaVerifyPage.navigateToPage();
  await checkConsoleMessages({
    controller: null,
    formName: 'enroll-poll',
    authenticatorKey: 'okta_verify',
  });

  return enrollOktaVerifyPage;
}

test.requestHooks(logger, enrollViaQRcodeMocks)('should be able to enroll via qrcode', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await t.expect(enrollOktaVerifyPage.getFormTitle()).eql('Set up Okta Verify');
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasQRcode()).eql(true);
  await t.expect(enrollOktaVerifyPage.getQRInstruction()).eql(qrCodeInstruction);

  // Verify links
  await t.expect(await enrollOktaVerifyPage.switchAuthenticatorLinkExists()).ok();
  await t.expect(enrollOktaVerifyPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
  await t.expect(await enrollOktaVerifyPage.signoutLinkExists()).ok();

  await t.wait(4000);
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.url.match(/poll/)
  )).eql(1);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mock)('should render switch channel view when Can\'t scan is clicked in qr code flow', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await t.expect(enrollOktaVerifyPage.getSwitchChannelText()).eql('Can\'t scan?');
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.getOptionLabel(0))
    .eql('Text me a setup link');
  await t.expect(switchChannelPageObject.getOptionLabel(1))
    .eql('Email me a setup link');

  // Verify links
  await t.expect(await switchChannelPageObject.switchAuthenticatorLinkExists()).ok();
  await t.expect(switchChannelPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
  await t.expect(await switchChannelPageObject.signoutLinkExists()).ok();
});

test.requestHooks(resendEmailMocks)('should render switch channel view when "try different way" is clicked when in email flow', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await t.expect(enrollOktaVerifyPage.getSwitchChannelText()).eql('try a different way');
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.getOptionLabel(0))
    .eql('Scan a QR code');
  await t.expect(switchChannelPageObject.getOptionLabel(1))
    .eql('Text me a setup link');

  // Verify links
  await t.expect(await switchChannelPageObject.switchAuthenticatorLinkExists()).ok();
  await t.expect(switchChannelPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
  await t.expect(await switchChannelPageObject.signoutLinkExists()).ok();
});

test.requestHooks(resendSmsMocks)('should render switch channel view when "try different way" is clicked when in sms flow', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await t.expect(switchChannelPageObject.getOptionCount()).eql(2);
  await t.expect(switchChannelPageObject.getOptionLabel(0))
    .eql('Scan a QR code');
  await t.expect(switchChannelPageObject.getOptionLabel(1))
    .eql('Email me a setup link');
});

test.requestHooks(enrollViaEmailMocks).only('should be able enroll via email', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaEmailPageObject = new EnrollOVViaEmailPageObject(t);
  await t.expect(enrollViaEmailPageObject.getFormTitle()).eql('Set up Okta Verify via email link');
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.hasCountryField()).notOk();
  await t.expect(enrollViaEmailPageObject.hasSwitchChannelText).ok();
  await enrollViaEmailPageObject.fillEmailField('test@gmail.com');
  await enrollViaEmailPageObject.clickNextButton();
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).eql(emailInstruction);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(resendEmailMocks)('after timeout should be able see and click send again link when enrolling via email', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).eql(emailInstruction);
  await t.expect(enrollOktaVerifyPage.resendView().visible).notOk();
  await t.wait(30000);
  await t.expect(enrollOktaVerifyPage.resendView().visible).ok();
  const resendView = enrollOktaVerifyPage.resendView();
  await t.expect(resendView.innerText).eql('Haven’t received an email? Check your spam folder or send again');
  await enrollOktaVerifyPage.clickSendAgainLink();
  await t.expect(enrollOktaVerifyPage.resendView().visible).notOk();
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).eql(emailInstruction);
});

test.requestHooks(logger, enrollViaSmsMocks)('should be able enroll via sms', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
  await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickNextButton();
  await t.expect(logger.count(() => true)).eql(3);
  const { request: { body: answerRequestBodyString }} = logger.requests[2];
  const answerRequestBody = JSON.parse(answerRequestBodyString);
  await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.getSmsInstruction()).eql(smsInstruction);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(resendSmsMocks)('after timeout should be able see and click send again link when enrolling via sms', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await t.expect(enrollOktaVerifyPage.getSmsInstruction()).eql(smsInstruction);
  await t.expect(enrollOktaVerifyPage.resendView().visible).notOk();
  await t.wait(30000);
  await t.expect(enrollOktaVerifyPage.resendView().visible).ok();
  const resendView = enrollOktaVerifyPage.resendView();
  await t.expect(resendView.innerText).eql('Haven’t received an SMS? Send again');
  await enrollOktaVerifyPage.clickSendAgainLink();
  await t.expect(enrollOktaVerifyPage.resendView().visible).notOk();
  await t.expect(enrollOktaVerifyPage.getSmsInstruction()).eql(smsInstruction);
});


const testSmsMsg = async (t, isIos) => {
  const message = isIos ? fipsUpgradeMessage: fipsUpgradeMessageNonIos;
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
  await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickNextButton();
  await t.expect(logger.count(() => true)).eql(3);
  const { request: { body: answerRequestBodyString }} = logger.requests[2];
  const answerRequestBody = JSON.parse(answerRequestBodyString);
  await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.getSmsInstruction()).eql(smsInstruction);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(message);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
};

test.requestHooks(logger, enrollViaSmsVersionUpgradeMocks)('should see ov upgrade error message during enroll via sms', async t => {
  await testSmsMsg(t, true);
});

test.requestHooks(logger, enrollViaSmsVersionUpgradeMocksNonIos)('should see ov upgrade error message during enroll via sms for non ios devices', async t => {
  await testSmsMsg(t, false);
});

const testEmailMsg = async (t, isIos) => {
  const message = isIos ? fipsUpgradeMessage: fipsUpgradeMessageNonIos;
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaEmailPageObject = new EnrollOVViaEmailPageObject(t);
  await t.expect(enrollViaEmailPageObject.getFormTitle()).eql('Set up Okta Verify via email link');
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.hasCountryField()).notOk();
  await t.expect(enrollViaEmailPageObject.hasSwitchChannelText).ok();
  await enrollViaEmailPageObject.fillEmailField('test@gmail.com');
  await enrollViaEmailPageObject.clickNextButton();
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).eql(emailInstruction);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(message);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
};

test.requestHooks(enrollViaEmailVersionUpgradeMocks)('should see ov upgrade error message during enroll via email', async t => {
  await testEmailMsg(t, true);
});

test.requestHooks(enrollViaEmailVersionUpgradeMocksNonIos)('should see ov upgrade error message during enroll via email for non ios devices', async t => {
  await testEmailMsg(t, false);
});

const testQRcodeMsg = async (t, isIos) => {
  const message = isIos ? fipsUpgradeMessage: fipsUpgradeMessageNonIos;
  const enrollOktaVerifyPage = await setup(t);
  await t.expect(enrollOktaVerifyPage.getFormTitle()).eql('Set up Okta Verify');
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasQRcode()).eql(true);
  await t.expect(enrollOktaVerifyPage.getQRInstruction()).eql(qrCodeInstruction);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(message);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);
  await t.wait(4000);
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.url.match(/poll/)
  )).eql(1);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
};

test.requestHooks(logger, enrollViaQRcodeVersionUpgradeMocks)('should see ov upgrade error message during enroll via qrcode', async t => {
  await testQRcodeMsg(t, true);
});

test.requestHooks(logger, enrollViaQRcodeVersionUpgradeMocksNonIos)('should see ov upgrade error message during enroll via qrcode for non ios devices', async t => {
  await testQRcodeMsg(t, false);
});

test.requestHooks(logger, enrollViaSmsVersionUpgradeMocksGoBack)('should not show version upgrade message after user hits go back', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
  await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickNextButton();
  await t.expect(logger.count(() => true)).eql(3);
  const { request: { body: answerRequestBodyString }} = logger.requests[2];
  const answerRequestBody = JSON.parse(answerRequestBodyString);
  await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.getSmsInstruction()).eql(smsInstruction);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(fipsUpgradeMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(fipsUpgradeTitle);
  // hit go back
  await enrollOktaVerifyPage.switchAuthenticator();
  await t.expect(errorBox.exists).notOk;
});

test.requestHooks(logger, enrollViaQRcodeEnableBiometricsMocks)('should see ov enable biometrics message during enroll via QR code', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await t.expect(enrollOktaVerifyPage.getFormTitle()).eql('Set up Okta Verify');
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasQRcode()).eql(true);
  await t.expect(enrollOktaVerifyPage.getQRInstruction()).eql(qrCodeInstruction);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(enableBiometricsMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(enableBiometricsMessageTitle);
  await t.wait(4000);
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.url.match(/poll/)
  )).eql(1);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(enrollViaEmailEnableBiometricsMocks)('should see ov enable biometrics message during enroll via email', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaEmailPageObject = new EnrollOVViaEmailPageObject(t);
  await t.expect(enrollViaEmailPageObject.getFormTitle()).eql('Set up Okta Verify via email link');
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.hasCountryField()).notOk();
  await t.expect(enrollViaEmailPageObject.hasSwitchChannelText).ok();
  await enrollViaEmailPageObject.fillEmailField('test@gmail.com');
  await enrollViaEmailPageObject.clickNextButton();
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.getEmailInstruction()).eql(emailInstruction);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(enableBiometricsMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(enableBiometricsMessageTitle);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(logger, enrollViaSMSEnableBiometricsMocks)('should see ov enable biometrics message during enroll via sms', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await t.expect(enrollViaSMSPageObject.hasSwitchChannelText).ok();
  await t.expect(enrollViaSMSPageObject.hasCountryField()).ok();
  await t.expect(enrollViaSMSPageObject.getCountryLabel()).eql('+1');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickNextButton();
  await t.expect(logger.count(() => true)).eql(3);
  const { request: { body: answerRequestBodyString }} = logger.requests[2];
  const answerRequestBody = JSON.parse(answerRequestBodyString);
  await t.expect(answerRequestBody.phoneNumber).eql('+18887227871');
  await t.expect(enrollOktaVerifyPage.hasEnrollViaQRInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaEmailInstruction()).eql(false);
  await t.expect(enrollOktaVerifyPage.hasEnrollViaSmsInstruction()).eql(true);
  await t.expect(enrollOktaVerifyPage.getSmsInstruction()).eql(smsInstruction);
  const errorBox = enrollOktaVerifyPage.getErrorBox();
  await t.expect(errorBox.innerText).contains(enableBiometricsMessage);
  const errorTitle = enrollOktaVerifyPage.getErrorTitle();
  await t.expect(errorTitle.innerText).contains(enableBiometricsMessageTitle);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});