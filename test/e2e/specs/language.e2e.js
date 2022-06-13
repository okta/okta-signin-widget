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


describe('Language Test', () => {
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

  it('loads the widget using auto-language select', async () => {
    await TestAppPage.setConfig(config);
    await TestAppPage.showSignInButton.click();
    await waitForLoad(TestAppPage.widget);

    // TODO: test
  });
});

