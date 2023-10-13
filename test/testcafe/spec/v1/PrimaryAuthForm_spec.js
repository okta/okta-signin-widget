import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import PrimaryAuthPageObject from '../../framework/page-objects-v1/PrimaryAuthPageObject';
import authnSuccessResponse from '../../../../playground/mocks/data/api/v1/authn/success-001';

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const authNSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authnSuccessResponse);

fixture('Primary Auth Form');

const logger = RequestLogger(
  /api\/v1/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logResponseBody: true,
  }
);

const defaultConfig = {
  stateToken: null, // setting stateToken to null to trigger the V1 flow
  features: {
    router: true,
  },
  authParams: {
    responseType: 'code',
  },
  useClassicEngine: true,
};

async function setup(t, config = defaultConfig) {
  const primaryAuthPage = new PrimaryAuthPageObject(t);
  await primaryAuthPage.navigateToPage({ render: false });
  
  await renderWidget(config);
  await t.expect(primaryAuthPage.formExists()).eql(true);
  return primaryAuthPage;
}

test.requestHooks(logger, authNSuccessMock)('should set autocomplete to off on Primary Auth Form for username and password fields when features.disableAutocomplete is set to true', async (t) => {
  const config = {
    ...defaultConfig,
    features: {
      ...defaultConfig.features,
      disableAutocomplete: true,
    },
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  const userNameField = primaryAuthForm.getInputField('username');
  await t.expect(userNameField.getAttribute('autocomplete')).eql('off');
  const passwordField = primaryAuthForm.getInputField('password');
  await t.expect(passwordField.getAttribute('autocomplete')).eql('off');
});

test.requestHooks(logger, authNSuccessMock)('should set autocomplete to off on username and password fields when features.disableAutocomplete and features.idpDiscovery are set to true', async (t) => {
  const config = {
    ...defaultConfig,
    features: {
      ...defaultConfig.features,
      disableAutocomplete: true,
      idpDiscovery: true,
    },
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  const userNameField = primaryAuthForm.getInputField('username');
  await t.expect(userNameField.getAttribute('autocomplete')).eql('off');
  await primaryAuthForm.setUsername('tester1@okta1.com');
  await primaryAuthForm.clickNextButton();
  const passwordField = primaryAuthForm.getInputField('password');
  await t.expect(passwordField.getAttribute('autocomplete')).eql('off');
});