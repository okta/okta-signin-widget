import { _ } from 'okta';
import WidgetRouter from 'v2/WidgetRouter';
import FormController from 'v2/controllers/FormController';
import $sandbox from 'sandbox';
import createAuthClient from 'widget/createAuthClient';

describe('v2/WidgetRouter', function() {
  let testContext;

  function setup(settings = {}) {
    const baseUrl = 'https://foo.com';
    const authParams = { issuer: baseUrl, headers: {} };
    Object.keys(settings).forEach(key => {
      const parts = key.split('.');
      if (parts[0] === 'authParams') {
        authParams[parts[1]] = settings[key];
      }
    });
    const authClient = createAuthClient(authParams);

    const router = new WidgetRouter(
      _.extend(
        {
          el: $sandbox,
          baseUrl: baseUrl,
          authClient: authClient,
        },
        settings
      )
    );

    testContext = {
      router,
    };
  }

  beforeEach(function() {
    testContext = {};
  });

  afterEach(function() {
    $sandbox.empty();
  });

  it('should not be visible until initial render', async function() {
    setup();
    expect(testContext.router.header.$el.css('display')).toBe('none');
    await testContext.router.render(FormController);
    expect(testContext.router.header.$el.css('display')).toBe('block');
  });
});
