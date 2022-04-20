import Settings from 'models/Settings';
import { startLoginFlow } from 'v2/client/startLoginFlow';
import sessionStorageHelper from 'v2/client/sessionStorageHelper';

jest.mock('v2/client/emailVerifyCallback', () => {
  return {
    emailVerifyCallback: () => { }
  };
});
const mocked = {
  emailVerifyCallback: require('v2/client/emailVerifyCallback')
};

describe('v2/client/startLoginFlow', () => {
  let testContext;

  beforeEach(() => {
    jest.spyOn(mocked.emailVerifyCallback, 'emailVerifyCallback')
      .mockResolvedValue('fake emailVerifyCallback response');
    const start = jest.fn().mockResolvedValue({
      fake: 'fake start response'
    });
    const proceed = jest.fn().mockResolvedValue({
      fake: 'fake proceed response'
    });
    const introspect = jest.fn().mockResolvedValue({
      fake: 'fake introspect response'
    });
    const settings = new Settings({
      baseUrl: 'localhost:1234',
      stateToken: 'a test state token from settings',
    });
    const authClient = {
      idx: {
        start,
        proceed,
        introspect,
        getFlow: () => {},
        getSavedTransactionMeta: () => {}
      }
    };
    settings.authClient = authClient;
    testContext = {
      start,
      proceed,
      introspect,
      authClient,
      settings
    };
  });

  it('shall use "proxyIdxResponse" if exists', async () => {
    const { settings, start, proceed } = testContext;
    const proxyIdxResponse = {
      'messages': {
        'type': 'array',
        'value': [
          {
            'message': 'You do not have permission to perform the requested action.',
            'i18n': {
              'key': 'security.access_denied'
            },
            'class': 'ERROR'
          }
        ]
      }
    };
    settings.set({ proxyIdxResponse });
    const result = await startLoginFlow(settings);
    expect(result).toEqual({
      rawIdxState: proxyIdxResponse,
      context: proxyIdxResponse,
      neededToProceed: [],
    });
    expect(start).not.toHaveBeenCalled();
    expect(proceed).not.toHaveBeenCalled();
  });

  it('shall do email verify callback when "otp" is defined', async () => {
    const { settings, start, proceed } = testContext;
    settings.set('useInteractionCodeFlow', true);
    settings.set('otp', 'abc');
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual('fake emailVerifyCallback response');

    expect(mocked.emailVerifyCallback.emailVerifyCallback).toHaveBeenCalledWith(testContext.settings);
    expect(mocked.emailVerifyCallback.emailVerifyCallback).toHaveBeenCalledTimes(1);
    expect(start).not.toHaveBeenCalled();
    expect(proceed).not.toHaveBeenCalled();
  });

  it('shall run interaction flow when "useInteractionCodeFlow" is on', async () => {
    const { settings, start, proceed } = testContext;
    settings.set('useInteractionCodeFlow', true);
    const result = await startLoginFlow(settings);
    expect(result).toEqual({
      fake: 'fake start response'
    });

    expect(start).toHaveBeenCalledTimes(1);

    expect(start).toHaveBeenCalledWith({
      exchangeCodeForTokens: false,
      shouldProceedWithEmailAuthenticator: false
    });
    expect(proceed).not.toHaveBeenCalled();
  });

  it('shall call start on "settings.stateToken"', async () => {
    const { settings, start, proceed, introspect } = testContext;
    const result = await startLoginFlow(settings);
    expect(result).toEqual({
      fake: 'fake start response'
    });

    expect(introspect).not.toHaveBeenCalled();
    expect(proceed).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith({
      exchangeCodeForTokens: false,
      shouldProceedWithEmailAuthenticator: false,
      stateHandle: 'a test state token from settings'
    });
    expect(settings.get('stateToken')).toBe('a test state token from settings');
  });

  it('shall start on "settings.stateToken" when overrideExistingStateToken is true', async () => {
    const { settings, start, proceed, introspect } = testContext;
    sessionStorageHelper.setStateHandle('fake state handle from session storage');
    settings.set('overrideExistingStateToken', 'true');
    const result = await startLoginFlow(settings);
    expect(result).toEqual({
      fake: 'fake start response'
    });

    expect(introspect).not.toHaveBeenCalled();
    expect(proceed).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith({
      exchangeCodeForTokens: false,
      shouldProceedWithEmailAuthenticator: false,
      stateHandle: 'a test state token from settings'
    });
    expect(settings.get('stateToken')).toBe('a test state token from settings');
  });

  it('shall start on "sessionStorage.stateToken"', async () => {
    const { settings, start, proceed, introspect } = testContext;
    sessionStorageHelper.setStateHandle('fake state handle from session storage');
    const result = await startLoginFlow(settings);
    expect(result).toEqual({
      fake: 'fake start response'
    });

    expect(introspect).not.toHaveBeenCalled();
    expect(proceed).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith({
      exchangeCodeForTokens: false,
      shouldProceedWithEmailAuthenticator: false,
      stateHandle: 'fake state handle from session storage'
    });
    expect(settings.get('stateToken'))
      .toBe('fake state handle from session storage');
  });

  it('shall start on "settings.stateToken" when "sessionStorage.stateToken" is invalid', async () => {
    const { settings, start, proceed, introspect } = testContext;
    start.mockReset();
    start
      .mockRejectedValueOnce({
        fake: 'ERROR - start response'
      })
      .mockResolvedValueOnce({
        fake: 'another start response'
      });

    sessionStorageHelper.setStateHandle('fake state handle from session storage');
    const result = await startLoginFlow(settings);
    expect(result).toEqual({
      fake: 'another start response'
    });

    expect(introspect).not.toHaveBeenCalled();
    expect(proceed).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(2);
    expect(start.mock.calls[0][0])
      .toEqual({
        exchangeCodeForTokens: false,
        shouldProceedWithEmailAuthenticator: false,
        stateHandle: 'fake state handle from session storage'
      });
    expect(start.mock.calls[1][0])
      .toEqual({
        exchangeCodeForTokens: false,
        shouldProceedWithEmailAuthenticator: false,
        stateHandle: 'a test state token from settings'
      });

    expect(settings.get('stateToken')).toBe('a test state token from settings');
  });

  it('shall throw error when no valid config', async () => {
    const { settings } = testContext;
    settings.unset('stateToken');

    try {
      await startLoginFlow(settings);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.name).toBe('CONFIG_ERROR');
      expect(e.message).toBe(
        'Set "useInteractionCodeFlow" to true in configuration to enable the ' +
        'interaction_code" flow for self-hosted widget.');
    }
  });

});
