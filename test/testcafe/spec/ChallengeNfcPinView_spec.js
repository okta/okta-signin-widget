import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import ChallengeNfcPinPageObject from '../framework/page-objects/ChallengeNfcPinPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrNfcPinDeviceChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-nfc-pin-device-challenge';
import xhrNfcPinVerify from '../../../playground/mocks/data/idp/idx/authenticator-verification-nfc-pin';
import xhrNfcPinSuccess from '../../../playground/mocks/data/idp/idx/authenticator-verification-nfc-pin-success';
import xhrNfcPinInvalidPasscode from '../../../playground/mocks/data/idp/idx/error-nfc-pin-invalid-passcode';
import xhrForgotPasswordError from '../../../playground/mocks/data/idp/idx/error-forgot-password';

const mockNfcPinVerifyFlow = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrNfcPinSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const mockNfcPinInvalidPin = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrNfcPinInvalidPasscode, 403);

const mockNfcPinForgotPinError = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinVerify)
  .onRequestTo('http://localhost:3000/idp/idx/recover')
  .respond(xhrForgotPasswordError, 403);

// Mock that keeps polling (stays on device challenge screen)
const mockNfcPinDeviceChallengeStays = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinDeviceChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(xhrNfcPinDeviceChallenge);

// Mock that transitions from device challenge to PIN entry on first poll
const mockNfcPinDeviceChallengeFlow = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinDeviceChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(xhrNfcPinVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrNfcPinSuccess);

fixture('Challenge NFC PIN Authenticator');

async function setup(t) {
  const challengeNfcPinPage = new ChallengeNfcPinPageObject(t);
  await challengeNfcPinPage.navigateToPage();
  await t.expect(challengeNfcPinPage.formExists()).eql(true);
  return challengeNfcPinPage;
}

test
  .requestHooks(mockNfcPinVerifyFlow)('shows PIN entry screen with correct title and field', async t => {
    const challengeNfcPinPage = await setup(t);
    await checkA11y(t);

    const pageTitle = challengeNfcPinPage.getFormTitle();
    await t.expect(pageTitle).contains('Verify with your PIN');
  });

test
  .requestHooks(mockNfcPinVerifyFlow)('shows Forgot PIN and switch authenticator links', async t => {
    const challengeNfcPinPage = await setup(t);

    await t.expect(await challengeNfcPinPage.forgotPinLinkExists()).ok();
    await t.expect(await challengeNfcPinPage.switchAuthenticatorExists()).ok();
  });

test
  .requestHooks(mockNfcPinVerifyFlow)('can enter PIN and submit', async t => {
    const challengeNfcPinPage = await setup(t);

    await challengeNfcPinPage.fillPin('1234');
    await challengeNfcPinPage.clickVerifyButton();
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl).contains('/app/UserHome');
  });

test
  .requestHooks(mockNfcPinInvalidPin)('shows error when PIN is invalid', async t => {
    const challengeNfcPinPage = await setup(t);

    await challengeNfcPinPage.fillPin('0000');
    await challengeNfcPinPage.clickVerifyButton();

    await t.expect(challengeNfcPinPage.form.getErrorBoxText()).contains('Incorrect PIN. Please try again.');
  });

test
  .requestHooks(mockNfcPinForgotPinError)('shows error when Forgot PIN recovery is not allowed', async t => {
    const challengeNfcPinPage = await setup(t);

    await t.expect(await challengeNfcPinPage.forgotPinLinkExists()).ok();
    const forgotPinLink = challengeNfcPinPage.form.getLink('Forgot PIN?');
    await t.click(forgotPinLink);

    await t.expect(challengeNfcPinPage.form.getErrorBoxText())
      .contains('Reset password is not allowed at this time');
  });

test
  .requestHooks(mockNfcPinDeviceChallengeStays)('shows NFC intermediate screen with Open Okta Verify button', async t => {
    const challengeNfcPinPage = await setup(t);
    await checkA11y(t);

    const pageTitle = challengeNfcPinPage.getFormTitle();
    await t.expect(pageTitle).contains('Verify with NFC');
    await t.expect(await challengeNfcPinPage.openOktaVerifyButtonExists()).ok();
  });

test
  .requestHooks(mockNfcPinDeviceChallengeFlow)('transitions from device challenge to PIN entry after polling', async t => {
    const challengeNfcPinPage = await setup(t);

    // Wait for polling to transition to PIN entry
    const pageTitle = challengeNfcPinPage.getFormTitle();
    await t.expect(pageTitle).contains('Verify with your PIN', { timeout: 15000 });
  });
