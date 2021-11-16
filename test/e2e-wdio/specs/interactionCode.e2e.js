import TestAppPage from '../page-objects/test-app.page';
import PrimaryAuthPage from '../page-objects/primary-auth-oie.page';
import { waitForLoad } from '../util/waitUtil';

const {
  WIDGET_TEST_SERVER,
  WIDGET_BASIC_NAME,
  WIDGET_BASIC_USER,
  WIDGET_BASIC_PASSWORD,
  WIDGET_SPA_CLIENT_ID,
} = process.env;

describe('Interaction code flows', () => {
  let config;
  beforeEach(async () => {
    config = {
      baseUrl: WIDGET_TEST_SERVER,
      redirectUri: 'http://localhost:3000/done',
      el: '#okta-login-container',
      clientId: WIDGET_SPA_CLIENT_ID,
      useInteractionCodeFlow: true,
      scopes: ['openid', 'email', 'profile']
    };
    console.log(JSON.stringify(config)); // for manual testing in browser
    await TestAppPage.open();
    await TestAppPage.setConfig(config);
  });

  afterEach(async () => {
    await TestAppPage.ssoLogout();
  });

  describe('basic flow', () => {
    it('can signin with username and password', async () => {
      await TestAppPage.startButton.click();
      await waitForLoad(TestAppPage.widget);
      await PrimaryAuthPage.login(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
      await TestAppPage.assertIDToken(WIDGET_BASIC_NAME);
    });
  });

  describe('3rd party OIDC IdP login', () => {
    beforeEach(() => {
      config = {
        baseUrl: WIDGET_TEST_SERVER,
        clientId: WIDGET_SPA_CLIENT_ID,
        responseType: 'code',
        redirectUri: 'http://localhost:3000/done',
        useInteractionCodeFlow: true,
        authParams: {
          pkce: true,
          display: 'page',
          scopes: ['openid', 'email', 'profile', 'address', 'phone']
        }
      };
    });

    // We use another Okta org as "3rd party" OIDC provider for this test
    // This org has the same test user (WIDGET_BASIC_USER) which is used to test login
    it('can login to a 3rd party OIDC IdP using interaction code flow', async () => {
      await TestAppPage.setConfig(config);
      await TestAppPage.startWithRenderEl.click();
      await waitForLoad(TestAppPage.widget);
      await PrimaryAuthPage.loginOktaOIDCIdP(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
      await TestAppPage.assertIDToken(WIDGET_BASIC_NAME);
    });
  });

  describe('multi-tab flows', () => {
    it('by default, it does not share transaction storage between tabs', async () => {
      // Navigate to forgot password form
      await TestAppPage.startButton.click();
      await waitForLoad(TestAppPage.widget);
      await PrimaryAuthPage.clickForgotPasswordButton();
      await PrimaryAuthPage.waitForForgotPassword();

      // Open another instance in a new tab
      await TestAppPage.openInNewTab();
      await TestAppPage.setConfig(config);
      await TestAppPage.startButton.click();
      await waitForLoad(TestAppPage.widget);

      // Should see primary signin form (not forgot password form)
      await PrimaryAuthPage.waitForPrimaryAuthForm();
    });

    it('will share transaction storage between tabs if state is set', async () => {
      // Set state in the config
      config.state = 'abc';
      await TestAppPage.setConfig(config);

      // Navigate to forgot password form
      await TestAppPage.startButton.click();
      await waitForLoad(TestAppPage.widget);
      await PrimaryAuthPage.clickForgotPasswordButton();
      await PrimaryAuthPage.waitForForgotPassword();

      // Open another instance in a new tab
      await TestAppPage.openInNewTab();
      await TestAppPage.setConfig(config);
      await TestAppPage.startButton.click();
      await waitForLoad(TestAppPage.widget);

      // Should see forgot password form
      await PrimaryAuthPage.waitForForgotPassword();
    });
  });
});
