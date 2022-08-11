import TestAppPage from '../page-objects/test-app.page';
import PrimaryAuthPage from '../page-objects/primary-auth.page';
import OktaHomePage from '../page-objects/okta-home.page';
import { waitForLoad } from '../util/waitUtil';

const {
  WIDGET_TEST_SERVER,
  WIDGET_BASIC_USER,
  WIDGET_BASIC_PASSWORD,
} = process.env;

describe('Basic flows', () => {
  let config;
  beforeEach(async () => {
    config = {
      baseUrl: WIDGET_TEST_SERVER,
      authParams: {
        pkce: false
      }
    };
    await TestAppPage.open();
    await TestAppPage.setConfig(config);
  });

  afterEach(async () => {
    await TestAppPage.ssoLogout();
  });

  it('redirects to successful page when features.redirectByFormSubmit is on', async () => {
    // TODO: remove when OKTA-415707 is resolved
    if (process.env.ORG_OIE_ENABLED) {
      console.error('test is disabled: OKTA-415707');
      return;
    }

    config = {
      ...config,
      features: {
        redirectByFormSubmit: true,
      }
    };
    await TestAppPage.startButton.click();
    await waitForLoad(TestAppPage.widget);
    await PrimaryAuthPage.login(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
    await OktaHomePage.waitForPageLoad();
  });

});


