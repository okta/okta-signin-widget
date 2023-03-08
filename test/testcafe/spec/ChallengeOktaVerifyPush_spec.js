import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';
import { checkConsoleMessages, oktaDashboardContent } from '../framework/shared';

import pushPoll from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import success from '../../../playground/mocks/data/idp/idx/success';
import pushPollAutoChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push-autoChallenge-on';

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
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

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

fixture('Challenge Okta Verify Push')
  .meta('v3', true);

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  await t.expect(challengeOktaVerifyPushPageObject.formExists()).eql(true);
  return challengeOktaVerifyPushPageObject;
}

test
  .requestHooks(pushSuccessMock)('challenge ov push screen has right labels and logo', async t => {
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
    const logoClass = challengeOktaVerifyPushPageObject.getBeaconClass();
    await t.expect(pushBtn.textContent).contains('Push notification sent');
    if (!userVariables.v3) {
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
    }

    await t.expect(await challengeOktaVerifyPushPageObject.isPushButtonDisabled()).ok();
    await t.expect(logoClass).contains('mfa-okta-verify');
    await t.expect(logoClass).notContains('custom-app-logo');
    await t.expect(pageTitle).contains('Get a push notification');
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists()).notOk();

    // Verify links
    await t.expect(await challengeOktaVerifyPushPageObject.verifyWithSomethingElseLinkExists()).ok();
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
    const checkbox = challengeOktaVerifyPushPageObject.getAutoChallengeCheckbox();
    const checkboxLabelText = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabelText();
    await t.expect(pushBtn.textContent).contains('Push notification sent');
    if (!userVariables.v3) {
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
    }

    await t.expect(await challengeOktaVerifyPushPageObject.isPushButtonDisabled()).ok();
    await t.expect(pageTitle).contains('Get a push notification');
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists()).ok();
    await t.expect(checkbox.checked).ok();
    await t.expect(checkboxLabelText).eql('Send push automatically');

    // unselect checkbox on click
    await challengeOktaVerifyPushPageObject.clickAutoChallengeCheckbox();
    await t.expect(checkbox.checked).notOk();

    // Verify links
    await t.expect(await challengeOktaVerifyPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

// V3 - Polling fails with AssertionError: expected 8 to deeply equal 1
test
  .requestHooks(logger, pushWaitAutoChallengeMock)('should call polling API and checkbox should be clickable after polling started', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    const checkbox = challengeOktaVerifyPushPageObject.getAutoChallengeCheckbox();
    const checkboxLabelText = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabelText();
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists()).ok();
    await t.expect(checkbox.checked).ok();
    await t.expect(checkboxLabelText).eql('Send push automatically');
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
    await challengeOktaVerifyPushPageObject.clickAutoChallengeCheckbox();
    await t.expect(checkbox.checked).notOk();
  });

// V3 - Works if line 47 is commented (wait for challenge OV page to load) - will pass after polling issue is fixed
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
