import { RequestMock, Selector } from 'testcafe';
import PageObject from '../framework/page-objects/IdentityPageObject';
import { renderWidget } from '../framework/shared';
import { assertNoEnglishLeaks } from '../../../LocaleUtils';
const fs = require('fs');
const path = require('path');

const PLAYGROUND = path.resolve(__dirname, '../../../playground');
const mocksFolder = `${PLAYGROUND}/mocks/data/idp/idx`;

fixture('English Leaks');
// These mocks have known english leaks ignoring them temporarily
const ignoredMocks = [
  'user-unlock-account.json',
  'terminal-transfered-email.json',
  'terminal-return-stale-email.json',
  'terminal-return-expired-email.json',
  'terminal-return-error-email.json',
  'terminal-return-email.json',
  'terminal-registration.json',
  'terminal-polling-window-expired.json',
  'success-with-interaction-code.json',
  'safe-mode-required-enrollment.json',
  'safe-mode-optional-enrollment.json',
  'safe-mode-credential-enrollment-intent.json',
  'identify-with-third-party-idps.json',
  'identify-with-only-one-third-party-idp.json',
  'identify-with-no-sso-extension.json',
  'identify-with-device-probing-loopback.json',
  'identify-with-device-probing-loopback-3.json',
  'identify-with-device-launch-authenticator.json',
  'identify-with-apple-redirect-sso-extension.json', // flaky on bacon
  'identify-unknown-user.json',
  'error-user-is-not-assigned.json',
  'error-unlock-account.json',
  'error-session-expired.json',
  'error-safe-mode-polling.json',
  'error-pre-versioning-ff-session-expired.json',
  'error-okta-verify-totp.json',
  'error-internal-server-error.json',
  'error-identify-access-denied.json',
  'error-google-authenticator-otp.json',
  'error-forgot-password.json',
  'error-email-verify.json',
  'error-authenticator-verify-password.json',
  'error-authenticator-verification-custom-otp.json',
  'error-authenticator-enroll-custom-otp.json',
  'error-403-security-access-denied.json',
  'consent-enduser.json',
  'consent-admin.json',
  'authenticator-verification-select-authenticator.json',
  'authenticator-verification-okta-verify-signed-nonce-loopback.json',
  'authenticator-verification-okta-verify-signed-nonce-custom-uri.json',
  'authenticator-verification-okta-verify-reject-push.json',
  'authenticator-verification-data-phone-voice-then-sms.json',
  'authenticator-verification-data-phone-voice-only.json',
  'authenticator-verification-data-phone-sms-then-voice.json',
  'authenticator-reset-password.json',
  'authenticator-expiry-warning-password.json',
  'authenticator-expired-password.json',
  'authenticator-expired-password-with-enrollment-authenticator.json',
  'authenticator-expired-password-no-complexity.json',
  'authenticator-enroll-webauthn.json',
  'authenticator-enroll-select-authenticator.json',
  'authenticator-enroll-phone.json',
  'authenticator-enroll-phone-voice.json',
  'authenticator-enroll-ov-via-sms.json',
  'authenticator-enroll-ov-via-email.json',
  'authenticator-enroll-google-authenticator.json',
  'authenticator-enroll-email.json',
  'authenticator-enroll-data-phone.json',
  'authenticator-enroll-data-phone-voice.json',
  'terminal-enduser-email-consent-denied.json',
  'terminal-return-email-consent-denied.json',
  'terminal-return-email-consent.json',
  'device-code-activate.json',
  'error-invalid-device-code.json',
  'terminal-device-activated.json',
  'terminal-device-not-activated-consent-denied.json',
  'terminal-device-not-activated-internal-error.json'
];

const parseMockData = () => {
  // parse mocks folder
  const mocks = [];
  // eslint-disable-next-line no-console
  console.log('================= Parsing mocks for en leaks automation =============');
  fs.readdirSync(mocksFolder).forEach(file => {
    const isIgnored = ignoredMocks.includes(file);
    if (!isIgnored) {
      mocks.push(file);
    } else {
      test.skip(`Warning skipping mock ${file} from test english leaks test suite. This file may result in english leaks on the UI.`, () => {});
    }
  });
  return mocks;
};

const setUpResponse = (filePath) => {
  const mockResponse = require(filePath);
  // Majority of the mock files can be loaded with just mocking the introspect API and providing a response
  // In some cases we may need to mock more than just introspect API to load the screen (example polling)
  // For those cases add the url and responses to responseMap

  // Needed for identify-with-apple-redirect-sso-extension
  const verifyUrl = 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/123/verify?\
  challengeRequest=dummyvalue';

  const responseMap = [
    { 
      'url': 'http://localhost:3000/idp/idx/introspect',
      'response': mockResponse
    },
    { 
      'url': 'http://localhost:3000/idp/idx/challenge/poll',
      'response': mockResponse
    },
    // used for device probing mock
    {
      'url': 'http://localhost:3000/idp/idx/authenticators/poll',
      'response': mockResponse
    },
    // used for device probing mock
    {
      'url': 'http://localhost:3000/idp/idx/authenticators/poll/cancel',
      'response': mockResponse
    },
    {
      'url': verifyUrl,
      'response': '<html><h1>》ok_PL《</h1></html>'
    },
  ];

  const mock = RequestMock();
  for (let i = 0; i < responseMap.length; i++) {
    const url = responseMap[i].url;
    const response = responseMap[i].response;
    mock
      .onRequestTo(url)
      .respond(response);
  }
  return mock;
};

async function setup(t, locale) {
  const widgetView = new PageObject(t);
  await widgetView.navigateToPage();
  await renderWidget({
    'language': locale
  });
}

const testEnglishLeaks = (mockIdxResponse, fileName, locale) => {
  test.requestHooks(mockIdxResponse)(`${fileName} should not have english leaks`, async t => {
    await setup(t, locale);
    const viewTextExists = await Selector('#okta-sign-in').exists;
    const viewText = viewTextExists && await Selector('#okta-sign-in').textContent;
    const noTranslationContentExists = await Selector('.no-translate').exists;
    let noTranslationContent = '';
    if (noTranslationContentExists) {
      const noTranslateElems = await Selector('.no-translate').count;
      for (var i = 0; i < noTranslateElems; i++) {
        noTranslationContent += await Selector('.no-translate').nth(i).textContent;
      }
    }
    await assertNoEnglishLeaks(fileName, viewText, noTranslationContent);
  });
};

const runTest = (mockData) => {
  for (let i = 0; i < mockData.length; i++) {
    const fileName = mockData[i];
    const filePath = `${mocksFolder}/${fileName}`;
    // start test
    testEnglishLeaks(setUpResponse(filePath), fileName, 'ok-PL');
  }
};

const mockData = parseMockData();
runTest(mockData);
