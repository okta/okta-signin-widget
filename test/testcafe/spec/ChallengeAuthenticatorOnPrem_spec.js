import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import xhrAuthenticatorRequiredOnPrem from '../../../playground/mocks/data/idp/idx/authenticator-verification-on-prem';
import xhrInvalidPasscode from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-on-prem';
import xhrPasscodeChange from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-passcode-change-on-prem';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import ChallengeOnPremPageObject from '../framework/page-objects/ChallengeOnPremPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';

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

fixture('Challenge Authenticator On Prem').meta('v3', true);

async function setup(t) {
  const challengeOnPremPage = new ChallengeOnPremPageObject(t);
  await challengeOnPremPage.navigateToPage();
  await t.expect(challengeOnPremPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'mfa-verify-totp',
    formName: 'challenge-authenticator',
    authenticatorKey: 'onprem_mfa',
    methodType: 'otp'
  });
  return challengeOnPremPage;
}

test.requestHooks(mockChallengeAuthenticatorOnPrem)('challenge on prem authenticator', async t => {
  const challengeOnPremPage = await setup(t);
  await checkA11y(t);
  const pageTitle = challengeOnPremPage.getFormTitle();
  const saveBtnText = challengeOnPremPage.getSaveButtonLabel();
  await t.expect(saveBtnText).contains('Verify');
  await t.expect(pageTitle).contains('Verify with Atko Custom On-prem');

  // Verify links
  await t.expect(await challengeOnPremPage.verifyWithSomethingElseLinkExists()).ok();
  await t.expect(await challengeOnPremPage.getCancelLink().exists).ok();

  // verify passcode
  await challengeOnPremPage.verifyFactor('credentials.passcode', 'test');
  await challengeOnPremPage.clickNextButton('Verify');
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockChallengeAuthenticatorOnPrem)('passcode is required', async t => {
  const challengeOnPremPage = await setup(t);
  await checkA11y(t);

  // verify passcode
  await challengeOnPremPage.verifyFactor('credentials.passcode', '');
  await challengeOnPremPage.clickNextButton('Verify');

  await challengeOnPremPage.waitForErrorBox();
  await t.expect(challengeOnPremPage.getPasscodeError()).eql('This field cannot be left blank');
});

test.requestHooks(mockInvalidPasscode)('challenge on prem authenticator with invalid passcode', async t => {
  const challengeOnPremPage = await setup(t);
  await checkA11y(t);
  await challengeOnPremPage.verifyFactor('credentials.passcode', 'test');
  await challengeOnPremPage.clickNextButton('Verify');

  await t.expect(challengeOnPremPage.getInvalidOTPError())
    .eql('Invalid code. Try again.');
});

test.requestHooks(mockPasscodeChange)('displays error and clears passcode when passcode change response', async t => {
  const challengeOnPremPage = await setup(t);
  await checkA11y(t);
  await challengeOnPremPage.verifyFactor('credentials.passcode', 'test');
  await challengeOnPremPage.clickNextButton('Verify');

  await t.expect(challengeOnPremPage.getInvalidOTPError())
    .eql('Pin accepted, Wait for token to change, then enter new passcode.');
  await t.expect(challengeOnPremPage.getPasscodeValue())
    .eql('');
});

test.requestHooks(mockChallengeAuthenticatorOnPrem)('should show custom factor page link', async t => {
  const challengeOnPremPage = await setup(t);
  await checkA11y(t);

  await renderWidget({
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });

  await t.expect(challengeOnPremPage.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(challengeOnPremPage.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});
