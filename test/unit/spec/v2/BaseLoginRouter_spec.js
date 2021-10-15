import { _ } from 'okta';
import BaseLoginRouter from 'v2/BaseLoginRouter';
import FormController from 'v2/controllers/FormController';
import $sandbox from 'sandbox';
import getAuthClient from 'widget/getAuthClient';
import idx from '@okta/okta-idx-js';
import XHRIdentifyWithPassword
  from '../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentify from '../../../../playground/mocks/data/idp/idx/identify.json';
import ResetPassword from '../../../../playground/mocks/data/idp/idx/authenticator-reset-password.json';
import EnrollProfile from '../../../../playground/mocks/data/idp/idx/enroll-profile.json';
import XHRIdentifyWithRecovery
  from '../../../../playground/mocks/data/idp/idx/identify-recovery.json';
import UserUnlockAccount from '../../../../playground/mocks/data/idp/idx/user-unlock-account.json';

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

describe('v2/BaseLoginRouter', function() {
  let testContext;

  function setup(settings = {}) {
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
    };
  }

  beforeEach(function() {
    testContext = {};
  });

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
  });

  it('should render without error when initialView not provided', async function() {
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentify);
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(mockIntrospectResponse);

    setup({stateToken: 'foo'});
    await testContext.router.render(FormController);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalledTimes(1);
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken=null, useInteractionCodeFlow=true)', async function() {
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      initialView: 'identify'
    });
    await testContext.router.render(FormController);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken=null, useInteractionCodeFlow=false)', async function() {
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      // useInteractionCodeFlow: true,
      initialView: 'identify'
    });
    await testContext.router.render(FormController);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken="fake-token", useInteractionCodeFlow=false)', async function() {
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(mockIntrospectResponse);

    setup({
      initialView: 'identify',
      stateToken: 'fake-token'
    });
    await testContext.router.render(FormController);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should render identify page (stateToken="fake-token", useInteractionCodeFlow=true)', async function() {
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      initialView: 'identify',
      stateToken: 'fake-token'
    });
    await testContext.router.render(FormController);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('identify');
  });

  it('should result with `enroll-profile` render', async function() {
    const mockEnrollProfileResponse = idx.makeIdxState(EnrollProfile);
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    expect(typeof mockIntrospectResponse.proceed).toBe('function');
    jest.spyOn(mockIntrospectResponse, 'proceed').mockResolvedValue(mockEnrollProfileResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      initialView: 'register'
    });
    await testContext.router.render(FormController);
    expect(mockIntrospectResponse.proceed).toHaveBeenCalledTimes(1);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('enroll-profile');
  });

  it('should result with `reset-authenticator` (password) render', async function() {
    const mockResetPasswordResponse = idx.makeIdxState(ResetPassword);
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithPassword);
    expect(typeof mockIntrospectResponse.actions['currentAuthenticator-recover']).toBe('function');
    jest.spyOn(mockIntrospectResponse.actions, 'currentAuthenticator-recover').mockResolvedValue(mockResetPasswordResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      // stateToken: 'obviously-fake',
      initialView: 'reset-password'
    });
    await testContext.router.render(FormController);
    expect(mockIntrospectResponse.actions['currentAuthenticator-recover']).toHaveBeenCalledTimes(1);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('reset-authenticator');
  });

  it('should result with `select-authenticator-unlock-account` render', async function() {
    const mockUserUnlockAccountResponse = idx.makeIdxState(UserUnlockAccount);
    const mockIntrospectResponse = idx.makeIdxState(XHRIdentifyWithRecovery);
    expect(typeof mockIntrospectResponse.proceed).toBe('function');
    jest.spyOn(mockIntrospectResponse, 'proceed').mockResolvedValue(mockUserUnlockAccountResponse);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(mockIntrospectResponse);

    setup({
      useInteractionCodeFlow: true,
      initialView: 'register'
    });
    await testContext.router.render(FormController);
    expect(mockIntrospectResponse.proceed).toHaveBeenCalledTimes(1);
    expect(testContext.afterErrorHandler).toHaveBeenCalledTimes(0);
    expect(testContext.afterRenderHandler).toHaveBeenCalled();
    expect(testContext.router.appState.getCurrentViewState().name).toBe('select-authenticator-unlock-account');
  });
});
