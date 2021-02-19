import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeGoogleAuthenticatorPageObject from '../framework/page-objects/ChallengeGoogleAuthenticatorPageObject';
import { checkConsoleMessages } from '../framework/shared';

import otpChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-google-authenticator';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidTOTP from '../../../playground/mocks/data/idp/idx/error-google-authenticator-otp';

const logger = RequestLogger(/challenge|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(otpChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidOTPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(otpChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidTOTP, 403);


fixture('Challenge Google Authenticator Form');

async function setup(t) {
  const challengeGoogleAuthenticatorPageObject = new ChallengeGoogleAuthenticatorPageObject(t);
  await challengeGoogleAuthenticatorPageObject.navigateToPage();
  return challengeGoogleAuthenticatorPageObject;
}

test
  .requestHooks(logger, validOTPmock)('challenge google authenticator with valid OTP', async t => {
    const challengeGoogleAuthenticatorPageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-authenticator',
      authenticatorKey: 'google_otp',
      methodType: 'otp',
    });

    const pageTitle = challengeGoogleAuthenticatorPageObject.getPageTitle();
    const saveBtnText = challengeGoogleAuthenticatorPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Google Authenticator');
    await t.expect(await challengeGoogleAuthenticatorPageObject.getOtpLabel())
      .contains('Enter code');

    await challengeGoogleAuthenticatorPageObject.verifyFactor('credentials.otp', '1234');
    await challengeGoogleAuthenticatorPageObject.clickNextButton();
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
        otp: '1234',
      },
      stateHandle: '02UxxOzemJmZMFgNfWePmTbaWZvWyJyr-7hi_ps4Iu'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(invalidOTPMock)('challenge google authenticator with invalid TOTP', async t => {
    const challengeGoogleAuthenticatorPageObject = await setup(t);
    await challengeGoogleAuthenticatorPageObject.verifyFactor('credentials.otp', '123');
    await challengeGoogleAuthenticatorPageObject.clickNextButton();
    await challengeGoogleAuthenticatorPageObject.waitForErrorBox();
    await t.expect(challengeGoogleAuthenticatorPageObject.getInvalidOTPError()).contains('Authentication failed');
  });
