import Settings from 'models/Settings';
import { startLoginFlow } from 'v2/client/startLoginFlow';
import sessionStorageHelper from 'v2/client/sessionStorageHelper';

jest.mock('v2/client/interact', () => {
  return {
    interact: () => { }
  };
});
jest.mock('v2/client/introspect', () => {
  return {
    introspect: () => { }
  };
});

const mocked = {
  introspect: require('v2/client/introspect'),
  interact: require('v2/client/interact'),
};

describe('v2/client/startLoginFlow', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    jest.spyOn(mocked.interact, 'interact')
      .mockResolvedValue('fake interact response');
    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce('first introspect response');

    testContext.settings = new Settings({
      baseUrl: 'localhost:1234',
      stateToken: 'a test state token from settings',
    });
  });

  it('shall use "proxyIdxResponse" if exists', async () => {
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
    testContext.settings.set({ proxyIdxResponse });
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual({
      rawIdxState: proxyIdxResponse,
      context: proxyIdxResponse,
      neededToProceed: [],
    });
    expect(mocked.interact.interact).not.toHaveBeenCalled();
    expect(mocked.introspect.introspect).not.toHaveBeenCalled();
  });

  it('shall run interation flow when "useInteractionCodeFlow" is on', async () => {
    testContext.settings.set('useInteractionCodeFlow', true);
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual('fake interact response');

    expect(mocked.interact.interact).toHaveBeenCalledWith(testContext.settings);
    expect(mocked.interact.interact).toHaveBeenCalledTimes(1);
    expect(mocked.introspect.introspect).not.toHaveBeenCalled();
  });

  it('shall run interation flow when pass a "interactionHandle"', async () => {
    testContext.settings.set('interactionHandle', 'abc interaction handle 123');
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual('fake interact response');

    expect(mocked.interact.interact).toHaveBeenCalledWith(testContext.settings);
    expect(mocked.interact.interact).toHaveBeenCalledTimes(1);
    expect(mocked.introspect.introspect).not.toHaveBeenCalled();
  });

  it('shall introspect on "settings.stateToken"', async () => {
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual('first introspect response');

    expect(mocked.interact.interact).not.toHaveBeenCalled();
    expect(mocked.introspect.introspect).toHaveBeenCalledTimes(1);
    expect(mocked.introspect.introspect).toHaveBeenCalledWith(
      testContext.settings,
      'a test state token from settings',
    );
    expect(testContext.settings.get('stateToken')).toBe('a test state token from settings');
  });

  it('shall introspect on "settings.stateToken" when overrideExistingStateToken is true', async () => {
    sessionStorageHelper.setStateHandle('fake state handle from session storage');
    testContext.settings.set('overrideExistingStateToken', 'true');
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual('first introspect response');

    expect(mocked.interact.interact).not.toHaveBeenCalled();
    expect(mocked.introspect.introspect).toHaveBeenCalledTimes(1);
    expect(mocked.introspect.introspect).toHaveBeenCalledWith(
      testContext.settings,
      'a test state token from settings',
    );
    expect(testContext.settings.get('stateToken')).toBe('a test state token from settings');
  });

  it('shall introspect on "sessionStorage.stateToken"', async () => {
    sessionStorageHelper.setStateHandle('fake state handle from session storage');
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual('first introspect response');

    expect(mocked.interact.interact).not.toHaveBeenCalled();
    expect(mocked.introspect.introspect).toHaveBeenCalledTimes(1);
    expect(mocked.introspect.introspect).toHaveBeenCalledWith(
      testContext.settings,
      'fake state handle from session storage',
    );
    expect(testContext.settings.get('stateToken'))
      .toBe('fake state handle from session storage');
  });

  it('shall introspect on "settings.stateToken" when "sessionStorage.stateToken" is invalid', async () => {
    mocked.introspect.introspect.mockReset();
    jest.spyOn(mocked.introspect, 'introspect')
      .mockRejectedValueOnce('ERROR - introspect response')
      .mockResolvedValueOnce('another introspect response');

    sessionStorageHelper.setStateHandle('fake state handle from session storage');
    const result = await startLoginFlow(testContext.settings);
    expect(result).toEqual('another introspect response');

    expect(mocked.interact.interact).not.toHaveBeenCalled();
    expect(mocked.introspect.introspect).toHaveBeenCalledTimes(2);
    expect(mocked.introspect.introspect.mock.calls[0][0]).toBe(testContext.settings);
    expect(mocked.introspect.introspect.mock.calls[0][1])
      .toBe('fake state handle from session storage');
    expect(mocked.introspect.introspect.mock.calls[1][0]).toBe(testContext.settings);
    expect(mocked.introspect.introspect.mock.calls[1][1])
      .toBe('a test state token from settings');

    expect(testContext.settings.get('stateToken')).toBe('a test state token from settings');
  });

  it('shall throw error when no valid config', async () => {
    testContext.settings.unset('stateToken');

    try {
      await startLoginFlow(testContext.settings);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.name).toBe('CONFIG_ERROR');
      expect(e.message).toBe(
        'Set "useInteractionCodeFlow" to true in configuration to enable the ' +
        'interaction_code" flow for self-hosted widget.');
    }
  });
});
