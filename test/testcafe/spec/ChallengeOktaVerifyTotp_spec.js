import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeOktaVerifyTotpPageObject from '../framework/page-objects/ChallengeOktaVerifyTotpPageObject';

import totpChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-totp';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidTOTP from '../../../playground/mocks/data/idp/idx/error-okta-verify-totp';

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


fixture('Challenge Okta Verify Totp Form');

async function setup(t) {
  const challengeOktaVerifyTOTPPageObject = new ChallengeOktaVerifyTotpPageObject(t);
  await challengeOktaVerifyTOTPPageObject.navigateToPage();
  return challengeOktaVerifyTOTPPageObject;
}

test
  .requestHooks(logger, validTOTPmock)('challenge okta verify with valid TOTP', async t => {
    const challengeOktaVerifyTOTPPageObject = await setup(t);

    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.length).eql(3);
    await t.expect(log[0]).eql('===== playground widget ready event received =====');
    await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[2])).eql({
      controller: 'mfa-verify',
      formName: 'challenge-authenticator',
      authenticatorType: 'app',
    });

    const pageTitle = challengeOktaVerifyTOTPPageObject.getPageTitle();
    const saveBtnText = challengeOktaVerifyTOTPPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Enter a code');
    await t.expect(await challengeOktaVerifyTOTPPageObject.getTotpLabel())
      .contains('Enter code from Okta Verify app');

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
    await challengeOktaVerifyTOTPPageObject.waitForErrorBox();
    await t.expect(challengeOktaVerifyTOTPPageObject.getInvalidOTPError()).contains('Authentication failed');
  });
