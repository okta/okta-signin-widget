import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
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

let shouldProceed = false;
const pushSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    if (!userVariables.gen3 || shouldProceed) {
      res.setBody(success);
    } else {
      res.setBody(pushPoll);
    }
  })
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const pushPollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushPoll);

const pushWaitMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushPoll);

const pushAutoChallengeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPollAutoChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(pushPollAutoChallenge);

fixture('Challenge Okta Verify Push');

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  await t.expect(challengeOktaVerifyPushPageObject.formExists()).eql(true);
  return challengeOktaVerifyPushPageObject;
}

test
  .requestHooks(pushPollMock)('challenge ov push screen has right labels and logo', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'okta_verify',
      methodType: 'push',
    });

    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitle();
    const pageSubtitle = challengeOktaVerifyPushPageObject.getFormSubtitle();
    const pushBtn = challengeOktaVerifyPushPageObject.getPushButton();
    const a11ySpan = challengeOktaVerifyPushPageObject.getA11ySpan();
    const logoSelector = challengeOktaVerifyPushPageObject.getBeaconSelector();
    if (!userVariables.gen3) {
      await t.expect(pushBtn.textContent).contains('Push notification sent');
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
      await t.expect(await challengeOktaVerifyPushPageObject.isPushButtonDisabled()).ok();
      await t.expect(pageTitle).contains('Get a push notification');
    } else {
      await t.expect(pageTitle).contains('Push notification sent');
      await t.expect(pageSubtitle).contains('Respond on your mobile device to continue.');
    }

    await t.expect(logoSelector).contains('mfa-okta-verify');
    await t.expect(logoSelector).notContains('custom-app-logo');
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists()).notOk();

    // Verify links
    await t.expect(await challengeOktaVerifyPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(pushAutoChallengeMock)('challenge ov push screen has right labels and a checkbox', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'okta_verify',
      methodType: 'push',
    });

    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitle();
    const pageSubtitle = challengeOktaVerifyPushPageObject.getFormSubtitle();
    const pushBtn = challengeOktaVerifyPushPageObject.getPushButton();
    const a11ySpan = challengeOktaVerifyPushPageObject.getA11ySpan();
    const checkbox = challengeOktaVerifyPushPageObject.getAutoChallengeCheckbox();
    const checkboxLabelText = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabelText();
    if (!userVariables.gen3) {
      await t.expect(pushBtn.textContent).contains('Push notification sent');
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
      await t.expect(await challengeOktaVerifyPushPageObject.isPushButtonDisabled()).ok();
      await t.expect(pageTitle).contains('Get a push notification');
    } else {
      await t.expect(pageTitle).contains('Push notification sent');
      await t.expect(pageSubtitle).contains('Respond on your mobile device to continue.');
    }

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

test
  .requestHooks(logger, pushAutoChallengeMock)('should call polling API and checkbox should be clickable after polling started', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    const checkbox = challengeOktaVerifyPushPageObject.getAutoChallengeCheckbox();
    const checkboxLabelText = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabelText();
    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists()).ok();
    await t.expect(checkbox.checked).ok();
    await t.expect(checkboxLabelText).eql('Send push automatically');
    // wait for polling to start
    await t.wait(4000);
    // polling API should be called
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }
    const {
      request: {
        body: answerRequestBodyString,
        method: answerRequestMethod,
        url: answerRequestUrl,
      }
    } = logger.requests[0];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).contains({
      stateHandle: '02PVkP3FJyDnqUKkkxIZhxbsx7a2S-hC1JxIE6AXzp',
    });
    if (!userVariables.gen3) {
      await t.expect(answerRequestBody).contains({
        autoChallenge: true,
      });
    }
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/authenticators/poll');

    // unselect checkbox on click
    await challengeOktaVerifyPushPageObject.clickAutoChallengeCheckbox();
    await t.expect(checkbox.checked).notOk();
  });
  
test
  .requestHooks(logger, pushSuccessMock)('challenge okta verify push request', async t => {
    await setup(t);
    await checkA11y(t);
    if (userVariables.gen3) {
      shouldProceed = true;
      // wait for additional poll
      await t.wait(4000);
    }
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    // additional poll request happens in v3 because of OKTA-587189
    const expectedLogCount = userVariables.gen3 ? 2 : 1;
    await t.expect(logger.count(() => true)).eql(expectedLogCount);

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
    shouldProceed = false;
  });

test
  .requestHooks(pushWaitMock)('Warning callout appears after 30 seconds', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await t.wait(30500);
    const warningBox = challengeOktaVerifyPushPageObject.getWarningBox();
    await t.expect(warningBox.innerText)
      .contains('Haven\'t received a push notification yet? Try opening the Okta Verify App on your phone.');
  });
