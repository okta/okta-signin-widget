import { _ } from 'okta';
import BaseLoginRouter from 'v2/BaseLoginRouter';
import FormController from 'v2/controllers/FormController';
import Errors from 'util/Errors';
import $sandbox from 'sandbox';
import getAuthClient from 'widget/getAuthClient';
import idx from '@okta/okta-idx-js';
import XHRIdentifyWithPassword
  from '../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentify from '../../../../playground/mocks/data/idp/idx/identify.json';
import ResetPassword from '../../../../playground/mocks/data/idp/idx/authenticator-reset-password.json';
import EnrollProfile from '../../../../playground/mocks/data/idp/idx/enroll-profile.json';
import UserUnlockAccount from '../../../../playground/mocks/data/idp/idx/user-unlock-account.json';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';

jest.mock('v2/client/interact', () => {
  return {
    interact: () => { }
  };
});

jest.mock('v2/client/introspect', () => ({
  introspect: () => { }
}));

jest.mock('v2/client/transactionMeta', () => ({
  getTransactionMeta: () => jest.fn(() => Promise.resolve({})),
  getSavedTransactionMeta: jest.fn(() => Promise.resolve({})),
  saveTransactionMeta: jest.fn(() => Promise.resolve({})),
  clearTransactionMeta: jest.fn(),
}));

const mocked = {
  interact: require('v2/client/interact'),
  introspect: require('v2/client/introspect'),
  transactionMeta: require('v2/client/transactionMeta'),
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

describe('v2/BaseLoginRouter', function() {
  let testContext;

  function setup(settings = {}) {
    const baseUrl = 'http://localhost:3000';
    const authParams = {
      issuer: baseUrl,
      pkce: settings?.useInteractionCodeFlow || false,
      clientId: 'somestring'
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

  beforeEach(function() {
    testContext = {};
  });

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
  });

  it('should render without error when flow not provided', async function() {
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentify);
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(mockIntrospectResponse);

    setup({stateToken: 'foo'});
    await testContext.render();
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken=null, useInteractionCodeFlow=true)', async function() {
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      flow: 'default'
    });
    await testContext.render();
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken="fake-token", useInteractionCodeFlow=false)', async function() {
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(mockIntrospectResponse);

    setup({
      flow: 'default',
      stateToken: 'fake-token'
    });
    await testContext.render();
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken="fake-token", useInteractionCodeFlow=true)', async function() {
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      flow: 'default',
      stateToken: 'fake-token'
    });
    await testContext.render();
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (flow="login")', async function() {
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      flow: 'login',
    });
    await testContext.render();
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should result with `enroll-profile` render (flow="signup")', async function() {
    const mockEnrollProfileResponse = idx.makeIdxState(EnrollProfile);
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    expect(typeof mockIntrospectResponse.proceed).toBe('function');
    jest.spyOn(mockIntrospectResponse, 'proceed').mockResolvedValue(mockEnrollProfileResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      flow: 'signup'
    });
    await testContext.render();
    expect(mockIntrospectResponse.proceed).toHaveBeenCalledTimes(1);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('enroll-profile');
  });

  it('should result with `reset-authenticator` (password) render (flow="resetPassword")', async function() {
    const mockResetPasswordResponse = idx.makeIdxState(ResetPassword);
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    expect(typeof mockIntrospectResponse.actions['currentAuthenticator-recover']).toBe('function');
    jest.spyOn(mockIntrospectResponse.actions, 'currentAuthenticator-recover').mockResolvedValue(mockResetPasswordResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      flow: 'resetPassword'
    });
    await testContext.render();
    expect(mockIntrospectResponse.actions['currentAuthenticator-recover']).toHaveBeenCalledTimes(1);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('reset-authenticator');
  });

  it('should result with `select-authenticator-unlock-account` render (flow="unlockAccount")', async function() {
    const mockUserUnlockAccountResponse = idx.makeIdxState(UserUnlockAccount);
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    expect(typeof mockIntrospectResponse.proceed).toBe('function');
    jest.spyOn(mockIntrospectResponse, 'proceed').mockResolvedValue(mockUserUnlockAccountResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      flow: 'unlockAccount'
    });
    await testContext.render();
    expect(mockIntrospectResponse.proceed).toHaveBeenCalledTimes(1);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('select-authenticator-unlock-account');
  });

  it('should abandon meta flow for configured flow', async function() {
    jest.spyOn(mocked.transactionMeta, 'getTransactionMeta').mockResolvedValue({flow: 'login'});
    jest.spyOn(mocked.transactionMeta, 'clearTransactionMeta');
    const mockEnrollProfileResponse = idx.makeIdxState(EnrollProfile);
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    expect(typeof mockIntrospectResponse.proceed).toBe('function');
    jest.spyOn(mockIntrospectResponse, 'proceed').mockResolvedValue(mockEnrollProfileResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      flow: 'signup'
    });
    await testContext.render();
    expect(mockIntrospectResponse.proceed).toHaveBeenCalledTimes(1);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(mocked.transactionMeta.clearTransactionMeta).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('enroll-profile');
  });

  it('should throw FlowError when there is no transaction on flow=PROCEED', async function() {
    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockResolvedValue(null);

    let globalErr = null;
    const globalErrorFn = jest.fn(err => {
      globalErr = err;
    });

    setup({
      useInteractionCodeFlow: true,
      flow: 'proceed',
      globalErrorFn
    });
    await testContext.router.render(FormController);
    expect(mocked.transactionMeta.getSavedTransactionMeta).toHaveBeenCalled();
    expect(globalErrorFn).toHaveBeenCalled();
    expect(globalErr).toBeInstanceOf(Errors.ConfiguredFlowError);
  });

  it('should throw ConfigError when invalid flow is configured', async function() {
    const mockEnrollProfileResponse = idx.makeIdxState(EnrollProfile);
    const mockIntrospectResponse = idx.makeIdxState(RAW_IDX_RESPONSE);
    expect(typeof mockIntrospectResponse.proceed).toBe('function');
    jest.spyOn(mockIntrospectResponse, 'proceed').mockResolvedValue(mockEnrollProfileResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    let globalErr = null;
    const globalErrorFn = jest.fn(err => {
      globalErr = err;
    });

    setup({
      useInteractionCodeFlow: true,
      flow: 'notarealflow',
      globalErrorFn
    });
    await testContext.router.render(FormController);
    expect(mockIntrospectResponse.proceed).toHaveBeenCalledTimes(0);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(0);
    expect(globalErrorFn).toHaveBeenCalled();
    expect(globalErr).toBeInstanceOf(Errors.ConfigError);
  });
});
