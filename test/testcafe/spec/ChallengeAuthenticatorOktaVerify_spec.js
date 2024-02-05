import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import { renderWidget } from '../framework/shared';
import SelectAuthenticatorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import ChallengeOktaVerifyTotpPageObject from '../framework/page-objects/ChallengeOktaVerifyTotpPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrOktaVerifyOnlyMethodsWithoutDeviceKnown from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-ov-only-without-device-known';
import xhrOktaVerifyOnlyMethodsWithDeviceKnown from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-ov-only-with-device-known';
import xhrOktaVerifyPushOnlyWithoutAutoChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-okta-verify-push-only-without-autochallenge';
import xhrChallengeTotpOktaVerifyOnly from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-totp-onlyOV';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const FORM_TITLE = 'Verify it\'s you with a security method';
const FORM_SUBTITLE = 'Select from the following options';
const ENTER_CODE_TEXT = 'Enter a code';
const FAST_PASS_TEXT = 'Use Okta FastPass';
const PUSH_NOTIFICATION_TEXT = 'Get a push notification';
const SIGN_OUT_TEXT = 'Back to sign in';

const requestLogger = RequestLogger(/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mockChallengeOVPushOnlySelectMethod = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOktaVerifyPushOnlyWithoutAutoChallenge);

const mockChallengeOVSelectMethod = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOktaVerifyOnlyMethodsWithoutDeviceKnown)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const mockChallengeOVTotpMethod = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOktaVerifyOnlyMethodsWithoutDeviceKnown)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrChallengeTotpOktaVerifyOnly)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const mockChallengeOVOnlyMethodsWithDeviceKnown = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOktaVerifyOnlyMethodsWithDeviceKnown);

fixture('Select Method screen for Okta verify');

async function verifyFactorByIndex(t, selectAuthenticatorPage, index, expectedLabel) {
  await t.expect(selectAuthenticatorPage.getFactorLabelByIndex(index)).eql(expectedLabel);
  await t.expect(selectAuthenticatorPage.getFactorDescriptionByIndex(index)).eql('Okta Verify');
  await t.expect(selectAuthenticatorPage.getFactorIconClassByIndex(index)).contains('mfa-okta-verify');
  await t.expect(selectAuthenticatorPage.getFactorSelectButtonByIndex(index)).eql('Select');
}

async function verifySelectAuthenticator(t, selectAuthenticatorPage, expectedResponse) {
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  const requestLog = requestLogger.requests[0].request;

  await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  await t.expect(requestLog.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(requestLog.method).eql('post');
  await t.expect(JSON.parse(requestLog.body)).eql(expectedResponse);
}

async function setup(t, opts = {}) {
  const { factorsCount, ...widgetOptions } = opts;
  const options = Object.keys(widgetOptions).length ? { render: false } : {};
  const selectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
  await selectAuthenticatorPageObject.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(selectAuthenticatorPageObject.formExists()).ok();
  await t.expect(selectAuthenticatorPageObject.getFormTitle()).eql(FORM_TITLE);
  await t.expect(selectAuthenticatorPageObject.getFormSubtitle()).eql(FORM_SUBTITLE);
  await t.expect(selectAuthenticatorPageObject.getFactorsCount()).eql(factorsCount ?? 3);
  return selectAuthenticatorPageObject;
}

test.requestHooks(mockChallengeOVSelectMethod)('preserve the order of authenticator list when the `deviceKnown` attribute is either null or false', async t => {
  const selectAuthenticatorPage = await setup(t);
  await checkA11y(t);

  await verifyFactorByIndex(t, selectAuthenticatorPage, 0, PUSH_NOTIFICATION_TEXT);
  await verifyFactorByIndex(t, selectAuthenticatorPage, 1, ENTER_CODE_TEXT);
  await verifyFactorByIndex(t, selectAuthenticatorPage, 2, FAST_PASS_TEXT);

  // signout link at enroll page
  await t.expect(await selectAuthenticatorPage.signoutLinkExists()).ok();
  await t.expect(selectAuthenticatorPage.getSignoutLinkText()).eql(SIGN_OUT_TEXT);
});

test.requestHooks(mockChallengeOVPushOnlySelectMethod)('authenticator list should have just the push notification', async t => {
  const selectAuthenticatorPage = await setup(t, { factorsCount: 1 });
  await checkA11y(t);

  await verifyFactorByIndex(t, selectAuthenticatorPage, 0, PUSH_NOTIFICATION_TEXT);

  // signout link at enroll page
  await t.expect(await selectAuthenticatorPage.signoutLinkExists()).ok();
  await t.expect(selectAuthenticatorPage.getSignoutLinkText()).eql(SIGN_OUT_TEXT);
});

test.requestHooks(mockChallengeOVSelectMethod)('should load select method list with okta verify and no sign-out link', async t => {
  const selectAuthenticatorPage = await setup(t, {
    features: {
      hideSignOutLinkInMFA: true
    },
  });
  await checkA11y(t);

  // signout link is not visible
  await t.expect(await selectAuthenticatorPage.signoutLinkExists()).notOk();
});

test.requestHooks(requestLogger, mockChallengeOVSelectMethod)('should send right methodType when push is selected', async t => {
  const selectAuthenticatorPage = await setup(t);
  await checkA11y(t);

  await selectAuthenticatorPage.selectFactorByIndex(0);
  await verifySelectAuthenticator(t, selectAuthenticatorPage, {
    'authenticator': {
      'id': 'aut13qrZReYpIib7R0g4',
      'methodType': 'push'
    },
    'stateHandle': '02ciZ1YTWakSanNu8GNNTnTXzhL5hoLzTlR0JewfG3'
  });
});

test.requestHooks(requestLogger, mockChallengeOVSelectMethod)('should send right methodType when totp is selected', async t => {
  const selectAuthenticatorPage = await setup(t);
  await checkA11y(t);

  await selectAuthenticatorPage.selectFactorByIndex(1);
  await verifySelectAuthenticator(t, selectAuthenticatorPage, {
    'authenticator': {
      'id': 'aut13qrZReYpIib7R0g4',
      'methodType': 'totp'
    },
    'stateHandle': '02ciZ1YTWakSanNu8GNNTnTXzhL5hoLzTlR0JewfG3'
  });
});

test.requestHooks(requestLogger, mockChallengeOVSelectMethod)('should send right methodType when fastpass is selected', async t => {
  const selectAuthenticatorPage = await setup(t);
  await checkA11y(t);

  await selectAuthenticatorPage.selectFactorByIndex(2);
  await verifySelectAuthenticator(t, selectAuthenticatorPage, {
    'authenticator': {
      'id': 'aut13qrZReYpIib7R0g4',
      'methodType': 'signed_nonce'
    },
    'stateHandle': '02ciZ1YTWakSanNu8GNNTnTXzhL5hoLzTlR0JewfG3'
  });
});

test.requestHooks(mockChallengeOVOnlyMethodsWithDeviceKnown)('FastPass option is rendered 1st in the list when deviceKnown=true', async t => {
  const selectAuthenticatorPage = await setup(t);
  await checkA11y(t);

  await t.expect(selectAuthenticatorPage.getFactorLabelByIndex(0)).eql(FAST_PASS_TEXT);
  await t.expect(selectAuthenticatorPage.getFactorLabelByIndex(1)).eql(PUSH_NOTIFICATION_TEXT);
  await t.expect(selectAuthenticatorPage.getFactorLabelByIndex(2)).eql(ENTER_CODE_TEXT);
});

test.requestHooks(requestLogger, mockChallengeOVTotpMethod)('should show switch authenticator link only when needed', async t => {
  const selectAuthenticatorPage = await setup(t);
  await checkA11y(t);

  // This view (only OV authenticator, but with 3 methods) is custom
  // The response contains the same select-authenticator-authenticate form as other views
  // So we need to be sure we don't display a switch authenticator link in this page specifically
  // since this page itself is a select authenticator page
  await t.expect(await selectAuthenticatorPage.verifyWithSomethingElseLinkExists()).notOk();

  await selectAuthenticatorPage.selectFactorByIndex(2);
  const challengeOktaVerifyTOTPPageObject = new ChallengeOktaVerifyTotpPageObject(t);
  const saveBtnText = challengeOktaVerifyTOTPPageObject.getSaveButtonLabel();
  await t.expect(saveBtnText).contains('Verify');

  // Once we select a method and move to a challenge view, we should see the link to switch authenticator
  // Since there are 3 possible choices (OV FastPass, OV Push, OV TOTP)
  await t.expect(await challengeOktaVerifyTOTPPageObject.verifyWithSomethingElseLinkExists()).ok();
  await t.expect(challengeOktaVerifyTOTPPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');

  // verify sign out link
  await t.expect(await challengeOktaVerifyTOTPPageObject.signoutLinkExists()).ok();
  await t.expect(challengeOktaVerifyTOTPPageObject.getSignoutLinkText()).eql('Back to sign in');

  await challengeOktaVerifyTOTPPageObject.verifyFactor('credentials.totp', '1234');
  await challengeOktaVerifyTOTPPageObject.clickVerifyButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(mockChallengeOVTotpMethod)('should show custom factor page link', async t => {
  const selectAuthenticatorPage = await setup(t, {
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });
  await checkA11y(t);

  await selectAuthenticatorPage.selectFactorByIndex(2);

  await t.expect(selectAuthenticatorPage.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(selectAuthenticatorPage.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});
