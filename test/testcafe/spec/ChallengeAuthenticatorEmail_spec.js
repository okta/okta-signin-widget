import { RequestMock, RequestLogger, ClientFunction, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
import { oktaDashboardContent } from '../framework/shared';

import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import emailVerificationWithSecondaryEmail from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-with-secondary-email';
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
import emailVerificationSendEmailDataWithSecondaryEmail from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-email-with-secondary-email';
import emailVerificationSendEmailDataNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-email-no-profile';
import terminalConsentDenied from '../../../playground/mocks/data/idp/idx/terminal-enduser-email-consent-denied';

const emailVerificationEmptyProfile = JSON.parse(JSON.stringify(emailVerificationNoProfile));
// add empty profile to test
emailVerificationEmptyProfile.remediation.value[0].profile = {};

const emailVerificationSendEmailDataEmptyProfile = JSON.parse(JSON.stringify(emailVerificationSendEmailDataNoProfile));
// add empty profile to test
emailVerificationSendEmailDataEmptyProfile.currentAuthenticatorEnrollment.value.profile = {};

const createRequestLogger = () => RequestLogger(/challenge|challenge\/poll|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const createWaiter = (t) => {
  const startDate = new Date();
  let totalTimeToBeElapsedSinceStart = 0;

  return {
    wait: async (timeToWait) => {
      totalTimeToBeElapsedSinceStart += timeToWait;
      const timeElapsedSinceStart = new Date() - startDate;
      const realTimeToWait = Math.max(totalTimeToBeElapsedSinceStart - timeElapsedSinceStart, 0);
      await t.wait(realTimeToWait);
    },
  };
};


const sendEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationSendEmailData)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(emailVerification);

const sendEmailMockWithSecondaryEmail = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationSendEmailDataWithSecondaryEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(emailVerificationWithSecondaryEmail);

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

const validOTPLogger = createRequestLogger();
const validOTPResendLogger = createRequestLogger();
const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

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
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const validOTPmockNoProfileNoEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationNoProfileNoEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationNoProfileNoEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerificationNoProfileNoEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const validOTPmockEmptyProfile = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

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

const stopPollLogger = createRequestLogger();
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

const dynamicContinuePollingLogger = createRequestLogger();
const dynamicRefreshIntervalLogger = createRequestLogger();
const dynamicRefreshShortIntervalMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationPollingShort)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationPollingShort);

const dynamicRefreshLongIntervalMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerificationPollingLong);

const tooManyRequestPollLogger = createRequestLogger();
const tooManyRequestPollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationPolling)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(tooManyRequest, 429);

const apiLimitExceededPollLogger = createRequestLogger();
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

const terrminalConsentDeniedPollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationPollingVeryShort)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(terminalConsentDenied);

// OKTA-1083742: Factory to create mock that simulates network failure recovery during polling
const createNetworkFailureRecoveryMock = () => {
  let pollCount = 0;
  const mock = RequestMock()
    .onRequestTo('http://localhost:3000/idp/idx/introspect')
    .respond(emailVerificationPollingShort)
    .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
    .respond((req, res) => {
      pollCount++;
      if (pollCount === 2 || pollCount === 3) {
        // Simulate network failure by responding with non-JSON error
        // This causes the SDK to throw an error without rawIdxState/errorCode,
        // which the widget should treat as a transient network failure
        res.statusCode = 500;
        res.headers['content-type'] = 'text/plain';
        res.setBody('Service Unavailable');
        return;
      }
      res.statusCode = 200;
      res.headers['content-type'] = 'application/json';
      res.setBody(emailVerificationPollingShort);
    });
  return mock;
};
const networkFailureRecoveryLogger = createRequestLogger();

const getResendTimestamp = ClientFunction(() => {
  return window.sessionStorage.getItem('osw-oie-resend-timestamp');
});

fixture('Challenge Email Authenticator Form');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(challengeEmailPageObject.formExists()).eql(true);
  return challengeEmailPageObject;
}

test
  .requestHooks(sendEmailMock)('send email screen should have right labels', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: null,
      formName: 'authenticator-verification-data',
      authenticatorKey: 'okta_email',
      methodType: 'email',
    });

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Get a verification email');
    await t.expect(saveBtnText).eql('Send me an email');

    const emailAddress = emailVerificationSendEmailData.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`Send a verification email to ${emailAddress} by clicking on "Send me an email".`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.verifyWithSomethingElseLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(sendEmailMockWithSecondaryEmail)('send email screen should have both primary and secondary emails', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: null,
      formName: 'authenticator-verification-data',
      authenticatorKey: 'okta_email',
      methodType: 'email',
    });

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Get a verification email');
    await t.expect(saveBtnText).eql('Send me an email');

    const emailAddress = emailVerificationSendEmailDataWithSecondaryEmail.currentAuthenticatorEnrollment.value.profile.email;
    const secondaryEmailAddress = emailVerificationSendEmailDataWithSecondaryEmail.currentAuthenticatorEnrollment.value.profile.secondaryEmail;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`Send a verification email to ${emailAddress} and ${secondaryEmailAddress} by clicking on "Send me an email".`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.verifyWithSomethingElseLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });
test
  .requestHooks(sendEmailMock)('should not show send again warning after 30 seconds', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Get a verification email');
    await t.expect(saveBtnText).eql('Send me an email');

    await t.wait(31000);
    await t.expect(challengeEmailPageObject.resendEmailViewExists()).notOk();
  });

test
  .requestHooks(sendEmailEmptyProfileMock)('send me an email screen has right labels when profile is empty', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).contains('Get a verification email');
    await t.expect(saveBtnText).eql('Send me an email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql('Send a verification email by clicking on "Send me an email".');
  });

test
  .requestHooks(sendEmailNoProfileMock)('send me an email screen has right labels when profile is null', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).contains('Get a verification email');
    await t.expect(saveBtnText).eql('Send me an email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql('Send a verification email by clicking on "Send me an email".');
  });

test
  .requestHooks(sendEmailMock)('send me an email button should take to challenge email authenticator screen', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickNextButton('Send me an email');
    const pageTitle = challengeEmailPageObject.getFormTitle();
    await t.expect(pageTitle).eql('Verify with your email');

    const emailAddress = emailVerification.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);
    await t.expect(challengeEmailPageObject.getEnterCodeInsteadButton().exists).eql(true);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.verifyWithSomethingElseLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(sendEmailMockWithSecondaryEmail)('send me an email button should take to challenge email authenticator screen with both primary and secondary email', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickNextButton('Send me an email');
    const pageTitle = challengeEmailPageObject.getFormTitle();
    await t.expect(pageTitle).eql('Verify with your email');

    const emailAddress = emailVerificationWithSecondaryEmail.currentAuthenticatorEnrollment.value.profile.email;
    const secondaryEmailAddress = emailVerificationWithSecondaryEmail.currentAuthenticatorEnrollment.value.profile.secondaryEmail;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress} and ${secondaryEmailAddress}. Click the verification link in your email to continue or enter the code below.`);
    await t.expect(challengeEmailPageObject.getEnterCodeInsteadButton().exists).eql(true);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.verifyWithSomethingElseLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(sendEmailMockWithoutEmailMagicLink)('send me an email button should take to challenge email authenticator screen without email magic link text', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickNextButton('Send me an email');
    const pageTitle = challengeEmailPageObject.getFormTitle();
    await t.expect(pageTitle).eql('Verify with your email');

    const emailAddress = emailVerification.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Enter the verification code in the text box.`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.verifyWithSomethingElseLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(validOTPmock)('challenge email authenticator screen has right labels', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: 'mfa-verify-passcode',
      formName: 'challenge-authenticator',
      authenticatorKey: 'okta_email',
      methodType: 'email',
    });
    await t.expect(challengeEmailPageObject.getEnterCodeInsteadButton().exists).eql(true);
    await challengeEmailPageObject.clickEnterCodeLink();

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Verify with your email');
    await t.expect(saveBtnText).eql('Verify');

    const emailAddress = emailVerification.currentAuthenticatorEnrollment.value.profile.email;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.verifyWithSomethingElseLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(validOTPmockNoProfile)('challenge email authenticator screen has right labels when profile is null', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(challengeEmailPageObject.getEnterCodeInsteadButton().exists).eql(true);
    await challengeEmailPageObject.clickEnterCodeLink();
    await t.expect(challengeEmailPageObject.form.getElement('.enter-auth-code-instead-link').exists).eql(false);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('We sent you a verification email. Click the verification link in your email to continue or enter the code below.');
  });

test
  .requestHooks(validOTPmockNoProfileNoEmailMagicLink)('challenge email authenticator screen has right labels when profile is null and email magic link does not exist', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('We sent you a verification email. Enter the verification code in the text box.');
  });

test
  .requestHooks(validOTPmockEmptyProfile)('challenge email authenticator screen has right labels when profile is empty', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(challengeEmailPageObject.getEnterCodeInsteadButton().exists).eql(true);
    await challengeEmailPageObject.clickEnterCodeLink();

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains('We sent you a verification email. Click the verification link in your email to continue or enter the code below.');
  });

test
  .requestHooks(invalidOTPMock)('challenge email authenticator with invalid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton('Verify');
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPMock)('challenge email authenticator with invalid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.pressEnter();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPMockWithPoll)('challenge email authenticator - ensure poll does not clear invalid OTP error', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton('Verify');
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
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton('Verify');
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('Too many attempts');
  });

test
  .requestHooks(otpTooManyRequestMock)('challenge email authenticator reached Org Ratelimit on OTP submission', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton('Verify');
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('Too many attempts');
  });

test
  .requestHooks(validOTPLogger, validOTPmock)('challenge email authenticator with valid OTP', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
    await challengeEmailPageObject.clickNextButton('Verify');
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(validOTPLogger.count(() => true)).eql(1);

    const { request: {
      body: answerRequestBodyString,
      method: answerRequestMethod,
      url: answerRequestUrl,
    }
    } = validOTPLogger.requests[0];
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
  .requestHooks(stopPollLogger, stopPollMock)('no polling if session has expired', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(5000);
    await t.expect(challengeEmailPageObject.getErrorFromErrorBox()).contains('You have been logged out due to inactivity. Refresh or return to the sign in screen.');

    // TODO: verify OTP UI is as expected OTP OKTA-480518

    // Check no poll requests were made further. There seems to be no way to interrupt a poll with mock response.
    await t.expect(stopPollLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(0);
  });

test
  .requestHooks(dynamicContinuePollingLogger, dynamicRefreshShortIntervalMock)('continue polling on form error with dynamic polling', async t => {
    dynamicContinuePollingLogger.clear();
    const challengeEmailPageObject = await setup(t);
    const waiter = createWaiter(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);

    // 2 poll requests in 2 seconds at 1 sec interval (Cumulative Request: 2)
    await waiter.wait(1000);
    // change mocks after 1st poll request so 2 sec interval will be applied after 2nd poll request
    await t.removeRequestHooks(dynamicRefreshShortIntervalMock);
    await t.addRequestHooks(invalidOTPMockContinuePoll);
    await waiter.wait(1000);
    await t.expect(dynamicContinuePollingLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(2);

    // 1 poll request in 2 seconds at 2 sec interval (Cumulative Request: 3)
    await waiter.wait(2000);
    await t.expect(dynamicContinuePollingLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(3);

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton('Verify');
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');
    await waiter.wait(4000);

    // In v3 there is an extra poll request compared to v2
    const expectedPollCount = userVariables.gen3 ? 5 : 4;
    await t.expect(dynamicContinuePollingLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(expectedPollCount);
  });

test
  .requestHooks(invalidOTPMock)('Entering invalid passcode results in an error, resend callout should appear after 30 seconds', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton('Verify');
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');

    // Resend callout should be hidden but appear after 30s
    await t.expect(await challengeEmailPageObject.resendEmailExists(1)).eql(false);
    await t.wait(25000);
    await t.expect(await challengeEmailPageObject.resendEmailExists(1)).eql(false);
    await t.wait(5500);
    await t.expect(await challengeEmailPageObject.resendEmailExists(1)).eql(true);
  });

test
  .requestHooks(invalidOTPMock)('Callout appears after 30 seconds, hides after entering invalid passcode', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(31000);
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(true);
    const resendEmailViewText = challengeEmailPageObject.resendEmailViewText();
    await t.expect(resendEmailViewText).contains('Haven\'t received an email?');

    // After submitting invalid passcode resend callout should be hidden but appear again after 30s
    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton('Verify');
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('We found some errors.');
    await t.expect(await challengeEmailPageObject.resendEmailExists(1)).eql(false);
    await t.wait(31000);
    await t.expect(await challengeEmailPageObject.resendEmailExists(1)).eql(true);
  });

test
  .requestHooks(validOTPResendLogger, validOTPmock)('resend after 30 seconds', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(31000);
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(true);
    const resendEmailViewText = challengeEmailPageObject.resendEmailViewText();
    await t.expect(resendEmailViewText).contains('Haven\'t received an email?');

    // Asserts the order of elements in v2
    if (!userVariables.gen3) {
      await t.expect(challengeEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Click the verification link in your email to continue or enter the code below',
        'Enter Code'
      ].join('.+'), 'si'));
    }

    // 8 poll requests in 32 seconds and 1 resend request after click.
    await t.expect(validOTPResendLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(8);

    await challengeEmailPageObject.clickSendAgainLink();
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);
    await t.expect(validOTPResendLogger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/resend/)
    )).eql(1);

    const { request: {
      body: firstRequestBody,
      method: firstRequestMethod,
      url: firstRequestUrl,
    }
    } = validOTPResendLogger.requests[0];
    const { request: {
      body: lastRequestBody,
      method: lastRequestMethod,
      url: lastRequestUrl,
    }
    } = validOTPResendLogger.requests[validOTPResendLogger.requests.length - 1];
    let jsonBody = JSON.parse(firstRequestBody);
    await t.expect(jsonBody).eql({'stateHandle':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8'});
    await t.expect(firstRequestMethod).eql('post');
    await t.expect(firstRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');

    jsonBody = JSON.parse(lastRequestBody);
    await t.expect(jsonBody).contains({'stateHandle':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8'});
    await t.expect(lastRequestMethod).eql('post');
    await t.expect(lastRequestUrl).eql('http://localhost:3000/idp/idx/challenge/resend');
  });

test
  .requestHooks(validOTPmock)('resend after at most 30 seconds even after re-render', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(15000);
    challengeEmailPageObject.navigateToPage();
    await challengeEmailPageObject.clickEnterCodeLink();
    await t.wait(15500);
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(true);
    const resendEmailViewText = challengeEmailPageObject.resendEmailViewText();
    await t.expect(resendEmailViewText).contains('Haven\'t received an email?');

    // Asserts the order of elements in v2
    if (!userVariables.gen3) {
      await t.expect(challengeEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Click the verification link in your email to continue or enter the code below',
        'Enter Code'
      ].join('.+'), 'si'));
    }
  });

test
  .requestHooks(validOTPmock)('resend timer resets when we navigate away from view', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(30500);
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(true);
    let resendEmailViewText = challengeEmailPageObject.resendEmailViewText();
    await t.expect(resendEmailViewText).contains('Haven\'t received an email?');

    // Asserts the order of elements in v2
    if (!userVariables.gen3) {
      await t.expect(challengeEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Click the verification link in your email to continue or enter the code below',
        'Enter Code'
      ].join('.+'), 'si'));
    }

    // Navigate away from the view
    await challengeEmailPageObject.clickSignOutLink();
    challengeEmailPageObject.navigateToPage();

    await challengeEmailPageObject.clickEnterCodeLink();
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(30500);
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(true);
    resendEmailViewText = challengeEmailPageObject.resendEmailViewText();
    await t.expect(resendEmailViewText).contains('Haven\'t received an email?');

    // Asserts the order of elements in v2
    if (!userVariables.gen3) {
      await t.expect(challengeEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Click the verification link in your email to continue or enter the code below',
        'Enter Code'
      ].join('.+'), 'si'));
    }
  });

test
  .requestHooks(validOTPWithoutResendMock)('resend timer resets remediation has no resend context', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);

    // The /poll simulates a response with a remediation with no "resend" context which will reset
    // resend timer, hence the entry should be deleted from sessionStorage.
    await t.wait(110);
    await t.expect(getResendTimestamp()).eql(null);
  });

test
  .requestHooks(magicLinkReturnTabMock)('challenge email factor with magic link', async t => {
    await setup(t);
    await checkA11y(t);
    const terminalPageObject = new TerminalPageObject(t);
    await t.expect(terminalPageObject.getFormTitle()).contains('Success! Return to the original tab or window');
    await t.expect(terminalPageObject.getMessages()).contains('To continue, please return to the original browser tab or window you used to verify.');
    await t.expect(terminalPageObject.getMessages(1)).contains('Close this window anytime.');
    await checkConsoleMessages({
      controller: null,
      formName: 'terminal',
    });
  });

test
  .requestHooks(magicLinkTransfer)('show the correct content when transferred email', async t => {
    await setup(t);
    await checkA11y(t);
    const terminalPageObject = new TerminalPageObject(t);
    await t.expect(terminalPageObject.getMessages()).eql('Flow continued in a new tab.');
  });

test
  .requestHooks(magicLinkExpiredMock)('challenge email factor with expired magic link', async t => {
    await setup(t);
    await checkA11y(t);
    const terminalPageObject = new TerminalPageObject(t);
    await t.expect(terminalPageObject.getErrorMessages().isError()).eql(true);
    await t.expect(terminalPageObject.getErrorMessages().getTextContent()).contains('This email link has expired. To resend it, return to the screen where you requested it.');
    await t.expect(await terminalPageObject.goBackLinkExists()).ok();
    await t.expect(terminalPageObject.getFormTitle()).eql('Verify with your email');
  });

test
  .requestHooks(dynamicRefreshIntervalLogger, dynamicRefreshShortIntervalMock)('dynamic polling based on refresh interval in /poll', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await challengeEmailPageObject.resendEmailExists()).eql(false);

    // 2 poll requests in 2 seconds at 1 sec interval
    await t.wait(2000);
    await t.expect(dynamicRefreshIntervalLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(2);

    await t.removeRequestHooks(dynamicRefreshShortIntervalMock);
    await t.addRequestHooks(dynamicRefreshLongIntervalMock);

    // 3 poll requests in 6 seconds at 2 sec interval
    await t.wait(6000);
    await t.expect(dynamicRefreshIntervalLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(5);
  });

// TODO: avoid 60 second timeout. OKTA-460622
test
  .requestHooks(tooManyRequestPollLogger, tooManyRequestPollMock)('pause polling when encounter 429 too many request', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.wait(5000); // wait for first poll

    // Encounter 429
    await t.expect(tooManyRequestPollLogger.count(
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
    await t.expect(tooManyRequestPollLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(1);
  });

// TODO: avoid 60 second timeout. OKTA-460622
test
  .requestHooks(apiLimitExceededPollLogger, apiLimitExceededPollMock)('pause polling when encounter 429 api limit exceeded', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.wait(5000); // wait for first poll

    // Encounter 429
    await t.expect(apiLimitExceededPollLogger.count(
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
    await t.expect(apiLimitExceededPollLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(1);
  });

test
  .requestHooks(sendEmailMock)('should show custom factor page link', async t => {
    const challengeEmailPageObject = await setup(t, {
      helpLinks: {
        factorPage: {
          text: 'custom factor page link',
          href: 'https://acme.com/what-is-okta-autheticators'
        }
      }
    });
    await checkA11y(t);

    await t.expect(challengeEmailPageObject.getFactorPageHelpLinksLabel()).eql('custom factor page link');
    await t.expect(challengeEmailPageObject.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
  });

test
  .requestHooks(terrminalConsentDeniedPollMock)('shows a terminal message when consent is denied in another tab', async t => {
    await setup(t);
    await checkA11y(t);
    await t.wait(1000); // wait for poll
    const terminalPageObject = new TerminalPageObject(t);
    await t.wait(2000); // wait for error page to show up
    await t.expect(terminalPageObject.getErrorMessages().isError()).eql(true);
    await t.expect(terminalPageObject.getErrorMessages().getTextContent()).contains('Operation cancelled by user.');
    await t.expect(await terminalPageObject.goBackLinkExists()).ok();
  });

// OKTA-1083742: Test that network failures during polling don't show error UI
test
  .requestHooks(networkFailureRecoveryLogger, createNetworkFailureRecoveryMock())('should not show error when polling encounters network failure and recovers', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickEnterCodeLink();

    // Polling at ~1s intervals (emailVerificationPollingShort):
    //   Poll 1: success (200)
    //   Poll 2: network failure (500 non-JSON)
    //   Poll 3: network failure (500 non-JSON)
    //   Poll 4+: success (200) — recovered
    await t.wait(6000);

    // Verify no error box is shown on the page — network failures during polling are silent
    await t.expect(challengeEmailPageObject.form.getErrorBoxCount()).eql(0);

    // Verify failed polls were detected
    await t.expect(networkFailureRecoveryLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/poll/)
    )).eql(2);

    // Verify polling recovered — successful polls after the failures
    await t.expect(networkFailureRecoveryLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).gte(2);
  });
