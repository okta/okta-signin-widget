import Settings from 'models/Settings';
import Errors from 'util/Errors';
import idx from '@okta/okta-idx-js';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';
import { handleConfiguredFlow } from '../../../../../src/v2/client';

jest.mock('v2/client/interact', () => {
  return {
    interact: () => { }
  };
});

jest.mock('v2/client/transactionMeta', () => ({
  getTransactionMeta: () => jest.fn(() => Promise.resolve({})),
  getSavedTransactionMeta: jest.fn(() => Promise.resolve({})),
  saveTransactionMeta: jest.fn(() => Promise.resolve({})),
  clearTransactionMeta: jest.fn(),
}));

const mocked = {
  interact: require('v2/client/interact'),
  transactionMeta: require('v2/client/transactionMeta'),
};

describe('v2/client/handleConfiguredFlow', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  function setup(options) {
    const settings = new Settings({
      baseUrl: 'http://localhost:3000',
      ...options
    }, { parse: true });

    testContext.idxState = idx.makeIdxState(RAW_IDX_RESPONSE);
    jest.spyOn(testContext.idxState, 'proceed').mockResolvedValue(options.flow || 'noflow');

    return { settings, idxState: testContext.idxState };
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
    expect(idx).toBe(flow);
  });

  it('flow=RESET_PASSWORD', async () => {
    const flow = 'resetPassword';
    const { settings, idxState } = setup({flow});

    expect(typeof idxState.actions['currentAuthenticator-recover']).toBe('function');
    jest.spyOn(idxState.actions, 'currentAuthenticator-recover').mockResolvedValue(flow);

    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(flow);
  });


  it('flow=UNLOCK_ACCOUNT', async () => {
    const flow = 'unlockAccount';
    const { settings, idxState } = setup({flow});
    const idx = await handleConfiguredFlow(idxState, settings);
    expect(idx).toBe(flow);
  });

  it('should start new flow when flow !== meta.flow', async () => {
    const flow = 'login';
    jest.spyOn(mocked.transactionMeta, 'getTransactionMeta').mockResolvedValue({flow: 'signup'});
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue(flow);

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