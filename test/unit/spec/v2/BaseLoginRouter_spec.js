import { Controller, _ } from 'okta';
import Util from 'helpers/mocks/Util';
import BaseLoginRouter from 'v2/BaseLoginRouter';
import FormController from 'v2/controllers/FormController';
import { OAuthError, ConfiguredFlowError, ConfigError } from 'util/Errors';
import { RecoverableError } from 'util/OAuthErrors';
import $sandbox from 'sandbox';
import getAuthClient from 'helpers/getAuthClient';
import XHRInteract from '../../../../playground/mocks/data/oauth2/interact.json';
import XHRIdentifyWithPassword
from '../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentify from '../../../../playground/mocks/data/idp/idx/identify.json';
import ResetPassword from '../../../../playground/mocks/data/idp/idx/authenticator-reset-password.json';
import EnrollProfile from '../../../../playground/mocks/data/idp/idx/enroll-profile.json';
import UserUnlockAccount from '../../../../playground/mocks/data/idp/idx/user-unlock-account.json';
import UnauthorizedClientError from '../../../../playground/mocks/data/idp/idx/error-400-unauthorized-client.json';
import FakeIdxClientError from '../../../../playground/mocks/data/idp/idx/error-400-fake-error.json';
import IdxSessionExpiredError from '../../../../playground/mocks/data/idp/idx/error-401-session-expired.json';
import IdxRateLimitError from '../../../../playground/mocks/data/idp/idx/error-429-too-many-request-operation-ratelimit';
import SuccessWithInteractionCode from '../../../../playground/mocks/data/idp/idx/success-with-interaction-code.json';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';

const FakeController = Controller.extend({
  postRender() {
    this.trigger('afterRender', {});
  }
});

const TestRouter = BaseLoginRouter.extend({
  routes: {
    '': 'defaultAuth',
    '*wildcard': 'defaultAuth',
  },

  defaultAuth: function() {
    this.render(FakeController);
  },
});

jest.mock('v2/client/startLoginFlow', () => {
  const actual = jest.requireActual('../../../../src/v2/client/startLoginFlow');
  return {
    startLoginFlow: actual.startLoginFlow
  };
});

jest.mock('v2/client/updateAppState', () => {
  const actual = jest.requireActual('../../../../src/v2/client/updateAppState');
  return {
    updateAppState: actual.updateAppState
  };
});

jest.mock('v2/client/interactionCodeFlow', () => {
  const actual = jest.requireActual('../../../../src/v2/client/interactionCodeFlow');
  return {
    interactionCodeFlow: actual.interactionCodeFlow,
  };
});

const mocked = {
  startLoginFlow: require('../../../../src/v2/client/startLoginFlow'),
  updateAppState: require('../../../../src/v2/client/updateAppState'),
  interactionCodeFlow: require('../../../../src/v2/client/interactionCodeFlow'),
};

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
      pkce: settings?.pkce || false,
      clientId: settings?.clientId,
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
    const authClient = getAuthClient({ ...settings, authParams });
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
        return router.render(FakeController);
      },
      ...testContext
    };
  }

  function setupOAuth(settings = {}) {
    const clientId = 'someClientId';
    const codeChallenge = 'someCodeChallenge'; // prevent calculating PKCE values / calling getWellKnown
    testContext = {
      clientId,
      codeChallenge,
      ...testContext
    };
    return setup({
      clientId,
      codeChallenge,
      ...settings
    });
  }

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('restartLoginFlow', () => {
    it('re-renders', () => {
      setup();
      const { router } = testContext;
      router.controller = new FakeController();
      jest.spyOn(router, 'render').mockImplementation();
      router.appState.trigger('restartLoginFlow');
      expect(router.render).toHaveBeenCalledWith(router.controller.constructor);
    });
    it('clears the recoveryToken (before render)', () => {
      const recoveryToken = 'abc';
      setup({
        pkce: true,
        recoveryToken
      });
      const { router, authClient } = testContext;
      const { settings } = router;
      expect(settings.get('recoveryToken')).toBe(recoveryToken);
      expect(authClient.options.recoveryToken).toBe(recoveryToken);

      router.controller = new FakeController();
      let clearInsideRender = false;
      jest.spyOn(router, 'render').mockImplementation(() => {
        expect(authClient.options.recoveryToken).toBe(undefined);
        expect(settings.get('recoveryToken')).toBe(undefined);
        clearInsideRender = true;
      });
      router.appState.trigger('restartLoginFlow');
      expect(router.render).toHaveBeenCalled();
      expect(clearInsideRender).toBe(true);
    });
    it('clears the otp (before render)', () => {
      const otp = '123456';
      setup({
        pkce: true,
        otp
      });
      const { router } = testContext;
      const { settings } = router;
      expect(settings.get('otp')).toBe(otp);

      router.controller = new FakeController();
      let clearInsideRender = false;
      jest.spyOn(router, 'render').mockImplementation(() => {
        expect(settings.get('otp')).toBe(undefined);
        clearInsideRender = true;
      });
      router.appState.trigger('restartLoginFlow');
      expect(router.render).toHaveBeenCalled();
      expect(clearInsideRender).toBe(true);
    });
  });

  describe('ephemeral settings', () => {
    it('will clear "stateToken", "proxyIdxResponse" after render', async () => {
      const mockResponse = {
        messages: {
          value: [{
            message: 'fake'
          }]
        }
      };
      setup({
        stateToken: 'foo',
        proxyIdxResponse: mockResponse
      });
      const { router, render } = testContext;

      const { settings } = router;
      expect(settings.get('stateToken')).toBe('foo');
      expect(settings.get('proxyIdxResponse')).toEqual(mockResponse);
  
      await render();
      expect(settings.get('stateToken')).toBe(undefined);
      expect(settings.get('proxyIdxResponse')).toBe(undefined);
    });
    it('will clear "stateToken", "proxyIdxResponse" after render, even if an exception is thrown', async () => {
      const globalErrorFn = jest.fn();
      setup({
        globalErrorFn,
        pkce: true,
        stateToken: 'foo',
        proxyIdxResponse: false,
      });
      const { router, render, authClient } = testContext;


      const { settings } = router;
      const error = new Error('test error');
      jest.spyOn(authClient.idx, 'start').mockRejectedValue(error);
      expect(settings.get('stateToken')).toBe('foo');
      expect(settings.get('proxyIdxResponse')).toBe(false);
  
      await render();
      expect(globalErrorFn).toHaveBeenCalledWith(error);
      expect(settings.get('stateToken')).toBe(undefined);
      expect(settings.get('proxyIdxResponse')).toBe(undefined);
    });
  });

  describe('error handling', () => {
    it('should render error message when /interact fails with fake error', async function() {
      // jest.spyOn(mocked.interact, 'interact').mockRejectedValue({error: FakeIdxClientError});
      jest.spyOn(TestRouter.prototype, 'handleError');
      const globalErrorFn = jest.fn();  // prevents error from being logged to test console as well

      setupOAuth({
        globalErrorFn,
      });

      Util.mockAjax([
        mockXhr(FakeIdxClientError, 400)
      ]);

      await testContext.router.render(FormController); // use real FormController for error logic
      expect(testContext.router.handleError).toHaveBeenCalledWith(expect.objectContaining(FakeIdxClientError));
      expect(globalErrorFn).toBeCalledWith(expect.objectContaining(FakeIdxClientError));
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

      setupOAuth({
        globalErrorFn,
      });

      Util.mockAjax([
        mockXhr(UnauthorizedClientError, 400)
      ]);

      await testContext.router.render(FormController); // use real FormController for error logic
      expect(testContext.router.handleError).toHaveBeenCalledWith(expect.objectContaining(UnauthorizedClientError));
      expect(globalErrorFn).toBeCalledWith(expect.objectContaining(UnauthorizedClientError));
      expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
      expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
      expect(testContext.router.header.$el.css('display')).toBe('block');
      expect(testContext.router.controller.$el.find('.o-form-error-container').text()).toBe(
        'Something went wrong. Potential misconfiguration detected. Please contact support.'
      );
    });

    it('should set current view to \'terminal\' when encountering termminal non-idx errors', async () => {
      setupOAuth();

      const successfulAuthResponse = {
        rawIdxState: JSON.parse(JSON.stringify(SuccessWithInteractionCode)),
        interactionCode: 'thecode',
      };
      const terminalError = new RecoverableError(new OAuthError('Descriptive error message'), class { terminal = true });

      jest.spyOn(testContext.router.appState, 'setNonIdxError');
      jest.spyOn(mocked.startLoginFlow, 'startLoginFlow').mockResolvedValue(successfulAuthResponse);
      jest.spyOn(mocked.interactionCodeFlow, 'interactionCodeFlow').mockImplementation(() => { throw terminalError; });

      await testContext.router.render(FormController); // use real FormController for error logic

      expect(testContext.router.appState.getCurrentViewState().name).toBe('terminal');
      const [ exception ] = testContext.router.appState.setNonIdxError.mock.calls.pop();
      expect(exception).toBe(terminalError);
    });

    describe('idx session expired errors', () => {
      // ensure 'idx.session.expired' errors clear transaction meta, while other errors do not

      it('should clear transaction meta when `idx.session.expired` error occurs on /introspect', async function() {
        const mockIdxState = {
          rawIdxState: IdxSessionExpiredError,
          requestDidSucceed: false,
          context: {
            messages: {...IdxSessionExpiredError.messages}
          },
          neededToProceed: []
        };

        jest.spyOn(mocked.startLoginFlow, 'startLoginFlow').mockResolvedValue(mockIdxState);
        jest.spyOn(mocked.updateAppState, 'updateAppState');
  
        setupOAuth({
          flow: 'default',
        });
  
        const { router, render, authClient } = testContext;

        jest.spyOn(authClient.transactionManager, 'clear');
    
        router.hasControllerRendered = true;    // skip `handleConfiguredFlow` for this test
        await render();
        expect(authClient.transactionManager.clear).toHaveBeenCalled();
        expect(mocked.updateAppState.updateAppState).toHaveBeenCalledWith(router.appState, mockIdxState);
      });
  
      it('should NOT clear transaction meta when non-`idx.session.expired` error occurs on /introspect', async function() {
        const mockIdxState = {
          rawIdxState: IdxRateLimitError,
          requestDidSucceed: false,
          context: {
            messages: {...IdxRateLimitError.messages}
          },
          neededToProceed: []
        };
  
        jest.spyOn(mocked.startLoginFlow, 'startLoginFlow').mockResolvedValue(mockIdxState);
        jest.spyOn(mocked.updateAppState, 'updateAppState');
  
        setupOAuth({
          flow: 'default',
        });
  
        const { router, render, authClient } = testContext;
  
        jest.spyOn(authClient.transactionManager, 'clear');
    
        router.hasControllerRendered = true;    // skip `handleConfiguredFlow` for this test
        await render();
        expect(authClient.transactionManager.clear).not.toHaveBeenCalled();
        expect(mocked.updateAppState.updateAppState).toHaveBeenCalledWith(router.appState, mockIdxState);
      });
    });
  });

  // test for race condition between appState and form controller
  it('should update appState before rendering the controller)', async function() {
    setup({
      flow: 'default',
      stateToken: 'fake-token'
    });

    const { afterErrorHandler, afterRenderHandler, router, render } = testContext;
    Util.mockAjax([
      mockXhr(RAW_IDX_RESPONSE)
    ]);
    jest.spyOn(FormController.prototype, 'render').mockImplementation(() => {
      try {
        expect(router.appState.getCurrentViewState().name).toBe('identify');
      } catch (e) {
        router.trigger('afterError', e);
        return;
      }
      router.trigger('afterRender');
    });
    await render();
    expect(afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(afterRenderHandler).toHaveBeenCalled();
    expect(router.appState.getCurrentViewState().name).toBe('identify');
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
  
  describe('stateToken flow', () => {
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
    it('should render identify page (flow="default")', async function() {
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
  });

  describe('OAuth', () => {
    it('should render identify page (flow=default)', async function() {
      setupOAuth({
        flow: 'default'
      });
      
      const { afterErrorHandler, afterRenderHandler, router, render } = testContext;
      Util.mockAjax([
        mockXhr(XHRInteract), 
        mockXhr(XHRIdentifyWithPassword)
      ]);
  
      await render();
      expect(afterErrorHandler).toHaveBeenCalledTimes(0);
      expect(afterRenderHandler).toHaveBeenCalled();
      expect(router.appState.getCurrentViewState().name).toBe('identify');
    });
    it('should render identify page (flow="login")', async function() {
      setupOAuth({
        flow: 'login'
      });
      const { afterErrorHandler, afterRenderHandler, router, render } = testContext;
      Util.mockAjax([
        mockXhr(XHRInteract), 
        mockXhr(RAW_IDX_RESPONSE), // introspect
      ]);
      await render();
      expect(afterErrorHandler).toHaveBeenCalledTimes(0);
      expect(afterRenderHandler).toHaveBeenCalled();
      expect(router.appState.getCurrentViewState().name).toBe('identify');
    });
  
    it('should result with `enroll-profile` render (flow="signup")', async function() {
      setupOAuth({
        flow: 'signup'
      });
  
      const { afterErrorHandler, afterRenderHandler, router, render  } = testContext;
      Util.mockAjax([
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
      setupOAuth({
        flow: 'resetPassword',
      });
  
      const { afterErrorHandler, afterRenderHandler, router, render  } = testContext;
  
      Util.mockAjax([
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
      setupOAuth({
        flow: 'unlockAccount',
      });
  
      const { afterErrorHandler, afterRenderHandler, router, render  } = testContext;
  
      Util.mockAjax([
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
      setupOAuth({
        flow: 'signup'
      });
  
      const { authClient, afterErrorHandler, afterRenderHandler, router, render, codeChallenge } = testContext;
      Util.mockAjax([
        mockXhr(EnrollProfile) // introspect
      ]);

      const meta = await authClient.idx.createTransactionMeta();
      meta.interactionHandle = 'fake';
      meta.codeChallenge = codeChallenge;
      
      authClient.idx.saveTransactionMeta(meta);
      expect(authClient.idx.getSavedTransactionMeta()).toEqual(meta);
  
      await render();
      expect(afterErrorHandler).toHaveBeenCalledTimes(0);
      expect(afterRenderHandler).toHaveBeenCalled();
      expect(router.appState.getCurrentViewState().name).toBe('enroll-profile');
    });

    it('should abandon meta flow if it does not match configured flow', async function() {
      setupOAuth({
        flow: 'signup'
      });
  
      Util.mockAjax([
        mockXhr(XHRInteract), 
        mockXhr(RAW_IDX_RESPONSE), // introspect
        mockXhr(EnrollProfile) // enroll
      ]);
  
      const { authClient, afterErrorHandler, afterRenderHandler, router, render, codeChallenge  } = testContext;
      const meta = await authClient.idx.createTransactionMeta();
      meta.interactionHandle = 'fake';
      meta.codeChallenge = codeChallenge;
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

      setupOAuth({
        flow: 'proceed',
        globalErrorFn
      });

      const { authClient, router } = testContext;
      jest.spyOn(authClient.idx, 'getSavedTransactionMeta').mockResolvedValue(null);

      await router.render(FormController);
      expect(authClient.idx.getSavedTransactionMeta).toHaveBeenCalled();
      expect(globalErrorFn).toHaveBeenCalled();
      expect(globalErr).toBeInstanceOf(ConfiguredFlowError);
    });

    it('should throw ConfigError when invalid flow is configured', async function() {

      let globalErr = null;
      const globalErrorFn = jest.fn(err => {
        globalErr = err;
      });
  
      setupOAuth({
        flow: 'notarealflow',
        globalErrorFn
      });
  
      const { afterErrorHandler, afterRenderHandler, router  } = testContext;
  
      Util.mockAjax([
        mockXhr(XHRInteract), 
        mockXhr(RAW_IDX_RESPONSE), // introspect
        mockXhr(EnrollProfile) // enroll
      ]);
  
      await router.render(FormController);
      expect(afterErrorHandler).toHaveBeenCalledTimes(0);
      expect(afterRenderHandler).toHaveBeenCalledTimes(1); // generic message is displayed
      expect(globalErrorFn).toHaveBeenCalled();
      expect(globalErr).toBeInstanceOf(ConfigError);
    });

  });

});
