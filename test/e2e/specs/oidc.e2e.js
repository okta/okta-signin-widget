import PrimaryAuthPage from '../page-objects/primary-auth.page';
import TestAppPage from '../page-objects/test-app.page';
import { waitForLoad } from '../util/waitUtil';

const {
  WIDGET_TEST_SERVER,
  WIDGET_WEB_CLIENT_ID, 
  WIDGET_SPA_CLIENT_ID,
  WIDGET_BASIC_USER,
  WIDGET_BASIC_PASSWORD,
  WIDGET_BASIC_NAME,
  WIDGET_BASIC_USER_2, 
  WIDGET_BASIC_PASSWORD_2,
  WIDGET_BASIC_NAME_2,
  WIDGET_BASIC_USER_4,
  WIDGET_BASIC_PASSWORD_4,
  WIDGET_BASIC_USER_5, 
  WIDGET_BASIC_PASSWORD_5,
} = process.env;

const clientIds = [
  WIDGET_WEB_CLIENT_ID, 
  WIDGET_SPA_CLIENT_ID
];

describe('OIDC flows', () => {
  beforeEach(async () => {
    await TestAppPage.open();
  });

  afterEach(async () => {
    await TestAppPage.ssoLogout();
  });

  describe('Okta as IDP', () => {
    let config;
    beforeEach(() => {
      config = {
        baseUrl: WIDGET_TEST_SERVER,
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          pkce: false,
          scopes: ['openid', 'email', 'profile', 'address', 'phone']
        }
      };
    });

    clientIds.forEach(clientId => {
      it('can login and exchange a sessionToken for an id_token', async () => {
        config.clientId = clientId;
        config.authParams.responseType = 'id_token';

        await TestAppPage.setConfig(config);
        await TestAppPage.startWithRenderEl.click();
        await waitForLoad(TestAppPage.widget);
        await PrimaryAuthPage.login(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
        await TestAppPage.assertIDToken(WIDGET_BASIC_NAME);
      });

      it('throws form error if auth client returns with OAuth error', async () => {
        // TODO - Enable after https://oktainc.atlassian.net/browse/OKTA-375434
        if (process.env.ORG_OIE_ENABLED) {
          return;
        }
  
        config.clientId = clientId;
        config.authParams.responseType = 'id_token';

        await TestAppPage.setConfig(config);
        await TestAppPage.startWithRenderEl.click();
        await waitForLoad(TestAppPage.widget);
        await PrimaryAuthPage.login(WIDGET_BASIC_USER_5, WIDGET_BASIC_PASSWORD_5);
        await PrimaryAuthPage.assertErrorMessage('User is not assigned to the client application.');
      });

      it('can login and get a token and id_token', async () => {
        config.clientId = clientId;
        config.authParams.responseType = ['id_token', 'token'];

        await TestAppPage.setConfig(config);
        await TestAppPage.startWithRenderEl.click();
        await waitForLoad(TestAppPage.widget);
        await PrimaryAuthPage.login(WIDGET_BASIC_USER_2, WIDGET_BASIC_PASSWORD_2);
        
        await TestAppPage.assertIDToken(WIDGET_BASIC_NAME_2);
        await TestAppPage.assertAccessToken();
      });

    });

    it('logs in and uses the redirect flow for responseType "code"', async () => {
      config.clientId = WIDGET_WEB_CLIENT_ID;
      config.authParams.responseType = 'code';

      await TestAppPage.setConfig(config);
      await TestAppPage.startWithRenderEl.click();
      await waitForLoad(TestAppPage.widget);
      await PrimaryAuthPage.login(WIDGET_BASIC_USER_4, WIDGET_BASIC_PASSWORD_4);
      await TestAppPage.assertCode();
    });

    describe('PKCE flows', () => {
      beforeEach(() => {
        config = {
          baseUrl: WIDGET_TEST_SERVER,
          clientId: WIDGET_SPA_CLIENT_ID,
          redirectUri: 'http://localhost:3000/done',
          authParams: {
            pkce: true,
            display: 'page',
            scopes: ['openid', 'email', 'profile', 'address', 'phone']
          }
        };
      });

      ['query', 'fragment'].forEach(responseMode => {
        it(`responseMode === ${responseMode}`, async () => {
          config.authParams.responseMode = responseMode;
  
          await TestAppPage.setConfig(config);
          await TestAppPage.startWithRenderEl.click();
          await waitForLoad(TestAppPage.widget);
          await PrimaryAuthPage.login(WIDGET_BASIC_USER_2, WIDGET_BASIC_PASSWORD_2);
          await TestAppPage.assertIDToken(WIDGET_BASIC_NAME_2);
          await TestAppPage.assertAccessToken();
        });
      });
    });
  });

  // TODO: migrate old idp tests from test/e2e/OIDC_spec.js
  describe.skip('Social IDP', () => {
    // TODO
  });
});