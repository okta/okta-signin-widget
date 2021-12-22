import TestAppPage from '../page-objects/test-app.page';
import { waitForLoad } from '../util/waitUtil';

const {
  WIDGET_TEST_SERVER,
  WIDGET_WEB_CLIENT_ID, 
  WIDGET_SPA_CLIENT_ID
} = process.env;

const clientIds = [WIDGET_WEB_CLIENT_ID, WIDGET_SPA_CLIENT_ID];

describe('CSP', () => {
  beforeEach(async () => {
    await TestAppPage.open();
  });

  afterEach(async () => {
    await TestAppPage.removeButton.click();
  });

  it('can catch CSP errors', async () => { 
    await TestAppPage.triggerCspFail.click();
    const errorText = await TestAppPage.getCspErrors();
    
    expect(errorText).toBe('eval blocked due to CSP rule script-src from script-src http://localhost:3000');
  });

  clientIds.forEach(clientId => {
    it('loads without CSP errors', async () => { 
      const config = {
        baseUrl: WIDGET_TEST_SERVER,
        clientId,
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          pkce: false,
          responseType: 'id_token',
          scopes: ['openid', 'email', 'profile', 'address', 'phone']
        },
        idps: [
          {
            'type': 'FACEBOOK',
            'id': '0oa85bk5q6KOPeHCT0h7'
          }
        ]
      };
      await TestAppPage.setConfig(config);
      await TestAppPage.startButton.click();
      await waitForLoad(TestAppPage.widget);

      expect(await TestAppPage.getCspErrors()).toBe('');
    });
  });
});
