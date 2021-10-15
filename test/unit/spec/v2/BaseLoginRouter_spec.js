import { _ } from 'okta';
import BaseLoginRouter from 'v2/BaseLoginRouter';
import FormController from 'v2/controllers/FormController';
import $sandbox from 'sandbox';
import getAuthClient from 'widget/getAuthClient';
import idx from '@okta/okta-idx-js';
import XHRIdentifyWithPassword
  from '../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentify from '../../../../playground/mocks/data/idp/idx/identify.json';
import EnrollProfile from '../../../../playground/mocks/data/idp/idx/enroll-profile.json';

jest.mock('v2/client/interact', () => {
  return {
    interact: () => { }
  };
});

jest.mock('v2/client/introspect', () => ({
  introspect: () => { }
}));

const mocked = {
  interact: require('v2/client/interact'),
  introspect: require('v2/client/introspect')
};

const TestRouter = BaseLoginRouter.extend({
  routes: {
    '': 'defaultAuth',
    '*wildcard': 'defaultAuth',
  },

  defaultAuth: function() {
    this.render(FormController);
  },
});

const delay = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
};

describe('v2/BaseLoginRouter', function() {
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
    const authClient = getAuthClient({ authParams });
    const afterRenderHandler = jest.fn();
    const afterErrorHandler = jest.fn();

    const router = new TestRouter(
      _.extend(
        {
          el: $sandbox,
          baseUrl: baseUrl,
          authClient: authClient,
        },
        settings
      )
    );

    // router.appState.set('remediations', remediations);
    // router.appState.set('currentFormName', formName);
    // router.appState.set('idx', {neededToProceed: []});
    // router.handleUpdateAppState(XHRIdentifyWithPassword);
    // router.handleUpdateAppState(XHRIdentify);

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


  // it('should not be visible until initial render', async function() {
  //   setup();
  //   expect(testContext.router.header.$el.css('display')).toBe('none');
  //   await testContext.router.render(FormController);
  //   expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
  //   expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
  //   expect(testContext.router.header.$el.css('display')).toBe('block');
  //   expect(testContext.router.controller.$el.find('.o-form-head').text()).toBe('Sign In');
  // });
  //
  // it('should be visible and render initial error', async function() {
  //   jest.spyOn(mocked.interact, 'interact').mockRejectedValue({
  //     error: {
  //       error: 'access_denied',
  //       // eslint-disable-next-line camelcase
  //       error_description: 'OIE is not enabled'
  //     }
  //   });
  //   setup({
  //     useInteractionCodeFlow: true,
  //   });
  //   expect(testContext.router.header.$el.css('display')).toBe('none');
  //   await testContext.router.render(FormController);
  //   expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
  //   expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
  //   expect(testContext.router.header.$el.css('display')).toBe('block');
  //   expect(testContext.router.controller.$el.find('.o-form-error-container').text()).toBe(
  //     'The requested feature is not enabled in this environment.'
  //   );
  // });

  it('should render register page', async function() {
    const mockEnrollProfileResponse = idx.makeIdxState(EnrollProfile);
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    expect(typeof mockIntrospectResponse.actions['currentAuthenticator-recover']).toBe('function');
    jest.spyOn(mockIntrospectResponse.actions, 'currentAuthenticator-recover').mockResolvedValue(mockEnrollProfileResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);
    // jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idx.makeIdxState(XHRIdentifyWithPassword));

    setup({
      useInteractionCodeFlow: true,
      // stateToken: 'obviously-fake',
      initialView: 'reset-password'
    });
    await testContext.router.render(FormController);
    // await delay();
    expect(mockIntrospectResponse.actions['currentAuthenticator-recover']).toHaveBeenCalledWith();
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    // expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1)
    expect(testContext.router.header.$el.css('display')).toBe('block');
    expect(testContext.router.controller.$el.find('.o-form-head').text()).toBe('Sign up');
  });
});
