import TestAppPage from '../page-objects/test-app.page';
import PrimaryAuthPage from '../page-objects/primary-auth.page';
import { waitForLoad } from '../util/waitUtil';

const {
  WIDGET_WEB_CLIENT_ID,
  WIDGET_SPA_CLIENT_ID,
  WIDGET_TEST_SERVER,
  WIDGET_BASIC_USER,
  WIDGET_BASIC_PASSWORD,
  WIDGET_BASIC_NAME,
} = process.env;

const clientIds = [
  WIDGET_WEB_CLIENT_ID, 
  WIDGET_SPA_CLIENT_ID
];

describe('Dev Mode flows', () => {
  let config;
  beforeEach(async () => {
    config = {
      baseUrl: WIDGET_TEST_SERVER,
      redirectUri: 'http://localhost:3000/done',
      el: '#okta-login-container',
      authParams: {
        pkce: false
      },
      scopes: ['openid', 'profile']
    };
    await TestAppPage.open();
  });

  afterEach(async () => {
    await TestAppPage.ssoLogout();
  });

  clientIds.forEach(clientId => {
    it('can login and return tokens using the showSignInToGetTokens method', async () => { 
      config = { ...config, clientId };
      await TestAppPage.setConfig(config);
      await TestAppPage.showSignInToGetTokens.click();
      await waitForLoad(TestAppPage.widget);
      await PrimaryAuthPage.login(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
      await TestAppPage.assertIDToken(WIDGET_BASIC_NAME);
    });

    it('can login and receive tokens on a callback using the showSignInAndRedirect method', async () => {
      config = { ...config, clientId };
      await TestAppPage.setConfig(config);
      await TestAppPage.showSignInAndRedirect.click();
      await waitForLoad(TestAppPage.widget);
      await PrimaryAuthPage.login(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
      await TestAppPage.assertIDToken(WIDGET_BASIC_NAME);
    });
  });
});

