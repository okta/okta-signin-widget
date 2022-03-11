import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeGoogleAuthenticatorPageObject from '../framework/page-objects/ChallengeGoogleAuthenticatorPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';

import otpChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-google-authenticator';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidPasscode from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-on-google-otp-invalid-passcode';
import usedPasscode from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-on-google-otp-used-passcode';

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

const invalidPasscodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(otpChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidPasscode, 403);

const usedPasscodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(otpChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(usedPasscode, 403);


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

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeGoogleAuthenticatorPageObject.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await challengeGoogleAuthenticatorPageObject.signoutLinkExists()).ok();
    await t.expect(challengeGoogleAuthenticatorPageObject.getSignoutLinkText()).eql('Back to sign in');

    await challengeGoogleAuthenticatorPageObject.verifyFactor('credentials.passcode', '1234');
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
        passcode: '1234',
      },
      stateHandle: '02UxxOzemJmZMFgNfWePmTbaWZvWyJyr-7hi_ps4Iu'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(invalidPasscodeMock)('challenge google authenticator with invalid passcode', async t => {
    const challengeGoogleAuthenticatorPageObject = await setup(t);
    await challengeGoogleAuthenticatorPageObject.verifyFactor('credentials.passcode', '123');
    await challengeGoogleAuthenticatorPageObject.clickNextButton();
    await t.expect(challengeGoogleAuthenticatorPageObject.getAnswerInlineError()).eql('Your code doesn\'t match our records. Please try again.');
  });

test
  .requestHooks(usedPasscodeMock)('challenge google authenticator with used passcode', async t => {
    const challengeGoogleAuthenticatorPageObject = await setup(t);
    await challengeGoogleAuthenticatorPageObject.verifyFactor('credentials.passcode', '123');
    await challengeGoogleAuthenticatorPageObject.clickNextButton();
    await t.expect(challengeGoogleAuthenticatorPageObject.getAnswerInlineError()).eql('Each code can only be used once. Please wait for a new code and try again.');
  });

test.requestHooks(validOTPmock)('should show custom factor page link', async t => {
  const challengeGoogleAuthenticatorPageObject = await setup(t);

  await renderWidget({
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });

  await t.expect(challengeGoogleAuthenticatorPageObject.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(challengeGoogleAuthenticatorPageObject.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});
