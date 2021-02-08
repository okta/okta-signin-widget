import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';

import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import emailVerificationPolling from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-polling';
import emailVerificationNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-no-profile';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidOTP from '../../../playground/mocks/data/idp/idx/error-email-verify';
import magicLinkReturnTab from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import magicLinkExpired from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import terminalTransferedEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';
import sessionExpired from '../../../playground/mocks/data/idp/idx/error-session-expired';

const emailVerificationEmptyProfile = JSON.parse(JSON.stringify(emailVerificationNoProfile));
// add empty profile to test
emailVerificationEmptyProfile.remediation.value[0].profile = {};

const logger = RequestLogger(/challenge|challenge\/poll|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const validOTPmockNoProfile = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationNoProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationNoProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerificationNoProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const validOTPmockEmptyProfile = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidOTPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

const invalidOTPMockContinuePoll = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

const stopPollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationPolling)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(sessionExpired, 403);

const magicLinkReturnTabMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkReturnTab);

const magicLinkExpiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkExpired);

const magicLinkTransfer = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalTransferedEmail);


fixture('Challenge Email Authenticator Form');

async function setup(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.navigateToPage();
  return challengeEmailPageObject;
}

test
  .requestHooks(validOTPmock)('challenge email authenticator screen has right labels', async t => {
    const challengeEmailPageObject = await setup(t);

    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.length).eql(3);
    await t.expect(log[0]).eql('===== playground widget ready event received =====');
    await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[2])).eql({
      controller: 'mfa-verify-passcode',
      formName: 'challenge-authenticator',
      authenticatorKey: 'okta_email',
    });

    const pageTitle = challengeEmailPageObject.getPageTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('Check i**a@h***o.net for a verification message. Click the verification button in your email or enter the code below to continue.');
  });

test
  .requestHooks(validOTPmockNoProfile)('challenge email authenticator screen has right labels when profile is null', async t => {
    const challengeEmailPageObject = await setup(t);

    const pageTitle = challengeEmailPageObject.getPageTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('Check your email for a verification message. Click the verification button in your email or enter the code below to continue.');
  });

test
  .requestHooks(validOTPmockEmptyProfile)('challenge email authenticator screen has right labels when profile is empty', async t => {
    const challengeEmailPageObject = await setup(t);

    const pageTitle = challengeEmailPageObject.getPageTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('Check your email for a verification message. Click the verification button in your email or enter the code below to continue.');
  });

test
  .requestHooks(invalidOTPMock)('challenge email authenticator with invalid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('Authentication failed');
  });

test
  .requestHooks(logger, validOTPmock)('challenge email authenticator with valid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
    await challengeEmailPageObject.clickNextButton();
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(1);

    const { request: {
      body: answerRequestBodyString,
      method: answerRequestMethod,
      url: answerRequestUrl,
    }
    } = logger.requests[0];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).eql({
      credentials: {
        passcode: '1234',
      },
      stateHandle: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, stopPollMock)('no polling if session has expired', async t => {
    const challengeEmailPageObject = await setup(t);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(5000);
    await t.expect(challengeEmailPageObject.getErrorFromErrorBox()).eql('The session has expired');
    // Check no poll requests were made further. There seems to be no way to interrupt a poll with mock response.
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(0);
  });

test
  .requestHooks(logger, invalidOTPMockContinuePoll)('continue polling on form error', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('Authentication failed');
    await t.wait(5000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(2);
  }); 

test
  .requestHooks(logger, validOTPmock)('resend after 30 seconds', async t => {
    const challengeEmailPageObject = await setup(t);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(31000);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengeEmailPageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an email? Send again');

    // 8 poll requests in 32 seconds and 1 resend request after click.
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(8);

    await challengeEmailPageObject.clickSendAgainLink();
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/resend/)
    )).eql(1);

    const { request: {
      body: firstRequestBody,
      method: firstRequestMethod,
      url: firstRequestUrl,
    }
    } = logger.requests[0];
    const { request: {
      body: lastRequestBody,
      method: lastRequestMethod,
      url: lastRequestUrl,
    }
    } = logger.requests[logger.requests.length - 1];
    let jsonBody = JSON.parse(firstRequestBody);
    await t.expect(jsonBody).eql({'stateHandle':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8'});
    await t.expect(firstRequestMethod).eql('post');
    await t.expect(firstRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');

    jsonBody = JSON.parse(lastRequestBody);
    await t.expect(jsonBody).eql({'stateHandle':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8'});
    await t.expect(lastRequestMethod).eql('post');
    await t.expect(lastRequestUrl).eql('http://localhost:3000/idp/idx/challenge/resend');
  });


test
  .requestHooks(magicLinkReturnTabMock)('challenge email factor with magic link', async t => {
    await setup(t);
    const terminalPageObject = new TerminalPageObject(t);
    await t.expect(terminalPageObject.getMessages()).eql('Please return to the original tab.');

    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.length).eql(3);
    await t.expect(log[0]).eql('===== playground widget ready event received =====');
    await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[2])).eql({
      controller: null,
      formName: 'terminal',
    });

  });

test
  .requestHooks(magicLinkTransfer)('show the correct content when transferred email', async t => {
    await setup(t);
    const terminalPageObject = new TerminalPageObject(t);
    await t.expect(terminalPageObject.getMessages()).eql('Flow continued in a new tab.');
  });

test
  .requestHooks(magicLinkExpiredMock)('challenge email factor with expired magic link', async t => {
    await setup(t);
    const terminalPageObject = new TerminalPageObject(t);
    await t.expect(terminalPageObject.getErrorMessages().isError()).eql(true);
    await t.expect(terminalPageObject.getErrorMessages().getTextContent()).eql('This email link has expired. To resend it, return to the screen where you requested it.');
    await t.expect(await terminalPageObject.goBackLinkExists()).ok();
    await t.expect(terminalPageObject.getFormTitle()).eql('Verify with your email');
  });
