import { RequestMock } from 'testcafe';
import xhrAuthenticatorRequiredOnPrem from '../../../playground/mocks/data/idp/idx/authenticator-verification-on-prem';
import xhrInvalidPasscode from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-on-prem';
import xhrPasscodeChange from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-passcode-change-on-prem';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import ChallengeOnPremPageObject from '../framework/page-objects/ChallengeOnPremPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

const mockChallengeAuthenticatorOnPrem = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredOnPrem)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const mockInvalidPasscode = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredOnPrem)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrInvalidPasscode, 403);

const mockPasscodeChange = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredOnPrem)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrPasscodeChange, 403);

fixture('Challenge Authenticator On Prem');

async function setup(t) {
  const challengeOnPremPage = new ChallengeOnPremPageObject(t);
  await challengeOnPremPage.navigateToPage();
  return challengeOnPremPage;
}

test.requestHooks(mockChallengeAuthenticatorOnPrem)('challenge on prem authenticator', async t => {
  const challengeOnPremPage = await setup(t);

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'mfa-verify-webauthn', // We need to change ViewClassNamesFactory to use authenticatorKey
    formName: 'challenge-authenticator',
    authenticatorKey: 'del_oath',
    methodType: 'otp'
  });

  const pageTitle = challengeOnPremPage.getPageTitle();
  const saveBtnText = challengeOnPremPage.getSaveButtonLabel();
  await t.expect(saveBtnText).contains('Verify');
  await t.expect(pageTitle).contains('Verify with Atko Custom On-prem');

  // verify passcode
  await challengeOnPremPage.verifyFactor('credentials.passcode', 'test');
  await challengeOnPremPage.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockChallengeAuthenticatorOnPrem)('passcode is required', async t => {
  const challengeOnPremPage = await setup(t);

  // verify passcode
  await challengeOnPremPage.verifyFactor('credentials.passcode', '');
  await challengeOnPremPage.clickNextButton();

  await challengeOnPremPage.waitForErrorBox();
  await t.expect(challengeOnPremPage.getPasscodeError()).eql('This field cannot be left blank');
});

test.requestHooks(mockInvalidPasscode)('challege on prem authenticator with invalid passcode', async t => {
  const challengeOnPremPage = await setup(t);
  await challengeOnPremPage.verifyFactor('credentials.passcode', 'test');
  await challengeOnPremPage.clickNextButton();

  await t.expect(challengeOnPremPage.getInvalidOTPError())
    .eql('Invalid code. Try again.');
});

test.requestHooks(mockPasscodeChange)('displays error and clears passcode when passcode change response', async t => {
  const challengeOnPremPage = await setup(t);
  await challengeOnPremPage.verifyFactor('credentials.passcode', 'test');
  await challengeOnPremPage.clickNextButton();

  await t.expect(challengeOnPremPage.getInvalidOTPError())
    .eql('Wait for token to change, then enter the new tokencode.');
  await t.expect(challengeOnPremPage.getPasscodeValue())
    .eql('');
});
