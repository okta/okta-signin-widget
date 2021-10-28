import { _ } from 'okta';
import WidgetRouter from 'v2/WidgetRouter';
import FormController from 'v2/controllers/FormController';
import $sandbox from 'sandbox';
import createAuthClient from 'widget/createAuthClient';
import XHRIdentifyWithPassword
  from '../../../../playground/mocks/data/idp/idx/identify-with-password.json';

jest.mock('v2/client/interact', () => {
  return {
    interact: () => { }
  };
});

const mocked = {
  interact: require('v2/client/interact'),
};


describe('v2/WidgetRouter', function() {
  let testContext;

  function setup(
    settings = {}, 
    remediations = XHRIdentifyWithPassword.remediation.value,
    formName = 'identify'
  ) {
    const baseUrl = 'https://foo.com';
    const authParams = {
      issuer: baseUrl,
    };
    Object.keys(settings).forEach(key => {
      const parts = key.split('.');
      if (parts[0] === 'authParams') {
        authParams[parts[1]] = settings[key];
      }
    });
    const authClient = createAuthClient(authParams);
    const afterRenderHandler = jest.fn();
    const afterErrorHandler = jest.fn();

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

    router.appState.set('remediations', remediations);
    router.appState.set('currentFormName', formName);
    router.appState.set('idx', {neededToProceed: []});

    router.on('afterRender', afterRenderHandler);
    router.on('afterError', afterErrorHandler);

    testContext = {
      router,
      afterRenderHandler,
      afterErrorHandler,
    };
  }

  beforeEach(function() {
    testContext = {};
  });

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
  });

  
  it('should not be visible until initial render', async function() {
    setup();
    expect(testContext.router.header.$el.css('display')).toBe('none');
    await testContext.router.render(FormController);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
    expect(testContext.router.header.$el.css('display')).toBe('block');
    expect(testContext.router.controller.$el.find('.o-form-head').text()).toBe('Sign In');
  });
  
  it('should be visible and render initial error', async function() {
    jest.spyOn(mocked.interact, 'interact').mockRejectedValue({
      error: {
        error: 'access_denied',
        // eslint-disable-next-line camelcase
        error_description: 'OIE is not enabled'
      }
    });
    setup({
      useInteractionCodeFlow: true,
    });
    expect(testContext.router.header.$el.css('display')).toBe('none');
    await testContext.router.render(FormController);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
    expect(testContext.router.header.$el.css('display')).toBe('block');
    expect(testContext.router.controller.$el.find('.o-form-error-container').text()).toBe(
      'The requested feature is not enabled in this environment.'
    );
  });
});
