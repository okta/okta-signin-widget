import { RequestMock, RequestLogger } from 'testcafe';
import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';

import pushPoll from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import pushReject from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-reject-push';
import pushUpgradeOktaVerify from '../../../playground/mocks/data/idp/idx/okta-verify-version-upgrade';

const logger = RequestLogger(/challenge|challenge\/poll/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);


const pushRejectMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushReject);

const pushOktaVerifyUpgradetMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushUpgradeOktaVerify);

fixture('Challenge Okta Verify Push Resend');

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  return challengeOktaVerifyPushPageObject;
}

test
  .requestHooks(pushRejectMock)('challenge okta verify with rejected push', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    const pageTitle = challengeOktaVerifyPushPageObject.getPageTitle();
    await t.expect(pageTitle).contains('Get a push notification');
    const errorBox = challengeOktaVerifyPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText).contains('You have chosen to reject this login.');
    const resendPushBtn = challengeOktaVerifyPushPageObject.getResendPushButton();
    await t.expect(resendPushBtn.value).contains('Resend push notification');
    await t.expect(resendPushBtn.hasClass('link-button-disabled')).notOk();
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
  .requestHooks(logger, pushOktaVerifyUpgradetMock)('challenge okta verify resend push with version upgrade message', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitle();
    await t.expect(pageTitle).contains('Get a push notification');
    const errorBox = challengeOktaVerifyPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText).contains('Your response was received, but your Okta Verify version is no longer supported by your organization. To verify your identity with push notifications, update Okta Verify to the latest version, then try again.');
    const errorTitle = challengeOktaVerifyPushPageObject.getErrorTitle();
    await t.expect(errorTitle.innerText).contains('Update Okta Verify');
    const resendPushBtn = challengeOktaVerifyPushPageObject.getResendPushButton();
    await t.expect(resendPushBtn.value).contains('Resend push notification');
    await t.expect(resendPushBtn.hasClass('link-button-disabled')).notOk();
  });

