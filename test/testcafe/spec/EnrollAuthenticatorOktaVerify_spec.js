import { RequestMock, RequestLogger } from 'testcafe';
import EnrollOktaVerifyPageObject from '../framework/page-objects/EnrollOktaVerifyPageObject';
import SwitchOVEnrollChannelPageObject from '../framework/page-objects/SwitchOVEnrollChannelPageObject';
import EnrollOVViaEmailPageObject from '../framework/page-objects/EnrollOVViaEmailPageObject';
import EnrollOVViaSMSPageObject from '../framework/page-objects/EnrollOVViaSMSPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorEnrollOktaVerifyQr from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr';
import xhrAuthenticatorEnrollOktaVerifyViaEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-via-email';
import xhrAuthenticatorEnrollOktaVerifyEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-email';
import xhrAuthenticatorEnrollOktaVerifyViaSMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-via-sms';
import xhrAuthenticatorEnrollOktaVerifySMS from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/poll/);

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

const smsInstruction = 'We sent an SMS to +18008885555 with an Okta Verify setup link. To continue, open the link on your mobile device.\nOr try a different way to set up Okta Verify.';
const emailInstruction = 'We sent an email to joy@okta.com with an Okta Verify setup link. To continue, open the link on your mobile device.\nOr try a different way to set up Okta Verify.';

fixture('Enroll Okta Verify Authenticator');

async function setup(t) {
  const enrollOktaVerifyPage = new EnrollOktaVerifyPageObject(t);
  await enrollOktaVerifyPage.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: null,
    formName: 'enroll-poll',
    authenticatorType: 'app',
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
  await t.expect(enrollOktaVerifyPage.getQRInstruction()).eql('On your mobile device, download the Okta Verify app from the App Store (iPhone and iPad) or Google Play (Android devices).\nOpen the app and follow the instructions to add your account\nWhen prompted, tap Scan a QR code, then scan the QR code below:');
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

test.requestHooks(enrollViaEmailMocks)('should be able enroll via email', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaEmailPageObject = new EnrollOVViaEmailPageObject(t);
  await t.expect(enrollViaEmailPageObject.getFormTitle()).eql('Set up Okta Verify via email link');
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

test.requestHooks(enrollViaSmsMocks)('should be able enroll via sms', async t => {
  const enrollOktaVerifyPage = await setup(t);
  await enrollOktaVerifyPage.clickSwitchChannel();
  const switchChannelPageObject = new SwitchOVEnrollChannelPageObject(t);
  await t.expect(switchChannelPageObject.getFormTitle()).eql('More options');
  await switchChannelPageObject.selectChannelOption(1);
  await switchChannelPageObject.clickNextButton();
  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
  await enrollViaSMSPageObject.fillPhoneField('8887227871');
  await enrollViaSMSPageObject.clickNextButton();
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
