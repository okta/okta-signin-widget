import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';

import pushPoll from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import pushReject from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-reject-push';
import pushUpgradeOktaVerify from '../../../playground/mocks/data/idp/idx/okta-verify-version-upgrade';
import pushEnableBiometricsOktaVerify from '../../../playground/mocks/data/idp/idx/okta-verify-uv-verify-enable-biometrics';

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

const pushOktaVerifyUpgradeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushUpgradeOktaVerify);

const pushEnableBiometricsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushEnableBiometricsOktaVerify);

fixture('Challenge Okta Verify Push Resend');

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  await t.expect(challengeOktaVerifyPushPageObject.formExists()).ok();
  return challengeOktaVerifyPushPageObject;
}

test
  .requestHooks(pushRejectMock)('challenge okta verify with rejected push', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitle();
    await t.expect(pageTitle).contains('Get a push notification');
    const errorBox = challengeOktaVerifyPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText).contains('You have chosen to reject this login.');
    const resendPushBtn = challengeOktaVerifyPushPageObject.getResendPushButton();
    await t.expect(challengeOktaVerifyPushPageObject.form.getButton('Resend push notification').exists).eql(true);
    await t.expect(resendPushBtn.hasClass('link-button-disabled')).notOk();

    // Verify links
    await t.expect(await challengeOktaVerifyPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(logger, pushRejectMock)('challenge okta verify resend push request', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
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
  .requestHooks(logger, pushOktaVerifyUpgradeMock)('challenge okta verify resend push with version upgrade message', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitleWithError();
    await t.expect(pageTitle).contains('Get a push notification');
    const errorBox = challengeOktaVerifyPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText).contains('Your response was received, but your Okta Verify version is no longer supported by your organization. To verify your identity with push notifications, update Okta Verify to the latest version, then try again.');
    await t.expect(challengeOktaVerifyPushPageObject.getErrorTitle()).contains('Update Okta Verify');
    const resendPushBtn = challengeOktaVerifyPushPageObject.getResendPushButton();
    await t.expect(challengeOktaVerifyPushPageObject.form.getButton('Resend push notification').exists).eql(true);
    await t.expect(resendPushBtn.hasClass('link-button-disabled')).notOk();
  });

test
  .requestHooks(logger, pushEnableBiometricsMock)('challenge okta verify resend push with uv enable biometrics message', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await challengeOktaVerifyPushPageObject.waitForErrorBox();
    const pageTitle = challengeOktaVerifyPushPageObject.getFormTitleWithError();
    await t.expect(pageTitle).contains('Get a push notification');
    const errorBox = challengeOktaVerifyPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText).contains('Your response was received, but your organization requires biometrics. Make sure you meet the following requirements, then try again:');
    await t.expect(challengeOktaVerifyPushPageObject.getErrorTitle()).contains('Enable biometrics in Okta Verify');

    const errorSubtitleBullet1 = challengeOktaVerifyPushPageObject.getNthErrorBulletPoint(0);
    await t.expect(errorSubtitleBullet1).contains('Your device supports biometrics');
    const errorSubtitleBullet2 = challengeOktaVerifyPushPageObject.getNthErrorBulletPoint(1);
    await t.expect(errorSubtitleBullet2).contains('Okta Verify is up-to-date');
    const errorSubtitleBullet3 = challengeOktaVerifyPushPageObject.getNthErrorBulletPoint(2);
    await t.expect(errorSubtitleBullet3).contains('In Okta Verify, biometrics are enabled for your account');

    const resendPushBtn = challengeOktaVerifyPushPageObject.getResendPushButton();
    await t.expect(challengeOktaVerifyPushPageObject.form.getButton('Resend push notification').exists).eql(true);
    await t.expect(resendPushBtn.hasClass('link-button-disabled')).notOk();
  });

