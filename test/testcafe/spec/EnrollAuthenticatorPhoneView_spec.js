import { RequestMock, RequestLogger } from 'testcafe';
import EnrollPhonePageObject from '../framework/page-objects/EnrollPhonePageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorEnrollPhone from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone';
import xhrAuthenticatorEnrollPhoneVoice from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone-voice';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import invalidCode from '../../../playground/mocks/data/idp/idx/error-email-verify';

const smsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const voiceMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhoneVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollPhoneVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

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
  return enrollPhonePage;
}

test
  .requestHooks(smsMock)('SMS mode - has the right labels', async t => {
    const enrollPhonePageObject = await setup(t);

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

    await t.expect(await enrollPhonePageObject.signoutLinkExists()).ok();
  });

test
  .requestHooks(voiceMock)('Voice mode - has the right labels', async t => {
    const enrollPhonePageObject = await setup(t);

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

    await t.expect(await enrollPhonePageObject.signoutLinkExists()).ok();
  });

test
  .requestHooks(logger, smsMock)('SMS flow', async t => {
    const enrollPhonePageObject = await setup(t);
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
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.verifyFactor('credentials.passcode', 'abcd');
    await challengePhonePageObject.clickNextButton();
    await challengePhonePageObject.waitForErrorBox();
    await t.expect(challengePhonePageObject.getInvalidOTPError()).contains('You do not have permission to perform the requested action');
  });

test
  .requestHooks(smsMock)('Callout appears after 30 seconds in sms mode', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengePhonePageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an SMS? Send again');
  });

test
  .requestHooks(voiceMock)('Callout appears after 30 seconds in voice mode', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengePhonePageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received a call? Call again');
  });
