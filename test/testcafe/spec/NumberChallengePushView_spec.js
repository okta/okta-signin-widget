import { RequestMock, RequestLogger } from 'testcafe';
import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';
import { a11yCheck, checkConsoleMessages } from '../framework/shared';

import numberChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-number-challenge';
import success from '../../../playground/mocks/data/idp/idx/success';
import serverError from '../../../playground/mocks/data/idp/idx/error-internal-server-error.json';

const logger = RequestLogger(/challenge|challenge\/poll/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const numberChallengeSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(numberChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(success);

const numberChallengeWaitMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(numberChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(numberChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/resend')
  .respond(numberChallenge);

const serverErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(numberChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(serverError);


fixture('Number Challenge Okta Verify Push');

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  await a11yCheck(t);
  return challengeOktaVerifyPushPageObject;
}

test
  .requestHooks(numberChallengeSuccessMock)('number challenge screen has right labels', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'okta_verify',
      methodType: 'push',
    });
    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitle();
    await t.expect(pageTitle).contains('Push notification sent');
  });

test
  .requestHooks(logger, numberChallengeWaitMock)('Calls resend when we click the resend link from within the warning modal', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await t.wait(30500);
    let warningBox = challengeOktaVerifyPushPageObject.getWarningBox();
    await t.expect(warningBox.visible).ok();
    await t.expect(warningBox.innerText)
      .eql('Haven\'t received a push notification yet? Try opening the Okta Verify app on your device, or resend the push notification.');
    // click resend number challenge
    challengeOktaVerifyPushPageObject.clickResendNumberChallenge();
    await t.expect(logger.count(() => true)).eql(8);
    const req = logger.requests[7].request;
    const reqBody = JSON.parse(req.body);
    await t.expect(reqBody).eql({
      stateHandle: '02im-3M2f6UXHgNfS7Ns7C85EKHzGaKw0u1CC4p9_r',
    });
    await t.expect(req.method).eql('post');
    await t.expect(req.url).eql('http://localhost:3000/idp/idx/challenge/resend');
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    await t.expect(warningBox.visible).notOk();
  });

test
  .requestHooks(logger, serverErrorMock)('Stops polling if error is encountered', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    // wait and see that there is only one call for poll
    await t.wait(5000);
    let warningBox = challengeOktaVerifyPushPageObject.getWarningBox();
    await t.expect(logger.count(() => true)).eql(1);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    await t.expect(warningBox.visible).notOk();
    const error = challengeOktaVerifyPushPageObject.getErrorBox().textContent;
    await t.expect(error).contains('Internal Server Error');
  });
