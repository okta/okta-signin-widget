import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import EnrollEmailPageObject from '../framework/page-objects/EnrollEmailPageObject';
import { checkConsoleMessages } from '../framework/shared';

import xhrEnrollEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email.json';
import xhrEnrollEmailWithoutEmailMagicLink from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email-emailmagiclink-false.json';
import xhrEnrollEmailWithEmailMagicLink from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email-emailmagiclink-true.json';
import success from '../../../playground/mocks/data/idp/idx/success.json';
import invalidOTP from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-email-invalid-otp.json';

// how long to wait before expecting the resend notification to appear (ms)
const RESEND_DELAY_MS = 32_000;

const logger = RequestLogger(/challenge\/poll|challenge\/answer|challenge\/resend/, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEnrollEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrEnrollEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const invalidOTPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

const sendEmailMockWithoutEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrEnrollEmailWithoutEmailMagicLink);

const sendEmailMockWithEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrEnrollEmailWithEmailMagicLink);

const validOTPmockWithEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEnrollEmailWithEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrEnrollEmailWithEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const validOTPmockWithoutEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const invalidOTPMockWithoutEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

const invalidOTPMockWithEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEnrollEmailWithEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);


fixture('Enroll Email Authenticator')
  .meta('v3', true);

async function setup(t) {
  const enrollEmailPageObject = new EnrollEmailPageObject(t);
  await enrollEmailPageObject.navigateToPage();
  await t.expect(enrollEmailPageObject.formExists()).eql(true);

  await checkConsoleMessages({
    controller: 'enroll-email',
    formName: 'enroll-authenticator',
    authenticatorKey: 'okta_email',
    methodType: 'email',
  });

  return enrollEmailPageObject;
}

test
  .requestHooks(invalidOTPMock)('enroll with invalid OTP', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    await enrollEmailPageObject.enterCode('123456');
    await enrollEmailPageObject.clickVerifyButton();

    await t.expect(enrollEmailPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollEmailPageObject.form.getErrorBoxText()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPMockWithEmailMagicLink)('enroll with invalid OTP and with EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(await enrollEmailPageObject.enterCodeFromEmailLinkExists()).ok();

    await enrollEmailPageObject.clickEnterCodeInstead();

    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');
    await enrollEmailPageObject.enterCode('123456');
    await enrollEmailPageObject.clickVerifyButton();

    await t.expect(enrollEmailPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollEmailPageObject.form.getErrorBoxText()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPMockWithoutEmailMagicLink)('enroll with invalid OTP and without EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');
    await t.expect(await enrollEmailPageObject.enterCodeFromEmailLinkExists()).notOk();
    await enrollEmailPageObject.enterCode('123456');
    await enrollEmailPageObject.clickVerifyButton();

    await t.expect(enrollEmailPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollEmailPageObject.form.getErrorBoxText()).contains('We found some errors.');
  });

test
  .requestHooks(sendEmailMockWithoutEmailMagicLink)('send me an email button should take to challenge email authenticator screen without email magic link text', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');

    const emailAddress = xhrEnrollEmailWithoutEmailMagicLink.user.value.identifier;
    await t.expect(await enrollEmailPageObject.verificationLinkTextExists(emailAddress)).ok();

    await t.expect(await enrollEmailPageObject.enterCodeFromEmailLinkExists()).notOk();
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(sendEmailMockWithEmailMagicLink)('send me an email button should take to challenge email authenticator screen with email magic link text', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');

    const emailAddress = xhrEnrollEmailWithEmailMagicLink.user.value.identifier;
    await t.expect(await enrollEmailPageObject.verificationLinkTextExists(emailAddress)).ok();

    await t.expect(await enrollEmailPageObject.enterCodeFromEmailLinkExists()).ok();
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(logger, validOTPmock)('enroll with valid OTP', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.form.getSubtitle())
      .eql('Please check your email and enter the code below.');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    // Verify links
    await t.expect(await enrollEmailPageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();

    await enrollEmailPageObject.enterCode('561234');
    await enrollEmailPageObject.clickVerifyButton();

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
        passcode: '561234',
      },
      stateHandle: 'eyJ6aXAiOiJER'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, validOTPmockWithEmailMagicLink)('enroll with valid OTP and with EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    const emailAddress = xhrEnrollEmailWithEmailMagicLink.user.value.identifier;
    await t.expect(await enrollEmailPageObject.verificationLinkTextExists(emailAddress)).ok();
    await enrollEmailPageObject.clickEnterCodeInstead();
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    // Verify links
    await t.expect(await enrollEmailPageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();

    await enrollEmailPageObject.enterCode('561234');
    await enrollEmailPageObject.clickVerifyButton();

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
        passcode: '561234',
      },
      stateHandle: 'eyJ6aXAiOiJER'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, validOTPmockWithoutEmailMagicLink)('enroll with valid OTP and without EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.getFormSubtitle())
      .contains('Enter the verification code in the text box.');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    // Verify links
    await t.expect(await enrollEmailPageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();

    await enrollEmailPageObject.enterCode('561234');
    await enrollEmailPageObject.clickVerifyButton();

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
        passcode: '561234',
      },
      stateHandle: 'eyJ6aXAiOiJER'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, validOTPmock)('resend after 30 seconds', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(RESEND_DELAY_MS);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(true);
    await t.expect(enrollEmailPageObject.resendEmailText()).contains('Haven\'t received an email?');

    // Asserts the display order of elements in v2
    if (!userVariables.v3) {
      await t.expect(enrollEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Please check your email and enter the code below',
        'Enter Code'
      ].join('.+'), 'si'));

      // 8 poll requests in 31 seconds and 1 resend request after click.
      await t.expect(logger.count(
        record => record.response.statusCode === 200 &&
          record.request.url.match(/poll/)
      )).eql(8);
    }

    await enrollEmailPageObject.clickResendEmail();

    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/resend/)
    )).eql(1);
    const { request: firstRequest } = logger.requests[0];
    await t.expect(JSON.parse(firstRequest.body)).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(firstRequest.method).eql('post');
    await t.expect(firstRequest.url).eql('http://localhost:3000/idp/idx/challenge/poll');
  });

test
  .requestHooks(logger, validOTPmockWithEmailMagicLink)('resend after 30 seconds with EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(RESEND_DELAY_MS);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(true);
    await t.expect(enrollEmailPageObject.resendEmailText()).contains('Haven\'t received an email?');

    // Asserts the display order of elements in v2
    if (!userVariables.v3) {
      await t.expect(enrollEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Click the verification link in your email to continue or enter the code below',
        'Enter a verification code instead'
      ].join('.+'), 'si'));

      // 8 poll requests in 31 seconds and 1 resend request after click.
      await t.expect(logger.count(
        record => record.response.statusCode === 200 &&
          record.request.url.match(/poll/)
      )).eql(8);
    }

    await enrollEmailPageObject.clickResendEmail();
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/resend/)
    )).eql(1);
    const { request: firstRequest } = logger.requests[0];
    let jsonBody = JSON.parse(firstRequest.body);
    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(firstRequest.method).eql('post');
    await t.expect(firstRequest.url).eql('http://localhost:3000/idp/idx/challenge/poll');
  });

test
  .requestHooks(logger, validOTPmockWithoutEmailMagicLink)('resend after 30 seconds without EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(RESEND_DELAY_MS);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(true);
    await t.expect(enrollEmailPageObject.resendEmailText()).contains('Haven\'t received an email?');
    
    // Assert element order in v2
    if (!userVariables.v3) {
      await t.expect(enrollEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Enter the verification code in the text box',
        'Enter Code'
      ].join('.+'), 'si'));

      // 8 poll requests in 31 seconds and 1 resend request after click.
      await t.expect(logger.count(
        record => record.response.statusCode === 200 &&
          record.request.url.match(/poll/)
      )).eql(8);
    }

    await enrollEmailPageObject.clickResendEmail();
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    const { request: firstRequest } = logger.requests[0];
    let jsonBody = JSON.parse(firstRequest.body);

    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/resend/)
    )).eql(1);

    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(firstRequest.method).eql('post');
    await t.expect(firstRequest.url).eql('http://localhost:3000/idp/idx/challenge/poll');
  });

test
  .requestHooks(logger, validOTPmock)('resend after 30 seconds at most even after re-render (validOTPmock)', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(RESEND_DELAY_MS / 2);
    enrollEmailPageObject.navigateToPage();
    await t.wait(RESEND_DELAY_MS / 2);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(true);
    await t.expect(enrollEmailPageObject.resendEmailText()).contains('Haven\'t received an email?');

    // Assert element order in v2
    if (!userVariables.v3) {
      await t.expect(enrollEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Please check your email and enter the code below',
        'Enter Code'
      ].join('.+'), 'si'));
    }
  });

test
  .requestHooks(logger, validOTPmockWithEmailMagicLink)('resend after 30 seconds at most even after re-render (validOTPmockWithEmailMagicLink)', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(RESEND_DELAY_MS / 2);
    enrollEmailPageObject.navigateToPage();
    await t.wait(RESEND_DELAY_MS / 2);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(true);
    await t.expect(enrollEmailPageObject.resendEmailText()).contains('Haven\'t received an email?');

    // Assert element order in v2
    if (!userVariables.v3) {
      await t.expect(enrollEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Click the verification link in your email to continue or enter the code below',
        'Enter a verification code instead'
      ].join('.+'), 'si'));
    }
  });

test
  .requestHooks(logger, validOTPmockWithoutEmailMagicLink)('resend after 30 seconds at most even after re-render (validOTPmockWithoutEmailMagicLink)', async t => {
    const enrollEmailPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(false);
    await t.wait(RESEND_DELAY_MS / 2);
    enrollEmailPageObject.navigateToPage();
    await t.wait(RESEND_DELAY_MS / 2);
    await t.expect(await enrollEmailPageObject.resendEmailExists()).eql(true);
    await t.expect(enrollEmailPageObject.resendEmailText()).contains('Haven\'t received an email?');

    // Assert element order in v2
    if (!userVariables.v3) {
      await t.expect(enrollEmailPageObject.form.el.innerText).match(new RegExp([
        // title
        'Verify with your email',
        // resend prompt
        'Haven\'t received an email\\? Send again',
        // instructions and form imputs
        'Enter the verification code in the text box',
        'Enter Code'
      ].join('.+'), 'si'));
    }
  });
