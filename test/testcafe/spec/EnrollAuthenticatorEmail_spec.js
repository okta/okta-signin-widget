import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import EnrollEmailPageObject from '../framework/page-objects/EnrollEmailPageObject';
import { checkConsoleMessages } from '../framework/shared';

import xhrEnrollEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email';
import xhrEnrollEmailWithoutEmailMagicLink from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email-emailmagiclink-false.json';
import xhrEnrollEmailWithEmailMagicLink from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email-emailmagiclink-true.json';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidOTP from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-email-invalid-otp';

const logger = RequestLogger(/challenge\/poll|challenge\/answer|challenge\/resend/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEnrollEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrEnrollEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

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
  .respond(success);

const validOTPmockWithoutEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidOTPMockWithoutEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithoutEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

const invalidOTPMockWithEmailMagicLink = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollEmailWithEmailMagicLink)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);


fixture('Enroll Email Authenticator');

async function setup(t) {
  const enrollEmailPageObject = new EnrollEmailPageObject(t);
  await enrollEmailPageObject.navigateToPage();

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

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    await enrollEmailPageObject.enterCode('123456');
    await enrollEmailPageObject.form.clickSaveButton();

    await t.expect(enrollEmailPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollEmailPageObject.form.getErrorBoxText()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPMockWithEmailMagicLink)('enroll with invalid OTP and with EML', async t => {
    const enrollEmailPageObject = await setup(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    
    await enrollEmailPageObject.clickElement('.enter-auth-code-instead-link');
    
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');
    await enrollEmailPageObject.enterCode('123456');
    await enrollEmailPageObject.form.clickSaveButton();

    await t.expect(enrollEmailPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollEmailPageObject.form.getErrorBoxText()).contains('We found some errors.');
});

test
  .requestHooks(invalidOTPMockWithoutEmailMagicLink)('enroll with invalid OTP and without EML', async t => {
    const enrollEmailPageObject = await setup(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');
    await t.expect(await enrollEmailPageObject.enterCodeFromEmailLinkExists()).notOk();
    await enrollEmailPageObject.enterCode('123456');
    await enrollEmailPageObject.form.clickSaveButton();

    await t.expect(enrollEmailPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollEmailPageObject.form.getErrorBoxText()).contains('We found some errors.');
});

test
  .requestHooks(sendEmailMockWithoutEmailMagicLink)('send me an email button should take to challenge email authenticator screen without email magic link text', async t => {
    const enrollEmailPageObject = await setup(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    
    const emailAddress = xhrEnrollEmailWithoutEmailMagicLink.user.value.identifier;
    await t.expect(enrollEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Enter the verification code in the text box.`);

    await t.expect(await enrollEmailPageObject.enterCodeFromEmailLinkExists()).notOk();
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
});

test
  .requestHooks(sendEmailMockWithEmailMagicLink)('send me an email button should take to challenge email authenticator screen with email magic link text', async t => {
    const enrollEmailPageObject = await setup(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');

    const emailAddress = xhrEnrollEmailWithEmailMagicLink.user.value.identifier;
    await t.expect(enrollEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);

    await t.expect(await enrollEmailPageObject.enterCodeFromEmailLinkExists()).ok();
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
});

test
  .requestHooks(logger, validOTPmock)('enroll with valid OTP', async t => {
    const enrollEmailPageObject = await setup(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.form.getSubtitle())
      .eql('Please check your email and enter the code below.');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    // Verify links
    await t.expect(await enrollEmailPageObject.switchAuthenticatorLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();

    await enrollEmailPageObject.enterCode('561234');
    await enrollEmailPageObject.form.clickSaveButton();

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

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    const emailAddress = xhrEnrollEmailWithEmailMagicLink.user.value.identifier;
    await t.expect(enrollEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);
    await enrollEmailPageObject.clickElement('.enter-auth-code-instead-link');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    // Verify links
    await t.expect(await enrollEmailPageObject.switchAuthenticatorLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();

    await enrollEmailPageObject.enterCode('561234');
    await enrollEmailPageObject.form.clickSaveButton();

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

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    const emailAddress = xhrEnrollEmailWithoutEmailMagicLink.user.value.identifier;
    await t.expect(enrollEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Enter the verification code in the text box.`);
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

    // Verify links
    await t.expect(await enrollEmailPageObject.switchAuthenticatorLinkExists()).ok();
    await t.expect(enrollEmailPageObject.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
    await t.expect(await enrollEmailPageObject.signoutLinkExists()).ok();

    await enrollEmailPageObject.enterCode('561234');
    await enrollEmailPageObject.form.clickSaveButton();

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
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
    await t.wait(31000);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).notOk();
    await t.expect(enrollEmailPageObject.resendEmail.getText()).eql('Haven\'t received an email? Send again');

    // 8 poll requests in 31 seconds and 1 resend request after click.
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(8);

    await enrollEmailPageObject.resendEmail.click();

    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
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
    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(firstRequestMethod).eql('post');
    await t.expect(firstRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');

    jsonBody = JSON.parse(lastRequestBody);
    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(lastRequestMethod).eql('post');
    await t.expect(lastRequestUrl).eql('http://localhost:3000/idp/idx/challenge/resend');
  });

test
  .requestHooks(logger, validOTPmockWithEmailMagicLink)('resend after 30 seconds with EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
    await t.wait(31000);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).notOk();
    await t.expect(enrollEmailPageObject.resendEmail.getText()).eql('Haven\'t received an email? Send again');

    // 8 poll requests in 31 seconds and 1 resend request after click.
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(8);

    await enrollEmailPageObject.resendEmail.click();

    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
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
    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(firstRequestMethod).eql('post');
    await t.expect(firstRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');

    jsonBody = JSON.parse(lastRequestBody);
    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(lastRequestMethod).eql('post');
    await t.expect(lastRequestUrl).eql('http://localhost:3000/idp/idx/challenge/resend');
});

test
  .requestHooks(logger, validOTPmockWithoutEmailMagicLink)('resend after 30 seconds without EML', async t => {
    const enrollEmailPageObject = await setup(t);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
    await t.wait(31000);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).notOk();
    await t.expect(enrollEmailPageObject.resendEmail.getText()).eql('Haven\'t received an email? Send again');

    // 8 poll requests in 31 seconds and 1 resend request after click.
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/poll/)
    )).eql(8);

    await enrollEmailPageObject.resendEmail.click();

    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
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
    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(firstRequestMethod).eql('post');
    await t.expect(firstRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');

    jsonBody = JSON.parse(lastRequestBody);
    await t.expect(jsonBody).eql({'stateHandle':'eyJ6aXAiOiJER'});
    await t.expect(lastRequestMethod).eql('post');
    await t.expect(lastRequestUrl).eql('http://localhost:3000/idp/idx/challenge/resend');
});

test
  .requestHooks(logger, validOTPmock)('resend after 30 seconds at most even after re-render', async t => {
    const enrollEmailPageObject = await setup(t);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
    await t.wait(15000);
    enrollEmailPageObject.navigateToPage();
    await t.wait(15500);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).notOk();
    await t.expect(enrollEmailPageObject.resendEmail.getText()).eql('Haven\'t received an email? Send again');
  });

test
  .requestHooks(logger, validOTPmockWithEmailMagicLink)('resend after 30 seconds at most even after re-render', async t => {
    const enrollEmailPageObject = await setup(t);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
    await t.wait(15000);
    enrollEmailPageObject.navigateToPage();
    await t.wait(15500);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).notOk();
    await t.expect(enrollEmailPageObject.resendEmail.getText()).eql('Haven\'t received an email? Send again');
});

test
  .requestHooks(logger, validOTPmockWithoutEmailMagicLink)('resend after 30 seconds at most even after re-render', async t => {
    const enrollEmailPageObject = await setup(t);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).ok();
    await t.wait(15000);
    enrollEmailPageObject.navigateToPage();
    await t.wait(15500);
    await t.expect(enrollEmailPageObject.resendEmail.isHidden()).notOk();
    await t.expect(enrollEmailPageObject.resendEmail.getText()).eql('Haven\'t received an email? Send again');
});
