import TestAppPage from '../page-objects/test-app.page';
import PrimaryAuthPage from '../page-objects/primary-auth-oie.page';
import { waitForLoad } from '../util/waitUtil';
import { locUtil } from '../util/locUtil';

const {
  WIDGET_SPA_CLIENT_ID,
  WIDGET_TEST_SERVER,
  TEST_LANG,
} = process.env;


describe(`Language Test: ${TEST_LANG}`, () => {
  let config;
  beforeEach(async () => {
    config = {
      baseUrl: WIDGET_TEST_SERVER,
      redirectUri: 'http://localhost:3000/done',
      el: '#okta-login-container',
      clientId: WIDGET_SPA_CLIENT_ID,
      scopes: ['openid', 'email', 'profile']
    };
    await TestAppPage.open();
  });

  it('loads the widget using auto-language select', async () => {
    await TestAppPage.setConfig(config);
    await TestAppPage.showSignInButton.click();
    await waitForLoad(TestAppPage.widget);
    await PrimaryAuthPage.waitForPrimaryAuthForm();

    const loc = await locUtil(TEST_LANG);

    // primaryauth.title (login.properties)
    const title = loc('primaryauth.title', 'login');
    const formTitle = await PrimaryAuthPage.formTitle.getText();

    expect(formTitle).toEqual(title);
  });
});
