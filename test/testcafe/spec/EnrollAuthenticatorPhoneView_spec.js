import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import EnrollPhonePageObject from '../framework/page-objects/EnrollPhonePageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages, oktaDashboardContent } from '../framework/shared';
import xhrAuthenticatorEnrollPhone from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone';
import xhrAuthenticatorEnrollPhoneVoice from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone-voice';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import invalidCode from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-phone-invalid-otp';

const smsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const voiceMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhoneVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollPhoneVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const invalidCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidCode, 403);

const logger = RequestLogger(/challenge|challenge\/resend|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Authenticator Enroll Phone');

async function setup(t) {
  const enrollPhonePage = new EnrollPhonePageObject(t);
  await enrollPhonePage.navigateToPage();
  await t.expect(enrollPhonePage.formExists()).eql(true);
  return enrollPhonePage;
}

test
  .requestHooks(smsMock)('SMS mode - has the right labels', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);

    await checkConsoleMessages({
      controller: 'enroll-sms',
      formName: 'enroll-authenticator',
      authenticatorKey: 'phone_number',
      methodType: 'sms',
    });

    const pageTitle = enrollPhonePageObject.getFormTitle();
    const pageSubtitle = enrollPhonePageObject.getFormSubtitle();
    await t.expect(pageTitle).contains('Set up phone authentication');
    await t.expect(pageSubtitle).contains('A code was sent to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');

    // Verify links (switch authenticator link is present even if there is just one authenticator available)
    await t.expect(await enrollPhonePageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await enrollPhonePageObject.signoutLinkExists()).ok();
  });

test
  .requestHooks(voiceMock)('Voice mode - has the right labels', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);

    await checkConsoleMessages({
      controller: 'enroll-call',
      formName: 'enroll-authenticator',
      authenticatorKey: 'phone_number',
      methodType: 'voice',
    });

    const pageTitle = enrollPhonePageObject.getFormTitle();
    const pageSubtitle = enrollPhonePageObject.getFormSubtitle();
    await t.expect(pageTitle).contains('Set up phone authentication');
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');

    // Verify links (switch authenticator link is present even if there is just one authenticator available)
    await t.expect(await enrollPhonePageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await enrollPhonePageObject.signoutLinkExists()).ok();
  });

test
  .requestHooks(logger, smsMock)('SMS flow', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);
    await enrollPhonePageObject.clickNextButton();

    await enrollPhonePageObject.verifyFactor('credentials.passcode', '1234');
    await enrollPhonePageObject.clickNextButton();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(1);

    const [ codeRequest ] = logger.requests;
    const codeRequestBody = JSON.parse(codeRequest.request.body);
    await t.expect(codeRequestBody).eql({
      credentials: { passcode: '1234' },
      stateHandle: '02OV37dlmNqJnwcP18W3V-6Qlw9Fw59d943bG6nMBS'
    });
    await t.expect(codeRequest.request.method).eql('post');
    await t.expect(codeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, voiceMock)('Voice flow', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);
    await enrollPhonePageObject.clickNextButton();

    await enrollPhonePageObject.verifyFactor('credentials.passcode', '1234');
    await enrollPhonePageObject.clickNextButton();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(1);

    const [ codeRequest ] = logger.requests;
    const codeRequestBody = JSON.parse(codeRequest.request.body);
    await t.expect(codeRequestBody).eql({
      credentials: { passcode: '1234' },
      stateHandle: '02gn9VS7JnBUz_AxA4Ee6YoZnYfLO3ys2gRuiBBWf4'
    });
    await t.expect(codeRequest.request.method).eql('post');
    await t.expect(codeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(invalidCodeMock)('Entering invalid passcode results in an error', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);
    await enrollPhonePageObject.verifyFactor('credentials.passcode', 'abcd');
    await enrollPhonePageObject.clickNextButton();
    await enrollPhonePageObject.waitForErrorBox();
    await t.expect(enrollPhonePageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollPhonePageObject.getInvalidOTPError()).contains('We found some errors.');
    await t.wait(30500);
    await t.expect(await enrollPhonePageObject.resendCodeExists(1)).eql(true);
    const resendCodeText = await enrollPhonePageObject.resendCodeText(1);
    await t.expect(resendCodeText).contains('Haven\'t received an SMS?');
    await t.expect(resendCodeText).contains('Send again');
  });

test
  .requestHooks(smsMock)('Callout appears after 30 seconds in sms mode', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);
    await enrollPhonePageObject.clickNextButton();
    await t.expect(await enrollPhonePageObject.resendCodeExists(2)).eql(false);
    await t.wait(30500);
    await t.expect(await enrollPhonePageObject.resendCodeExists(2)).eql(true);
    const resendCodeText = await enrollPhonePageObject.resendCodeText(1);
    await t.expect(resendCodeText).contains('Haven\'t received an SMS?');
    await t.expect(resendCodeText).contains('Send again');
  });

test
  .requestHooks(voiceMock)('Callout appears after 30 seconds in voice mode', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);
    await enrollPhonePageObject.clickNextButton();
    await t.expect(await enrollPhonePageObject.resendCodeExists(2)).eql(false);
    await t.wait(30500);
    await t.expect(await enrollPhonePageObject.resendCodeExists(2)).eql(true);
    const resendCodeText = await enrollPhonePageObject.resendCodeText(1);
    await t.expect(resendCodeText).contains('Haven\'t received a call?');
    await t.expect(resendCodeText).contains('Call again');
  });

test
  .requestHooks(smsMock)('Callout appears after 30 seconds at most even after re-render', async t => {
    const enrollPhonePageObject = await setup(t);
    await checkA11y(t);
    await enrollPhonePageObject.clickNextButton();
    await t.expect(await enrollPhonePageObject.resendCodeExists(2)).eql(false);
    await t.wait(15000);
    enrollPhonePageObject.navigateToPage();
    await enrollPhonePageObject.clickNextButton();
    await t.wait(15500);
    await t.expect(await enrollPhonePageObject.resendCodeExists(2)).eql(true);
    const resendCodeText = await enrollPhonePageObject.resendCodeText(1);
    await t.expect(resendCodeText).contains('Haven\'t received an SMS?');
    await t.expect(resendCodeText).contains('Send again');
  });
