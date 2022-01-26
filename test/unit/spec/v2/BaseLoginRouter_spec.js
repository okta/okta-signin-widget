import { _ } from 'okta';
import Util from 'helpers/mocks/Util';
import BaseLoginRouter from 'v2/BaseLoginRouter';
import FormController from 'v2/controllers/FormController';
import Errors from 'util/Errors';
import $sandbox from 'sandbox';
import getAuthClient from 'widget/getAuthClient';
import XHRInteract from '../../../../playground/mocks/data/oauth2/interact.json';
import XHRWellKnown from '../../../../playground/mocks/data/oauth2/well-known-openid-configuration.json';
import XHRIdentifyWithPassword
  from '../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentify from '../../../../playground/mocks/data/idp/idx/identify.json';
import ResetPassword from '../../../../playground/mocks/data/idp/idx/authenticator-reset-password.json';
import EnrollProfile from '../../../../playground/mocks/data/idp/idx/enroll-profile.json';
import UserUnlockAccount from '../../../../playground/mocks/data/idp/idx/user-unlock-account.json';
import UnauthorizedClientError from '../../../../playground/mocks/data/idp/idx/error-400-unauthorized-client.json';
import FakeIdxClientError from '../../../../playground/mocks/data/idp/idx/error-400-fake-error.json';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';

const TestRouter = BaseLoginRouter.extend({
  routes: {
    '': 'defaultAuth',
    '*wildcard': 'defaultAuth',
  },

  defaultAuth: function() {
    this.render(FormController);
  },
});

describe('v2/BaseLoginRouter', function() {
  let testContext;

  beforeEach(function() {
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    testContext = {};
  });

  function mockXhr(jsonResponse, status=200) {
    return {
      status,
      responseType: 'json',
      response: jsonResponse,
    };
  }

  function setup(settings = {}) {
    const baseUrl = 'http://localhost:3000';
    const authParams = {
      issuer: baseUrl,
      pkce: settings?.useInteractionCodeFlow || false,
      clientId: 'somestring',
      flow: settings?.flow,
      codeChallenge: settings?.codeChallenge,
      transactionManager: {
        saveLastResponse: false // causes spooky effects in tests
      }
    };
    Object.keys(settings).forEach(key => {
      const parts = key.split('.');
      if (parts[0] === 'authParams') {
        authParams[parts[1]] = settings[key];
      }
    });
    const authClient = getAuthClient({ authParams });
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

    const afterRenderHandler = jest.fn();
    const afterErrorHandler = jest.fn();

    router.on('afterRender', afterRenderHandler);
    router.on('afterError', afterErrorHandler);

    testContext = {
      authClient,
      router,
      afterRenderHandler,
      afterErrorHandler,
      render: () => {
        return new Promise((resolve, reject) => {
          router.on('afterRender', resolve);
          router.on('afterError', reject);
          router.render(FormController);
        });
      },
    };
  }

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('error handling', () => {
    it('should render error message when /interact fails with fake error', async function() {
      // jest.spyOn(mocked.interact, 'interact').mockRejectedValue({error: FakeIdxClientError});
      jest.spyOn(TestRouter.prototype, 'handleError');
      const globalErrorFn = jest.fn();  // prevents error from being logged to test console as well

      setup({
        useInteractionCodeFlow: true,
        globalErrorFn,
        codeChallenge: 'fake' // avoid calculating PKCE values
      });

      Util.mockAjax([
        mockXhr(XHRWellKnown),
        mockXhr(FakeIdxClientError, 400)
      ]);

      await testContext.router.render(FormController);
      expect(testContext.router.handleError).toHaveBeenCalledWith(FakeIdxClientError);
      expect(globalErrorFn).toBeCalledWith(FakeIdxClientError);
      expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
      expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
      expect(testContext.router.header.$el.css('display')).toBe('block');
      expect(testContext.router.controller.$el.find('.o-form-error-container').text()).toBe(
        'Something went wrong. Potential misconfiguration detected. Please contact support.'
      );
    });

    it('should render error message when /interact fails with possible configuration error', async function() {
      // jest.spyOn(mocked.interact, 'interact').mockRejectedValue({error: UnauthorizedClientError});
      jest.spyOn(TestRouter.prototype, 'handleError');
      const globalErrorFn = jest.fn();  // prevents error from being logged to test console as well

      setup({
        useInteractionCodeFlow: true,
        globalErrorFn,
        codeChallenge: 'fake' // avoid calculating PKCE values
      });

      Util.mockAjax([
        mockXhr(XHRWellKnown),
        mockXhr(UnauthorizedClientError, 400)
      ]);

      await testContext.router.render(FormController);
      expect(testContext.router.handleError).toHaveBeenCalledWith(UnauthorizedClientError);
      expect(globalErrorFn).toBeCalledWith(UnauthorizedClientError);
      expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
      expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
      expect(testContext.router.header.$el.css('display')).toBe('block');
      expect(testContext.router.controller.$el.find('.o-form-error-container').text()).toBe(
        'Something went wrong. Potential misconfiguration detected. Please contact support.'
      );
    });
  });

  it('should render without error when flow not provided', async function() {
    setup({stateToken: 'foo'});

    const { afterErrorHandler, afterRenderHandler, router, render} = testContext;
    Util.mockAjax([
      mockXhr(XHRIdentify)
    ]);

    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalledTimes(1);
    expect(router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken=null, useInteractionCodeFlow=true)', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'default',
      codeChallenge: 'fake' // avoid calculating PKCE values
    });
    
    const { afterErrorHandler, afterRenderHandler, router, render } = testContext;
    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(XHRIdentifyWithPassword)
    ]);

    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken="fake-token", useInteractionCodeFlow=false)', async function() {
    setup({
      flow: 'default',
      stateToken: 'fake-token'
    });

    const { afterErrorHandler, afterRenderHandler, router, render } = testContext;
    Util.mockAjax([
      mockXhr(RAW_IDX_RESPONSE)
    ]);
    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken="fake-token", useInteractionCodeFlow=true)', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'default',
      codeChallenge: 'fake',
      stateToken: 'fake-token' // will ignore stateToken
    });

    const { afterErrorHandler, afterRenderHandler, router, render } = testContext;
    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(RAW_IDX_RESPONSE), // introspect
    ]);
    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (flow="login")', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'login',
      codeChallenge: 'fake'
    });
    const { afterErrorHandler, afterRenderHandler, router, render } = testContext;
    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(RAW_IDX_RESPONSE), // introspect
    ]);
    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should result with `enroll-profile` render (flow="signup")', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'signup',
      codeChallenge: 'fake'
    });

    const { afterErrorHandler, afterRenderHandler, router, render  } = testContext;
    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(RAW_IDX_RESPONSE), // introspect
      mockXhr(EnrollProfile) // enroll
    ]);

    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('enroll-profile');
  });

  it('should result with `reset-authenticator` (password) render (flow="resetPassword")', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'resetPassword',
      codeChallenge: 'fake'
    });

    const { afterErrorHandler, afterRenderHandler, router, render  } = testContext;

    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(RAW_IDX_RESPONSE), // introspect
      mockXhr(ResetPassword) // currentAuthenticator-recover
    ]);

    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('reset-authenticator');
  });

  it('should result with `select-authenticator-unlock-account` render (flow="unlockAccount")', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'unlockAccount',
      codeChallenge: 'fake'
    });

    const { afterErrorHandler, afterRenderHandler, router, render  } = testContext;

    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(RAW_IDX_RESPONSE), // introspect
      mockXhr(UserUnlockAccount) // user unlock
    ]);

    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('select-authenticator-unlock-account');
  });

  it('can continue a saved flow', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'signup',
      codeChallenge: 'fake'
    });

    const { authClient, afterErrorHandler, afterRenderHandler, router, render  } = testContext;
    Util.mockAjax([
      mockXhr(XHRWellKnown), // validate code challenge method
      mockXhr(EnrollProfile) // introspect
    ]);
    const meta = await authClient.idx.createTransactionMeta();
    meta.interactionHandle = 'fake';
    authClient.idx.saveTransactionMeta(meta);
    expect(authClient.idx.getSavedTransactionMeta()).toEqual(meta);

    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('enroll-profile');
  });

  it('should abandon meta flow if it does not match configured flow', async function() {
    setup({
      useInteractionCodeFlow: true,
      flow: 'signup',
      codeChallenge: 'fake'
    });

    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(RAW_IDX_RESPONSE), // introspect
      mockXhr(EnrollProfile) // enroll
    ]);

    const { authClient, afterErrorHandler, afterRenderHandler, router, render  } = testContext;
    const meta = await authClient.idx.createTransactionMeta();
    meta.interactionHandle = 'fake';
    authClient.idx.saveTransactionMeta(meta);
    expect(authClient.idx.getSavedTransactionMeta()).toEqual(meta);
    meta.flow = 'login';
    authClient.idx.saveTransactionMeta(meta);
    expect(authClient.idx.getSavedTransactionMeta()).toBe(undefined); // fails flow check

    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('enroll-profile');
  });

  it('should throw FlowError when there is no transaction on flow=PROCEED', async function() {
    let globalErr = null;
    const globalErrorFn = jest.fn(err => {
      globalErr = err;
    });

    setup({
      useInteractionCodeFlow: true,
      flow: 'proceed',
      globalErrorFn
    });

    const { authClient, router } = testContext;
    jest.spyOn(authClient.idx, 'getSavedTransactionMeta').mockResolvedValue(null);

    await router.render(FormController);
    expect(authClient.idx.getSavedTransactionMeta).toHaveBeenCalled();
    expect(globalErrorFn).toHaveBeenCalled();
    expect(globalErr).toBeInstanceOf(Errors.ConfiguredFlowError);
  });

  it('should throw ConfigError when invalid flow is configured', async function() {

    let globalErr = null;
    const globalErrorFn = jest.fn(err => {
      globalErr = err;
    });

    setup({
      useInteractionCodeFlow: true,
      flow: 'notarealflow',
      codeChallenge: 'fake',
      globalErrorFn
    });

    const { afterErrorHandler, afterRenderHandler, router  } = testContext;

    Util.mockAjax([
      mockXhr(XHRWellKnown),
      mockXhr(XHRInteract), 
      mockXhr(RAW_IDX_RESPONSE), // introspect
      mockXhr(EnrollProfile) // enroll
    ]);

    await router.render(FormController);
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalledTimes(1); // generic message is displayed
    expect(globalErrorFn).toHaveBeenCalled();
    expect(globalErr).toBeInstanceOf(Errors.ConfigError);
  });
});
