import Settings from 'models/Settings';
import Errors from 'util/Errors';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';
import { handleConfiguredFlow } from '../../../../../src/v2/client';

describe('v2/client/handleConfiguredFlow', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  function makeIdxState(rawIdxResponse) {
    const clonedResponse = JSON.parse(JSON.stringify(rawIdxResponse));
    return {
      neededToProceed: clonedResponse.remediation.value,
      actions: {
        'currentAuthenticator-recover': () => {}
      },
      proceed: () => {}
    };
  }

  function setup(options) {
    const authClient = {
      idx: {
        getFlow: () => options.flow,
      }
    };
    testContext.authClient = authClient;

    const settings = new Settings({
      baseUrl: 'http://localhost:3000',
      ...options
    }, { parse: true });
    jest.spyOn(settings, 'getAuthClient').mockReturnValue(authClient);
    testContext.settings = settings;

    testContext.idxState = makeIdxState(RAW_IDX_RESPONSE);
    jest.spyOn(testContext.idxState, 'proceed').mockResolvedValue(options.flow || 'noflow');

    
    return testContext;
  }

  it('flow=\'\'', async () => {
    const { settings, idxState } = setup({});
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(idxState);
  });

  it('flow=DEFAULT', async () => {
    const flow = 'default';
    const { settings, idxState } = setup({flow});
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(idxState);
  });

  it('flow=PROCEED', async () => {
    const flow = 'proceed';
    const { settings, idxState } = setup({flow});
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(idxState);
  });

  it('flow=LOGIN', async () => {
    const flow = 'login';
    const { settings, idxState } = setup({flow});
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(idxState);
  });

  it('flow=SIGNUP', async () => {
    const flow = 'signup';
    const { settings, idxState } = setup({flow});
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(idxState);
  });

  it('flow=RESET_PASSWORD', async () => {
    const flow = 'resetPassword';
    const { settings, idxState } = setup({flow});

    expect(typeof idxState.actions['currentAuthenticator-recover']).toBe('function');
    jest.spyOn(idxState.actions, 'currentAuthenticator-recover').mockResolvedValue(flow);

    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(idxState);
  });

  it('flow=UNLOCK_ACCOUNT', async () => {
    const flow = 'unlockAccount';
    const { settings, idxState } = setup({flow});
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(flow);
  });

  it('should return original idxResponse when remediation not available', async () => {
    const flow = 'login';
    const { settings, idxState } = setup({flow});

    idxState.neededToProceed = [];    // tricks function into think no remediations are available
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(idxState);
  });

  it('should throw ConfigError, invalid flow config', async () => {
    const { settings, idxState } = setup({
      flow: 'notarealvalue'
    });
    await expect(handleConfiguredFlow(idxState, settings)).rejects.toThrow(Errors.ConfigError);
  });
});