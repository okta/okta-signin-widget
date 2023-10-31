import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import PrimaryAuthPageObject from '../../framework/page-objects-v1/PrimaryAuthPageObject';
import UnlockAccountPageObject from '../../framework/page-objects-v1/UnlockAccountPageObject';
import authnSuccessResponse from '../../../../playground/mocks/data/api/v1/authn/success-001';
import idpForceResponseOktaIdP from '../../../../playground/mocks/data/.well-known/webfinger/forced-idp-discovery-okta-idp.json';

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const authNSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authnSuccessResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/webfinger.*/)
  .respond(idpForceResponseOktaIdP);

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
    idpDiscovery: false,
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
      router: false,
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
  await t.expect(primaryAuthForm.form.fieldByLabelExists('Password')).ok();
  await t.expect(primaryAuthForm.getInputField('password').getAttribute('autocomplete')).eql('off');
});

test.requestHooks(logger)('sets aria-expanded attribute correctly when clicking help', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await t.expect(primaryAuthForm.getLinkElement('Need help signing in?').getAttribute('aria-expanded')).eql('false');
  await primaryAuthForm.clickLinkElement('Need help signing in?');
  await t.expect(primaryAuthForm.getLinkElement('Need help signing in?').getAttribute('aria-expanded')).eql('true');
  await t.expect(primaryAuthForm.getLinkElement('Forgot password?').visible).eql(true);
});

test.requestHooks(logger)('Toggles icon when the password toggle button with features.showPasswordToggleOnSignInPage is clicked', async (t) => {
  const config = {
    ...defaultConfig,
    features: {
      ...defaultConfig.features,
      showPasswordToggleOnSignInPage: true,
    },
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  await t.expect(primaryAuthForm.getShowPasswordVisibilityToggle().visible).eql(true);
  await t.expect(primaryAuthForm.getHidePasswordVisibilityToggle().visible).eql(false);

  await t.click(primaryAuthForm.getShowPasswordVisibilityToggle());

  await t.expect(primaryAuthForm.getShowPasswordVisibilityToggle().visible).eql(false);
  await t.expect(primaryAuthForm.getHidePasswordVisibilityToggle().visible).eql(true);
  await t.expect(primaryAuthForm.getInputField('password').getAttribute('type')).eql('text');
});

test.requestHooks(logger)('show anti-phishing message when security image is new user', async (t) => {
  const config = {
    ...defaultConfig,
    features: {
      ...defaultConfig.features,
      securityImage: true,
    },
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');

  await primaryAuthForm.form.setTextBoxValue('username', 'new');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  
  const tooltip = primaryAuthForm.getSecurityImageTooltip();
  await t.expect(tooltip.visible).eql(true);
  await t.expect(tooltip.textContent).contains('This is the first time you are connecting to');
});

test.requestHooks(logger)('show anti-phishing message if security image become visible', async (t) => {
  const toggleBeacon = ClientFunction((show = true) => {
    document.querySelector('.beacon-container').style.display = show ? 'block' : 'none';
  });
  const config = {
    ...defaultConfig,
    features: {
      ...defaultConfig.features,
      securityImage: true,
    },
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'unknown');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');

  const tooltip = primaryAuthForm.getSecurityImageTooltip();
  await t.expect(primaryAuthForm.getBeaconContainer().visible).eql(true);
  await t.expect(tooltip.visible).eql(true);
  await t.expect(tooltip.textContent).contains('This is the first time you are connecting to');

  await toggleBeacon(false);

  await t.expect(primaryAuthForm.getBeaconContainer().visible).eql(false);

  await toggleBeacon();

  await t.expect(primaryAuthForm.getBeaconContainer().visible).eql(true);
  await t.expect(primaryAuthForm.getSecurityImageTooltip().visible).eql(true);
});

test.requestHooks(logger)('does not show anti-phishing message if security image is hidden', async (t) => {
  const toggleBeacon = ClientFunction((show = true) => {
    document.querySelector('.beacon-container').style.display = show ? 'block' : 'none';
  });
  const config = {
    ...defaultConfig,
    features: {
      ...defaultConfig.features,
      securityImage: true,
    },
  };
  const primaryAuthForm = await setup(t, config);
  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  // Confirm beacon is visible
  await t.expect(primaryAuthForm.getBeaconContainer().visible).eql(true);
  // Hide the beacon
  await toggleBeacon(false);
  await t.expect(primaryAuthForm.getBeaconContainer().visible).eql(false);

  await primaryAuthForm.form.setTextBoxValue('username', 'unknown');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');

  await t.expect(primaryAuthForm.getBeaconContainer().visible).eql(false);
  await t.expect(primaryAuthForm.getSecurityImageTooltip().visible).eql(false);
});

test.requestHooks(logger)('removes anti-phishing message if help link is clicked', async (t) => {
  const config = {
    ...defaultConfig,
    features: {
      ...defaultConfig.features,
      securityImage: true,
      selfServiceUnlock: true,
    },
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'unknown');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');

  const tooltip = primaryAuthForm.getSecurityImageTooltip();
  await t.expect(primaryAuthForm.getBeaconContainer().visible).eql(true);
  await t.expect(tooltip.visible).eql(true);
  await t.expect(tooltip.textContent).contains('This is the first time you are connecting to');

  await primaryAuthForm.clickLinkElement('Need help signing in?');
  await t.expect(primaryAuthForm.getLinkElement('Need help signing in?').getAttribute('aria-expanded')).eql('true');
  await primaryAuthForm.clickLinkElement('Unlock account?');

  const unlockAccountForm = new UnlockAccountPageObject(t);
  await t.expect(unlockAccountForm.hasEmailOrUsernameField()).eql(true);
  await t.expect(unlockAccountForm.isBeaconVisible()).eql(false);
  await t.expect(unlockAccountForm.isSecurityImageTooltipVisible()).eql(false);
});
