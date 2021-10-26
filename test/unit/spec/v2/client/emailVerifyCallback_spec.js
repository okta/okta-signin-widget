import { emailVerifyCallback } from 'v2/client/emailVerifyCallback';
import { Model } from 'okta';

jest.mock('v2/client/transactionMeta', () => {
  return {
    getSavedTransactionMeta: () => {},
    clearTransactionMeta: () => {}
  };
});

const mocked = {
  transactionMeta: require('v2/client/transactionMeta')
};

describe('email verify callback', () => {
  let testContext;
  beforeEach(() => {
    const authClient = {
      idx: {
        introspect: () => {}
      }
    };
    const settings = new Model();
    settings.getAuthClient = () => authClient;
    testContext = {
      authClient,
      settings
    };
  });
  it('passes the interactionHandle from storage and stateTokenExternalId from settings', async () => {
    const { settings, authClient } = testContext;
    const stateTokenExternalId = 'fake-stateToken';
    const interactionHandle = 'fake-interactionHandle';
    settings.set('stateTokenExternalId', stateTokenExternalId);
    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockResolvedValue({ interactionHandle });
    jest.spyOn(authClient.idx, 'introspect');
    await emailVerifyCallback(settings);
    expect(authClient.idx.introspect).toHaveBeenCalledWith({
      interactionHandle,
      stateTokenExternalId
    });
  });
  it('if no interactionHandle in storage, passes only stateTokenExternalId from settings', async () => {
    const { settings, authClient } = testContext;
    const stateTokenExternalId = 'fake-stateToken';
    settings.set('stateTokenExternalId', stateTokenExternalId);
    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockResolvedValue({});
    jest.spyOn(authClient.idx, 'introspect');
    await emailVerifyCallback(settings);
    expect(authClient.idx.introspect).toHaveBeenCalledWith({
      stateTokenExternalId
    });
  });
  it('if storage is null, passes only stateTokenExternalId from settings', async () => {
    const { settings, authClient } = testContext;
    const stateTokenExternalId = 'fake-stateToken';
    settings.set('stateTokenExternalId', stateTokenExternalId);
    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockResolvedValue(null);
    jest.spyOn(authClient.idx, 'introspect');
    await emailVerifyCallback(settings);
    expect(authClient.idx.introspect).toHaveBeenCalledWith({
      stateTokenExternalId
    });
  });
  it('returns response from idx.introspect', async () => {
    const { settings, authClient } = testContext;
    const stateTokenExternalId = 'fake-stateToken';
    settings.set('stateTokenExternalId', stateTokenExternalId);
    const idxResponse = { fake: true };
    jest.spyOn(authClient.idx, 'introspect').mockResolvedValue(idxResponse);
    const res = await emailVerifyCallback(settings);
    expect(res).toBe(idxResponse);
  });
});