import WidgetRouter from 'v2/WidgetRouter';
import FormController from 'v2/controllers/FormController';
import $sandbox from 'sandbox';
import getAuthClient from 'helpers/getAuthClient';
import XHRIdentifyWithPassword
from '../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import Util from 'helpers/mocks/Util';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';

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
      transactionManager: {
        saveLastResponse: false
      }
    };
    Object.keys(settings).forEach(key => {
      const parts = key.split('.');
      if (parts[0] === 'authParams') {
        authParams[parts[1]] = settings[key];
      }
    });
    const authClient = getAuthClient({ authParams });
    const afterRenderHandler = jest.fn();
    const afterErrorHandler = jest.fn();

    const router = new WidgetRouter({
      el: $sandbox,
      baseUrl,
      authClient,
      ...settings
    });

    router.appState.set('remediations', remediations);
    router.appState.set('currentFormName', formName);
    router.appState.set('idx', {neededToProceed: []});

    router.on('afterRender', afterRenderHandler);
    router.on('afterError', afterErrorHandler);

    testContext = {
      authClient,
      router,
      afterRenderHandler,
      afterErrorHandler,
    };
    return testContext;
  }

  function mockXhr(jsonResponse, status=200) {
    return {
      status,
      responseType: 'json',
      response: jsonResponse,
    };
  }

  beforeEach(function() {
    testContext = {};
    window.console.error = (()=>{});  // silences error printed to test console
  });

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  
  it('should not be visible until initial render', async function() {
    Util.mockAjax([
      mockXhr(RAW_IDX_RESPONSE)
    ]);
    setup({ stateToken: 'abc' });
    const { router, afterErrorHandler, afterRenderHandler } = testContext;
    expect(router.header.$el.css('display')).toBe('none');
    await router.render(FormController);
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalledTimes(1);
    expect(router.header.$el.css('display')).toBe('block');
    expect(router.controller.$el.find('.o-form-head').text()).toBe('Sign In');
  });
  
  it('should be visible and render initial error', async function() {
    const { authClient } = setup({
      clientId: 'abc', // use interaction code flow
      codeChallenge: 'someChallenge'
    });
    const { router, afterErrorHandler, afterRenderHandler } = testContext;
    jest.spyOn(authClient.idx, 'start').mockRejectedValue({
      error: 'access_denied',
      // eslint-disable-next-line camelcase
      error_description: 'OIE is not enabled'
    });
    expect(router.header.$el.css('display')).toBe('none');
    await router.render(FormController);
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalledTimes(1);
    expect(router.header.$el.css('display')).toBe('block');
    expect(router.controller.$el.find('.o-form-error-container').text()).toBe(
      'The requested feature is not enabled in this environment.'
    );
  });
});
