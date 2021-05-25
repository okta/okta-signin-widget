import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import EnrollEmailPageObject from '../framework/page-objects/EnrollEmailPageObject';
import { checkConsoleMessages } from '../framework/shared';

import xhrEnrollEmail from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidOTP from '../../../playground/mocks/data/idp/idx/error-email-verify';

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

    await t.expect(enrollEmailPageObject.form.getErrorBoxText()).contains('You do not have permission to perform the requested action');
  });

test
  .requestHooks(logger, validOTPmock)('enroll with valid OTP', async t => {
    const enrollEmailPageObject = await setup(t);

    await t.expect(enrollEmailPageObject.form.getTitle()).eql('Verify with your email');
    await t.expect(enrollEmailPageObject.form.getSubtitle())
      .eql('Please check your email and enter the code below.');
    await t.expect(enrollEmailPageObject.form.getSaveButtonLabel()).eql('Verify');

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
