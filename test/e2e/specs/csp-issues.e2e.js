import TestAppPage from '../page-objects/test-app.page';
import { waitForLoad } from '../util/waitUtil';

const {
  WIDGET_TEST_SERVER,
  WIDGET_SPA_CLIENT_ID,
} = process.env;

describe('CSP existing issues', () => {
  let config;
  beforeEach(async () => {
    await TestAppPage.open();
    config = {
      baseUrl: WIDGET_TEST_SERVER,
      clientId: WIDGET_SPA_CLIENT_ID,
      redirectUri: 'http://localhost:3000/done',
      useClassicEngine: true,
      authParams: {
        pkce: false,
        scopes: ['openid', 'email', 'profile']
      }
    };
  });

  afterEach(async () => {
    await TestAppPage.ssoLogout();
  });

  it('causes CSP error when change brand color', async () => {
    config.colors = {
      brand: '#008000'
    };

    await TestAppPage.setConfig(config);
    await TestAppPage.startWithRenderEl.click();
    await waitForLoad(TestAppPage.widget);
    await TestAppPage.assertCSPError('inline blocked due to CSP rule style-src-elem');
  });

});
