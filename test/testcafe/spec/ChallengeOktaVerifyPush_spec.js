import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';
import { checkConsoleMessages } from '../framework/shared';

import pushPoll from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import success from '../../../playground/mocks/data/idp/idx/success';
import pushPollAutoChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push-autoChallenge-on';

const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name="autoChallenge"]';
const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name="autoChallenge"]';

const logger = RequestLogger(/challenge|challenge\/poll|authenticators\/poll/,
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

const pushAutoChallengeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPollAutoChallenge);

const pushWaitAutoChallengeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPollAutoChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(pushPollAutoChallenge);

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

    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitle();
    const pushBtn = challengeOktaVerifyPushPageObject.getPushButton();
    const a11ySpan = challengeOktaVerifyPushPageObject.getA11ySpan();
    await t.expect(pushBtn.textContent).contains('Push notification sent');
    await t.expect(a11ySpan.textContent).contains('Push notification sent');
    await t.expect(pushBtn.hasClass('link-button-disabled')).ok();
    await t.expect(pageTitle).contains('Get a push notification');
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists(AUTO_CHALLENGE_CHECKBOX_SELECTOR)).notOk();

    // Verify links
    await t.expect(await challengeOktaVerifyPushPageObject.switchAuthenticatorLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(pushAutoChallengeMock)('challenge ov push screen has right labels and a checkbox', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'okta_verify',
      methodType: 'push',
    });

    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitle();
    const pushBtn = challengeOktaVerifyPushPageObject.getPushButton();
    const a11ySpan = challengeOktaVerifyPushPageObject.getA11ySpan();
    const checkboxLabel = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabel(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
    await t.expect(pushBtn.textContent).contains('Push notification sent');
    await t.expect(a11ySpan.textContent).contains('Push notification sent');
    await t.expect(pushBtn.hasClass('link-button-disabled')).ok();
    await t.expect(pageTitle).contains('Get a push notification');
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists(AUTO_CHALLENGE_CHECKBOX_SELECTOR)).ok();
    await t.expect(checkboxLabel.hasClass('checked')).ok();
    await t.expect(checkboxLabel.textContent).eql('Send push automatically');

    // unselect checkbox on click
    await challengeOktaVerifyPushPageObject.clickAutoChallengeCheckbox(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
    await t.expect(checkboxLabel.hasClass('checked')).notOk();

    // Verify links
    await t.expect(await challengeOktaVerifyPushPageObject.switchAuthenticatorLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(logger, pushWaitAutoChallengeMock)('should call polling API and checkbox should be clickable after polling started', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    const checkboxLabel = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabel(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists(AUTO_CHALLENGE_CHECKBOX_SELECTOR)).ok();
    await t.expect(checkboxLabel.hasClass('checked')).ok();
    await t.expect(checkboxLabel.textContent).eql('Send push automatically');
    // wait for polling to start
    await t.wait(4000);
    // polling API should be called
    await t.expect(logger.count(() => true)).eql(1);
    const { request: {
      body: answerRequestBodyString,
      method: answerRequestMethod,
      url: answerRequestUrl,
    }
    } = logger.requests[0];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).eql({
      autoChallenge: true,
      stateHandle: '02PVkP3FJyDnqUKkkxIZhxbsx7a2S-hC1JxIE6AXzp',
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/authenticators/poll');

    // unselect checkbox on click
    await challengeOktaVerifyPushPageObject.clickAutoChallengeCheckbox(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
    await t.expect(checkboxLabel.hasClass('checked')).notOk();
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
