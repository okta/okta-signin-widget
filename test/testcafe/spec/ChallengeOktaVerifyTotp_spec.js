import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeOktaVerifyTotpPageObject from '../framework/page-objects/ChallengeOktaVerifyTotpPageObject';
import { checkConsoleMessages } from '../framework/shared';

import totpChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-totp';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidTOTP from '../../../playground/mocks/data/idp/idx/error-okta-verify-totp';
import errorEnableBiometricsOktaVerifyTotp from '../../../playground/mocks/data/idp/idx/error-okta-verify-uv-totp-verify-enable-biometrics';

const logger = RequestLogger(/challenge|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const validTOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(totpChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidTOTPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(totpChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidTOTP, 403);

const totpEnableBiometricsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(totpChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(errorEnableBiometricsOktaVerifyTotp, 400);

fixture('Challenge Okta Verify Totp Form');

async function setup(t) {
  const challengeOktaVerifyTOTPPageObject = new ChallengeOktaVerifyTotpPageObject(t);
  await challengeOktaVerifyTOTPPageObject.navigateToPage();
  return challengeOktaVerifyTOTPPageObject;
}

test
  .requestHooks(logger, validTOTPmock)('challenge okta verify with valid TOTP', async t => {
    const challengeOktaVerifyTOTPPageObject = await setup(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-authenticator',
      authenticatorKey: 'okta_verify',
      methodType: 'totp',
    });

    const pageTitle = challengeOktaVerifyTOTPPageObject.getPageTitle();
    const saveBtnText = challengeOktaVerifyTOTPPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Enter a code');
    await t.expect(await challengeOktaVerifyTOTPPageObject.getTotpLabel())
      .contains('Enter code from Okta Verify app');

    // Verify links
    await t.expect(await challengeOktaVerifyTOTPPageObject.switchAuthenticatorLinkExists()).ok();
    await t.expect(challengeOktaVerifyTOTPPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeOktaVerifyTOTPPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyTOTPPageObject.getSignoutLinkText()).eql('Back to sign in');

    await challengeOktaVerifyTOTPPageObject.verifyFactor('credentials.totp', '1234');
    await challengeOktaVerifyTOTPPageObject.clickNextButton();
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
        totp: '1234',
      },
      stateHandle: '022P5Fd8jBy3b77XEdFCqnjz__5wQxksRfrAS4z6wP'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(invalidTOTPMock)('challenge okta verify with invalid TOTP', async t => {
    const challengeOktaVerifyTOTPPageObject = await setup(t);
    await challengeOktaVerifyTOTPPageObject.verifyFactor('credentials.totp', '123');
    await challengeOktaVerifyTOTPPageObject.clickNextButton();
    await t.expect(challengeOktaVerifyTOTPPageObject.getAnswerInlineError()).contains('Invalid code. Try again.');
  });

test
  .requestHooks(logger, totpEnableBiometricsMock)('challenge okta verify totp uv enable biometrics message', async t => {
    const challengeOktaVerifyTOTPPageObject = await setup(t);
    await challengeOktaVerifyTOTPPageObject.verifyFactor('credentials.totp', '123');
    await challengeOktaVerifyTOTPPageObject.clickNextButton();
    const pageTitle = challengeOktaVerifyTOTPPageObject.getFormTitle();
    await t.expect(pageTitle).contains('Enter a code');
    await challengeOktaVerifyTOTPPageObject.waitForErrorBox();
    const errorTitle = challengeOktaVerifyTOTPPageObject.getErrorTitle();
    await t.expect(errorTitle.innerText).contains('Enable biometrics in Okta Verify');
    const errorSubtitle = challengeOktaVerifyTOTPPageObject.getErrorSubtitle();
    await t.expect(errorSubtitle.innerText).contains('Your response was received, but your organization requires biometrics. Make sure you meet the following requirements, then try again:');
    const errorSubtitleBullet1 = challengeOktaVerifyTOTPPageObject.getNthErrorBulletPoint(0);
    await t.expect(errorSubtitleBullet1.innerText).contains('Your device supports biometrics');
    const errorSubtitleBullet2 = challengeOktaVerifyTOTPPageObject.getNthErrorBulletPoint(1);
    await t.expect(errorSubtitleBullet2.innerText).contains('Okta Verify is up-to-date');
    const errorSubtitleBullet3 = challengeOktaVerifyTOTPPageObject.getNthErrorBulletPoint(2);
    await t.expect(errorSubtitleBullet3.innerText).contains('In Okta Verify, biometrics are enabled for your account');
  });
