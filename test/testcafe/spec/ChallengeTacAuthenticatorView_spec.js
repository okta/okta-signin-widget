import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import xhrAuthenticatorTac from '../../../playground/mocks/data/idp/idx/authenticator-verification-tac';
import invalidTacMock from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-tac';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import ChallengeTacPageObject from '../framework/page-objects/ChallengeTacPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';

const mockChallengeAuthenticatorTac = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorTac)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const mockInvalidPasscode = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorTac)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidTacMock, 403);

fixture('Challenge Authenticator TAC');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const challengeTacPage = new ChallengeTacPageObject(t);
  await challengeTacPage.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(challengeTacPage.formExists()).eql(true);
  return challengeTacPage;
}

test.requestHooks(mockChallengeAuthenticatorTac)('challenge TAC authenticator', async t => {
  const challengeTacPage = await setup(t);
  await checkA11y(t);
  await checkConsoleMessages({
    controller: null,
    formName: 'challenge-authenticator',
    authenticatorKey: 'tac',
    methodType: 'tac',
  });
  const pageTitle = challengeTacPage.getFormTitle();
  const saveBtnText = challengeTacPage.getSaveButtonLabel();
  await t.expect(saveBtnText).contains('Verify');
  await t.expect(pageTitle).contains('Verify with Temporary Access Code');
  await t.expect(challengeTacPage.getFormSubtitle()).eql('Enter the code provided by your administrator. Contact your administrator if you need a new code.');

  // verify otp
  await challengeTacPage.verifyFactor('credentials.passcode', '1234');
  await challengeTacPage.clickNextButton('Verify');
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockChallengeAuthenticatorTac)('TAC is required', async t => {
  const challengeTacPage = await setup(t);
  await checkA11y(t);

  // verify otp
  await challengeTacPage.verifyFactor('credentials.passcode', '');
  await t.pressKey('tab');
  await challengeTacPage.clickNextButton('Verify');

  await challengeTacPage.waitForErrorBox();
  await t.expect(challengeTacPage.getPasscodeError()).match(/This field cannot be left blank/);
});

test.requestHooks(mockInvalidPasscode)('challege TAC authenticator with invalid passcode', async t => {
  const challengeTacPage = await setup(t);
  await checkA11y(t);
  await challengeTacPage.verifyFactor('credentials.passcode', 'test');
  await challengeTacPage.clickNextButton('Verify');
  await challengeTacPage.waitForErrorBox();
  await t.expect(challengeTacPage.getInvalidOTPError()).contains('We found some errors.');
  await t.expect(challengeTacPage.getInvalidOTPFieldError()).contains('Invalid code. Try again.');
});

test.requestHooks(mockChallengeAuthenticatorTac)('should show custom factor page link', async t => {
  const challengeTacPage = await setup(t, {
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });
  await checkA11y(t);

  await t.expect(challengeTacPage.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(challengeTacPage.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});
