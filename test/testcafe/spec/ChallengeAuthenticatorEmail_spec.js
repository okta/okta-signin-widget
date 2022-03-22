import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';

import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import emailVerificationWithoutEmailMagicLink from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-without-emailmagiclink';
import emailVerificationWithoutResend from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-without-resend';
import emailVerificationPolling from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-polling';
import emailVerificationPollingShort from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-polling-short';
import emailVerificationPollingVeryShort from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-polling-very-short';
import emailVerificationPollingLong from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-polling-long';
import emailVerificationNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-no-profile';
import emailVerificationNoProfileNoEmailMagicLink from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-no-profile-no-emailmagiclink';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidOTP from '../../../playground/mocks/data/idp/idx/error-401-invalid-otp-passcode';
import invalidEmailOTP from '../../../playground/mocks/data/idp/idx/error-401-invalid-email-otp-passcode';
import invalidOTPTooManyRequest from '../../../playground/mocks/data/idp/idx/error-429-too-many-request-operation-ratelimit';
import magicLinkReturnTab from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import magicLinkExpired from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import terminalTransferedEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';
import sessionExpired from '../../../playground/mocks/data/idp/idx/error-401-session-expired';
import tooManyRequest from '../../../playground/mocks/data/idp/idx/error-429-authenticator-verification-email-polling';
import apiLimitExeeeded from '../../../playground/mocks/data/idp/idx/error-429-api-limit-exceeded';
import emailVerificationSendEmailData from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-email';
import emailVerificationSendEmailDataNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-email-no-profile';

const emailVerificationEmptyProfile = JSON.parse(JSON.stringify(emailVerificationNoProfile));
// add empty profile to test
emailVerificationEmptyProfile.remediation.value[0].profile = {};

const emailVerificationSendEmailDataEmptyProfile = JSON.parse(JSON.stringify(emailVerificationSendEmailDataNoProfile));
// add empty profile to test
emailVerificationSendEmailDataEmptyProfile.currentAuthenticatorEnrollment.value.profile = {};

const logger = RequestLogger(/challenge|challenge\/poll|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const sendEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationSendEmailData)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(emailVerification);

const sendEmailMockWithoutEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationSendEmailData)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(emailVerificationWithoutEmailMagicLink);

const sendEmailEmptyProfileMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationSendEmailDataEmptyProfile);

const sendEmailNoProfileMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationSendEmailDataNoProfile);

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const validOTPWithoutResendMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationPollingVeryShort)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationWithoutResend);

const validOTPmockNoProfile = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationNoProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationNoProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerificationNoProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const validOTPmockNoProfileNoEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationNoProfileNoEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationNoProfileNoEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerificationNoProfileNoEmailMagicLink)
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
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

const invalidOTPMockWithPoll = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidEmailOTP, 403);

const invalidOTPMockContinuePoll = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationPollingLong)
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

const dynamicRefreshShortIntervalMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationPollingShort);

const dynamicRefreshLongIntervalMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationPollingLong);

const tooManyRequestPollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationPolling)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(tooManyRequest, 429);

const apiLimitExceededPollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationPolling)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(apiLimitExeeeded, 429);

const invalidOTPTooManyOperationRequestMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTPTooManyRequest, 429);

const otpTooManyRequestMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(tooManyRequest, 429);

const getResendTimestamp = ClientFunction(() => {
  return window.sessionStorage.getItem('osw-oie-resend-timestamp');
});

fixture('Challenge Email Authenticator Form');

async function setup(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.navigateToPage();
  return challengeEmailPageObject;
}

test
  .requestHooks(sendEmailMock)('send email screen should have right labels', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkConsoleMessages({
      controller: null,
      formName: 'authenticator-verification-data',
      authenticatorKey: 'okta_email',
      methodType: 'email',
    });

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Verify with your email');
    await t.expect(saveBtnText).eql('Send me an email');

    const emailAddress = emailVerificationSendEmailData.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`Verify with an email link or enter a code sent to ${emailAddress}.`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(sendEmailMock)('should not show send again warning after 30 seconds', async t => {
    const challengeEmailPageObject = await setup(t);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Verify with your email');
    await t.expect(saveBtnText).eql('Send me an email');

    await t.wait(31000);
    await t.expect(challengeEmailPageObject.resendEmailViewExists()).notOk();
  });

test
  .requestHooks(sendEmailEmptyProfileMock)('send me an email screen has right labels when profile is empty', async t => {
    const challengeEmailPageObject = await setup(t);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(saveBtnText).eql('Send me an email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql('Verify with an email link or enter a code sent to your email.');
  });

test
  .requestHooks(sendEmailNoProfileMock)('send me an email screen has right labels when profile is null', async t => {
    const challengeEmailPageObject = await setup(t);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(saveBtnText).eql('Send me an email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql('Verify with an email link or enter a code sent to your email.');
  });

test
  .requestHooks(sendEmailMock)('send me an email button should take to challenge email authenticator screen', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickNextButton();
    const pageTitle = challengeEmailPageObject.getFormTitle();
    await t.expect(pageTitle).eql('Verify with your email');

    const emailAddress = emailVerification.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(sendEmailMockWithoutEmailMagicLink)('send me an email button should take to challenge email authenticator screen without email magic link text', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickNextButton();
    const pageTitle = challengeEmailPageObject.getFormTitle();
    await t.expect(pageTitle).eql('Verify with your email');

    const emailAddress = emailVerification.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Enter the verification code in the text box.`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(validOTPmock)('challenge email authenticator screen has right labels', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkConsoleMessages({
      controller: 'mfa-verify-passcode',
      formName: 'challenge-authenticator',
      authenticatorKey: 'okta_email',
      methodType: 'email',
    });
    await challengeEmailPageObject.clickEnterCodeLink();

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Verify with your email');
    await t.expect(saveBtnText).eql('Verify');

    const emailAddress = emailVerification.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(validOTPmockNoProfile)('challenge email authenticator screen has right labels when profile is null', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    const pageTitle = challengeEmailPageObject.getPageTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('We sent you a verification email. Click the verification link in your email to continue or enter the code below.');
  });

test
  .requestHooks(validOTPmockNoProfileNoEmailMagicLink)('challenge email authenticator screen has right labels when profile is null and email magic link does not exist', async t => {
    const challengeEmailPageObject = await setup(t);

    const pageTitle = challengeEmailPageObject.getPageTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('We sent you a verification email. Enter the verification code in the text box.');
  });

test
  .requestHooks(validOTPmockEmptyProfile)('challenge email authenticator screen has right labels when profile is empty', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    const pageTitle = challengeEmailPageObject.getPageTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('We sent you a verification email. Click the verification link in your email to continue or enter the code below.');
  });

test
  .requestHooks(invalidOTPMock)('challenge email authenticator with invalid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPMockWithPoll)('challenge email authenticator - ensure poll does not clear invalid OTP error', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');

    // Wait for the next /poll to happen
    await t.wait(5000);
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPTooManyOperationRequestMock)('challenge email authenticator with too many invalid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('Too many attempts');
  });

test
  .requestHooks(otpTooManyRequestMock)('challenge email authenticator reached Org Ratelimit on OTP submission', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('Too many attempts');
  });

test
  .requestHooks(logger, validOTPmock)('challenge email authenticator with valid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

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
    await t.expect(challengeEmailPageObject.getErrorFromErrorBox()).eql('You have been logged out due to inactivity. Refresh or return to the sign in screen.');
    
    // TODO: verify OTP UI is as expected OTP OKTA-480518

    // Check no poll requests were made further. There seems to be no way to interrupt a poll with mock response.
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(0);
  });

test
  .requestHooks(logger, dynamicRefreshShortIntervalMock)('continue polling on form error with dynamic polling', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();

    // 2 poll requests in 2 seconds at 1 sec interval (Cumulative Request: 2)
    await t.wait(2000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(2);

    await t.removeRequestHooks(dynamicRefreshShortIntervalMock);
    await t.addRequestHooks(invalidOTPMockContinuePoll);

    // 1 poll requests in 2 seconds at 2 sec interval (Cumulative Request: 3)
    await t.wait(2000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(3);

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');
    await t.wait(5000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(5);
  });

test
  .requestHooks(logger, validOTPmock)('resend after 30 seconds', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

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
  .requestHooks(logger, validOTPmock)('resend after at most 30 seconds even after re-render', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(15000);
    challengeEmailPageObject.navigateToPage();
    await challengeEmailPageObject.clickEnterCodeLink();
    await t.wait(15500);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengeEmailPageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an email? Send again');
  });

test
  .requestHooks(logger, validOTPmock)('resend timer resets when we navigate away from view', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengeEmailPageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an email? Send again');

    // Navigate away from the view
    await challengeEmailPageObject.clickSignOutLink();
    challengeEmailPageObject.navigateToPage();

    await challengeEmailPageObject.clickEnterCodeLink();
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).notOk();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an email? Send again');
  });

test
  .requestHooks(logger, validOTPWithoutResendMock)('resend timer resets remediation has no resend context', async t => {
    const challengeEmailPageObject = await setup(t);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();

    // The /poll simulates a response with a remediation with no "resend" context which will reset
    // resend timer, hence the entry should be deleted from sessionStorage.
    await t.wait(110);
    await t.expect(getResendTimestamp()).eql(null);
  });

test
  .requestHooks(magicLinkReturnTabMock)('challenge email factor with magic link', async t => {
    await setup(t);
    const terminalPageObject = new TerminalPageObject(t);
    await t.expect(terminalPageObject.getFormTitle()).contains('Success! Return to the original tab or window');
    await t.expect(terminalPageObject.getMessages()).contains('To continue, please return to the original browser tab or window you used to verify.');
    await t.expect(terminalPageObject.getMessages()).contains('Close this window anytime.');
    await checkConsoleMessages({
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

test
  .requestHooks(logger, dynamicRefreshShortIntervalMock)('dynamic polling based on refresh interval in /poll', async t => {
    const challengeEmailPageObject = await setup(t);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();

    // 2 poll requests in 2 seconds at 1 sec interval
    await t.wait(2000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(2);

    await t.removeRequestHooks(dynamicRefreshShortIntervalMock);
    await t.addRequestHooks(dynamicRefreshLongIntervalMock);

    // 3 poll requests in 6 seconds at 2 sec interval
    await t.wait(6000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(5);
  });

// TODO: avoid 60 second timeout. OKTA-460622
test
  .requestHooks(logger, tooManyRequestPollMock)('pause polling when encounter 429 too many request', async t => {
    const challengeEmailPageObject = await setup(t);

    await t.wait(5000); // wait for first poll

    // Encounter 429
    await t.expect(logger.count(
      record => record.response.statusCode === 429 &&
        record.request.url.match(/poll/)
    )).eql(1);

    await t.removeRequestHooks(tooManyRequestPollMock);
    await t.addRequestHooks(validOTPmock);

    // No error message
    await t.wait(100);
    await t.expect(challengeEmailPageObject.form.getErrorBoxCount()).eql(0);

    // TODO: verify user can still enter OTP OKTA-480518

    // Widget will pause for 60 sec before sending request
    await t.wait(61000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(1);
  });

// TODO: avoid 60 second timeout. OKTA-460622
test
  .requestHooks(logger, apiLimitExceededPollMock)('pause polling when encounter 429 api limit exceeded', async t => {
    const challengeEmailPageObject = await setup(t);

    await t.wait(5000); // wait for first poll

    // Encounter 429
    await t.expect(logger.count(
      record => record.response.statusCode === 429 &&
        record.request.url.match(/poll/)
    )).eql(1);

    await t.removeRequestHooks(apiLimitExceededPollMock);
    await t.addRequestHooks(validOTPmock);

    // No error message
    await t.wait(100);
    await t.expect(challengeEmailPageObject.form.getErrorBoxCount()).eql(0);

    // TODO: verify user can still enter OTP OKTA-480518

    // Pause for 60 sec before sending request
    await t.wait(60000);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(1);
  });

test.requestHooks(sendEmailMock)('should show custom factor page link', async t => {
  const challengeEmailPageObject = await setup(t);

  await renderWidget({
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });

  await t.expect(challengeEmailPageObject.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(challengeEmailPageObject.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});
