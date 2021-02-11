import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';
import { checkConsoleMessages } from '../framework/shared';

import pushPoll from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import success from '../../../playground/mocks/data/idp/idx/success';
import pushReject from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-reject-push';

const logger = RequestLogger(/challenge|challenge\/poll/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const pushSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(success);

const pushRejectMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushReject);

const pushWaitMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushPoll);

fixture('Challenge Okta Verify Push');

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  return challengeOktaVerifyPushPageObject;
}

test
  .requestHooks(pushSuccessMock)('challenge ov push screen has right labels', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'okta_verify',
      methodType: 'push',
    });

    const pageTitle = challengeOktaVerifyPushPageObject.getPageTitle();
    const pushBtn = challengeOktaVerifyPushPageObject.getPushButton();
    await t.expect(pushBtn.textContent).contains('Push notification sent');
    await t.expect(pushBtn.hasClass('link-button-disabled')).ok();
    await t.expect(pageTitle).contains('Get a push notification');
  });

test
  .requestHooks(pushRejectMock)('challenge okta verify with rejected push', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    const pageTitle = challengeOktaVerifyPushPageObject.getPageTitle();
    await t.expect(pageTitle).contains('Get a push notification');
    const errorBox = challengeOktaVerifyPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText).contains('You have chosen to reject this login.');
    const resendPushBtn = challengeOktaVerifyPushPageObject.getResendPushButton();
    await t.expect(resendPushBtn.value).contains('Send push notification');
    await t.expect(resendPushBtn.hasClass('link-button-disabled')).notOk();
  });

test
  .requestHooks(logger, pushSuccessMock)('challenge okta verify push request', async t => {
    await setup(t);
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
      stateHandle: '022P5Fd8jBy3b77XEdFCqnjz__5wQxksRfrAS4z6wP'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');
  });

test
  .requestHooks(logger, pushRejectMock)('challenge okta verify resend push request', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    await challengeOktaVerifyPushPageObject.clickResendPushButton();

    await t.expect(logger.count(() => true)).eql(2);
    const { request: {
      body: answerRequestBodyString,
      method: answerRequestMethod,
      url: answerRequestUrl,
    }
    } = logger.requests[1];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).eql({
      authenticator: {
        id: 'auteq0lLiL9o1cYoN0g4',
        methodType: 'push',
      },
      stateHandle: '022P5Fd8jBy3b77XEdFCqnjz__5wQxksRfrAS4z6wP'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge');
  });

test
  .requestHooks(pushWaitMock)('Warning callout appears after 30 seconds', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await t.wait(30500);
    const warningBox = challengeOktaVerifyPushPageObject.getWarningBox();
    await t.expect(warningBox.innerText)
      .eql('Haven\'t received a push notification yet? Try opening the Okta Verify App on your phone.');
  });
