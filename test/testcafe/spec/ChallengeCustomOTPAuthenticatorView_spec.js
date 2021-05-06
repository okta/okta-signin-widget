import { RequestMock } from 'testcafe';
import xhrAuthenticatorVerifyCustomOTP from '../../../playground/mocks/data/idp/idx/authenticator-verification-custom-otp';
import xhrInvalidOTP from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-custom-otp';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import ChallengeCustomOTPPageObject from '../framework/page-objects/ChallengeCustomOTPPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';

const mockChallengeAuthenticatorCustomOTP = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyCustomOTP)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const mockInvalidPasscode = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyCustomOTP)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrInvalidOTP, 403);

fixture('Challenge Authenticator Custom OTP');

async function setup(t) {
  const challengeCustomOTPPage = new ChallengeCustomOTPPageObject(t);
  await challengeCustomOTPPage.navigateToPage();
  return challengeCustomOTPPage;
}

test.requestHooks(mockChallengeAuthenticatorCustomOTP)('challenge custom OTP authenticator', async t => {
  const challengeCustomOTPPage = await setup(t);
  await checkConsoleMessages({
    controller: null,
    formName: 'challenge-authenticator',
    authenticatorKey: 'custom_otp',
    methodType: 'security_key',
  });
  const pageTitle = challengeCustomOTPPage.getFormTitle();
  const saveBtnText = challengeCustomOTPPage.getSaveButtonLabel();
  await t.expect(saveBtnText).contains('Verify');
  await t.expect(pageTitle).contains('Verify with Atko Custom OTP Authenticator');
  await t.expect(challengeCustomOTPPage.getFormSubtitle()).eql('Enter the code generated on your authenticator and verify.');

  // verify otp
  await challengeCustomOTPPage.verifyFactor('credentials.passcode', '1234');
  await challengeCustomOTPPage.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockChallengeAuthenticatorCustomOTP)('OTP is required', async t => {
  const challengeOnPremPage = await setup(t);

  // verify otp
  await challengeOnPremPage.verifyFactor('credentials.passcode', '');
  await challengeOnPremPage.clickNextButton();

  await challengeOnPremPage.waitForErrorBox();
  await t.expect(challengeOnPremPage.getPasscodeError()).eql('This field cannot be left blank');
});

test.requestHooks(mockInvalidPasscode)('challege custom otp authenticator with invalid passcode', async t => {
  const challengeOnPremPage = await setup(t);
  await challengeOnPremPage.verifyFactor('credentials.passcode', 'test');
  await challengeOnPremPage.clickNextButton();

  await t.expect(challengeOnPremPage.getInvalidOTPError())
    .eql('Invalid code. Try again.');
});

