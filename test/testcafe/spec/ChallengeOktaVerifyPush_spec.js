import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';
import { a11yCheck, checkConsoleMessages } from '../framework/shared';

import pushPoll from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import success from '../../../playground/mocks/data/idp/idx/success';

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

const pushWaitMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushPoll);

fixture('Challenge Okta Verify Push');

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  await a11yCheck(t);

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
    const a11ySpan = challengeOktaVerifyPushPageObject.getA11ySpan();
    await t.expect(pushBtn.textContent).contains('Push notification sent');
    await t.expect(a11ySpan.textContent).contains('Push notification sent');
    await t.expect(pushBtn.hasClass('link-button-disabled')).ok();
    await t.expect(pageTitle).contains('Get a push notification');

    // Verify links
    await t.expect(await challengeOktaVerifyPushPageObject.switchAuthenticatorLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
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
  .requestHooks(pushWaitMock)('Warning callout appears after 30 seconds', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await t.wait(30500);
    const warningBox = challengeOktaVerifyPushPageObject.getWarningBox();
    await t.expect(warningBox.innerText)
      .eql('Haven\'t received a push notification yet? Try opening the Okta Verify App on your phone.');
  });
