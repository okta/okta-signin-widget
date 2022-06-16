import TestAppPage from '../page-objects/test-app.page';
import PrimaryAuthPage from '../page-objects/primary-auth-oie.page';
import { waitForLoad } from '../util/waitUtil';

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
      useInteractionCodeFlow: true,
      scopes: ['openid', 'email', 'profile']
    };
    await TestAppPage.open();
  });

  it('loads the widget using auto-language select', async () => {
    await TestAppPage.setConfig(config);
    await TestAppPage.showSignInButton.click();
    await waitForLoad(TestAppPage.widget);
    await PrimaryAuthPage.waitForPrimaryAuthForm();

    const title = 'Sign In';    // primaryauth.title (login.properties)
    const formTitle = await PrimaryAuthPage.formTitle.getText();

    expect(formTitle).not.toEqual(title);
  });
});
