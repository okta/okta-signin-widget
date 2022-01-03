import TestAppPage from '../page-objects/test-app.page';
import PrimaryAuthPage from '../page-objects/primary-auth.page';
import OktaHomePage from '../page-objects/okta-home.page';
import { waitForLoad } from '../util/waitUtil';
import createContextUserAndCredentials from '../util/a18nClient/createContextUserAndCredentials';
import deleteUserAndCredentials from '../util/a18nClient/deleteUserAndCredentials';

let userContext;

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
    // userContext = await createContextUserAndCredentials('TestName', ['MFA Required', 'Phone Required']);
  });

  afterEach(async () => {
    await TestAppPage.ssoLogout();
    // await deleteUserAndCredentials(userContext.user, userContext.credentials);
  });

  it('can hide, show, remove, and start a widget', async () => {
    await TestAppPage.startButton.click();
    await waitForLoad(TestAppPage.widget);

    await TestAppPage.hideButton.click();
    await TestAppPage.widget.then(el => el.isDisplayed()).then(isDisplayed => {
      expect(isDisplayed).toBeFalse();
    });

    await TestAppPage.showButton.click();
    await TestAppPage.widget.then(el => el.isDisplayed()).then(isDisplayed => {
      expect(isDisplayed).toBeTrue();
    });

    await TestAppPage.removeButton.click();
    await TestAppPage.widget.then(el => el.isExisting()).then(isExisting => {
      expect(isExisting).toBeFalse();
    });

    config = {
      ...config,
      i18n: {
        en: {
          'primaryauth.title': 'Sign In to Acme'
        }
      }
    };
    await TestAppPage.setConfig(config);
    await TestAppPage.startButton.click();
    await waitForLoad(TestAppPage.widget);
    await TestAppPage.widgetTitle.then(el => el.getText()).then(txt => {
      expect(txt).toBe('Sign In to Acme');
    });
  });

  it('has the style from config.colors', async () => {
    config = {
      ...config,
      colors: {
        brand: '#008000'
      }
    };
    await TestAppPage.setConfig(config);
    await TestAppPage.startButton.click();
    await waitForLoad(TestAppPage.widget);
    await TestAppPage.submit.then(el => el.getCSSProperty('background')).then(background => {
      expect(background.value).toContain('rgba(0, 128, 0, 1)');
    });
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


