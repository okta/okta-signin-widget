import { RequestMock, Selector } from 'testcafe';
import PageObject from '../framework/page-objects/IdentityPageObject';
import { renderWidget } from '../framework/shared';
import { assertNoEnglishLeaks } from '../../../playground/LocaleUtils';
const fs = require('fs');
const path = require('path');

const PLAYGROUND = path.resolve(__dirname, '../../../playground');
const mocksFolder = `${PLAYGROUND}/mocks/data/idp/idx`;
const mocksOauth2Folder = `${PLAYGROUND}/mocks/data/oauth2`;

// `notranslate` class is used internally by MUI to fix zero-width space issue
// https://github.com/mui/material-ui/blob/73c88b6c3f71287a4a1f0b1b5d7d37ab268dca49/packages/mui-material/src/InputAdornment/InputAdornment.js#L130
const NO_TRANSLATE_SELECTOR = '.no-translate, .notranslate, [translate="no"]';

fixture('English Leaks');

// These mocks have known english leaks ignoring them temporarily
const ignoredMocks = [
  '_ui-demo.json',
  'error-empty-response.json', // it's empty!
  'profile-enrollment-string-fields-options.json', // profile enrollment fields are coming from UD and we do not currently have a way to localize them
  'enroll-profile-new-boolean-fields.json', // english leak on security question and "Subscribe" checkbox
  'identify-with-apple-redirect-sso-extension.json', // flaky on bacon
  'identify-recovery-with-recaptcha-v2.json', // No english leaks for this, just flaky on bacon due to loading the reCaptcha lib 
  'identify-with-password-with-recaptcha-v2.json', // No english leaks for this, just flaky on bacon due to loading the reCaptcha lib
  'enroll-profile-update-all-optional-params.json', // No english leaks as custom attribute label comes from server
  'enroll-profile-update-params.json', // No english leaks as custom attribute label comes from server
  'enroll-profile-new-additional-fields.json', // No english leaks on UI. Country and timezone dropdown values are not localized OKTA-454630
  'enroll-profile-submit.json', // flaky on bacon
  'enroll-profile-all-base-attributes.json', // No english leaks on UI. Country and timezone dropdown values are not localized OKTA-454630
  'error-custom-access-denied-success-redirect.json', // custom message
  'error-identify-access-denied-custom-message.json', // custom message
  'enroll-profile-new-boolean-fields.json', // custom registration fields
  'authenticator-expired-custom-password.json', // seems to be flaky
  'enroll-profile-new-custom-labels.json', // custom message/label
  'terminal-okta-verify-enrollment-android-device.json', // Automatic redirect, in app logic handles this view, no english leak.
  'error-429-api-limit-exceeded.json', // Gen3 has english leak on UI. But in real world this response can be received on polling only, no english leak in this case.
];

const ignoredLeaks = {
  'identify-with-webauthn-launch-authenticator.json': [
    'This is an invalid domain.', // browser webauthn error
  ],
  'authenticator-verification-webauthn.json': [
    'This is an invalid domain.', // browser webauthn error
  ],
  'error-authenticator-webauthn-failure.json': [
    'This is an invalid domain.', // browser webauthn error
  ],
};

const optionsForInteractionCodeFlow = {
  clientId: 'fake',
  authParams: {
    ignoreSignature: true,
    pkce: true,
  },
  stateToken: undefined
};

const mocksWithInteractionCodeFlow = [
  'success-with-interaction-code.json'
];

const mocksWithAlert = [
  'success-with-interaction-code.json'
];

const mocksWithoutContent = [
  'success-with-interaction-code.json'
];

const parseMockData = () => {
  // parse mocks folder
  const mocks = [];
  // eslint-disable-next-line no-console
  console.log('================= Parsing mocks for en leaks automation =============');
  fs.readdirSync(mocksFolder).forEach(file => {
    const isIgnored = ignoredMocks.includes(file);
    //only allow json mock files
    const isJsonMock = path.extname(file) === '.json';
    if (!isIgnored && isJsonMock) {
      mocks.push(file);
    } else {
      test.skip(`Warning skipping mock ${file} from test english leaks test suite. This file may result in english leaks on the UI.`, () => { });
    }
  });
  return mocks;
};

const setUpResponse = (filePath) => {
  const mockResponse = require(filePath);
  // Majority of the mock files can be loaded with just mocking the introspect API and providing a response
  // In some cases we may need to mock more than just introspect API to load the screen (example polling)
  // For those cases add the url and responses to responseMap

  let statusCode;
  const errorStatusMatch = filePath.match(/error-(\d{3})\D+/);
  if (errorStatusMatch) {
    statusCode =  parseInt(errorStatusMatch[1]);
  }

  // Needed for identify-with-apple-redirect-sso-extension
  const verifyUrl = 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/123/verify?\
  challengeRequest=dummyvalue';

  const responseMap = [
    {
      url: 'http://localhost:3000/idp/idx/introspect',
      response: mockResponse,
      statusCode
    },
    {
      url: 'http://localhost:3000/idp/idx/challenge/poll',
      response: mockResponse,
      statusCode
    },
    // used for device probing mock
    {
      url: 'http://localhost:3000/idp/idx/authenticators/poll',
      response: mockResponse,
      statusCode
    },
    // used for device probing mock
    {
      url: 'http://localhost:3000/idp/idx/authenticators/poll/cancel',
      response: mockResponse,
      statusCode
    },
    {
      url: 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/456/verify/cancel',
      response: mockResponse
    },
    {
      url: verifyUrl,
      response: '<html><h1>》ok_PL《</h1></html>'
    },
    {
      url: 'http://localhost:3000/oauth2/default/v1/token',
      response: require(`${mocksOauth2Folder}/success-tokens.json`)
    },
    {
      url: 'http://localhost:3000/oauth2/default/v1/interact',
      response: require(`${mocksOauth2Folder}/interact.json`)
    }
  ];

  const mock = RequestMock();
  for (let i = 0; i < responseMap.length; i++) {
    const url = responseMap[i].url;
    const { response, statusCode } = responseMap[i];
    mock
      .onRequestTo(url)
      .respond(response, statusCode);
  }
  return mock;
};

async function setup(t, locale, fileName) {
  const withInteractionCodeFlow = mocksWithInteractionCodeFlow.includes(fileName);
  const withAlert = mocksWithAlert.includes(fileName);
  const options = withInteractionCodeFlow ? optionsForInteractionCodeFlow : {};
  const widgetView = new PageObject(t);
  
  // Navigate to the page but do not render the widget yet
  await widgetView.navigateToPage({
    render: false,
    preventRedirect: true,
  });

  if (withInteractionCodeFlow) {
    await widgetView.mockCrypto();
  }

  if (withAlert) {
    await t.setNativeDialogHandler(() => true);
  }

  // Prevent redirects
  await widgetView.preventRedirect([
    // TODO: are there *any* allowed redirects?
    'http://localhost:3000/error.html',
    'http://localhost:3000/sso/idps/facebook-idp-id-123',
    'https://okta.mtls.okta.com/sso/idps/mtlsidp',
    'http://localhost:3000/app/UserHome'
  ]);
  
  await renderWidget({
    ...options,
    'language': locale,
    // No need to check en leaks twice
    // (1st time - in afterRender callback on playground, 2nd time - in test spec)
    assertNoEnglishLeaks: false,
  });

  await t.expect(Selector('#okta-sign-in').visible).eql(true);
}

const testEnglishLeaks = (mockIdxResponse, fileName, locale) => {
  test.requestHooks(mockIdxResponse)(`${fileName} should not have english leaks`, async t => {
    const hasContent = !mocksWithoutContent.includes(fileName);
    await setup(t, locale, fileName);
    if (!hasContent) {
      return;
    }
    await t.expect(Selector('form').exists).eql(true);
    //Use innerText to avoid including hidden elements
    let viewText = await Selector('#okta-sign-in').innerText;
    // NOTE: update `mocksWithoutContent` to exclude/skip this check
    await t.expect(viewText.length).gt(0, 'Inner text of #okta-sign-in should not be empty');
    viewText = viewText.split('\n').join(' ');

    const noTranslationContentExists = await Selector(NO_TRANSLATE_SELECTOR).exists;
    let noTranslationContent = [...(ignoredLeaks?.[fileName] ?? [])];
    if (noTranslationContentExists) {
      //build array of noTranslationContent
      const noTranslateElems = await Selector(NO_TRANSLATE_SELECTOR).count;
      for (var i = 0; i < noTranslateElems; i++) {
        const noTranslateContent = await Selector(NO_TRANSLATE_SELECTOR).nth(i).innerText;
        noTranslationContent.push(noTranslateContent);
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
