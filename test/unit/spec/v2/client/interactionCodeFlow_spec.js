import { interactionCodeFlow } from 'v2/client/interactionCodeFlow';
import { ConfigError } from 'util/Errors';
import { Model } from 'okta';

describe('v2/client/interactionCodeFlow', () => {
  let testContext;
  beforeEach(() => {
    const state = 'a fake state'; // spaces to test URL encoding
    const interactionCode = 'a fake code'; // spaces to test URL encoding
    const codeVerifier = 'code verifier';
    const idxResponse = {
      interactionCode
    };
    const transactionMeta = {
      state,
      codeVerifier
    };
    const authParams = {};
    const authClient = {
      options: authParams,
      token: {
        exchangeCodeForTokens: () => Promise.resolve()
      },
      idx: {
        getSavedTransactionMeta: () => {},
        clearTransactionMeta: () => {}
      }
    };
    const redirectUri = 'fake';
    const settings = new Model();
    settings.set('redirectUri', redirectUri);
    settings.getAuthClient = () => authClient;
    settings.callGlobalSuccess = () => {};
    settings.callGlobalError = () => {};
    testContext = {
      state,
      interactionCode,
      codeVerifier,
      idxResponse,
      transactionMeta,
      settings,
      authParams,
      authClient,
      redirectUri
    };

    // By default return saved transaction meta
    jest.spyOn(authClient.idx, 'getSavedTransactionMeta').mockResolvedValue(transactionMeta);
  });
  
  describe('redirect = always', () => {
    beforeEach(() => {
      testContext.settings.set('redirect', 'always');
      testContext.origLocation = window.location;
      delete window.location;
      window.location = {
        assign: jest.fn()
      };
    });
    afterEach(() => {
      window.location = testContext.origLocation;
    });

    it('throws if redirectUri is not set', async () => {
      testContext.settings.set('redirectUri', null);
      try {
        await interactionCodeFlow(testContext.settings, testContext.idxResponse);
      } catch (e) {
        expect(e.toString()).toBe('CONFIG_ERROR: "redirectUri" is required');
      }
    });

    it('redirects using interaction_code from response and state from saved transaction', async () => {
      await interactionCodeFlow(testContext.settings, testContext.idxResponse);
      expect(window.location.assign).toHaveBeenCalledWith(`${testContext.redirectUri}?interaction_code=a%20fake%20code&state=a%20fake%20state`);
    });

    describe('with authParams.state', () => {
      beforeEach(() => {
        testContext.authParams.state = 'state in authParams';
      });

      it('returns interaction_code and state from authParams.state', async () => {
        await interactionCodeFlow(testContext.settings, testContext.idxResponse);
        expect(window.location.assign).toHaveBeenCalledWith(`${testContext.redirectUri}?interaction_code=a%20fake%20code&state=state%20in%20authParams`);
      });
    });
  });

  describe('remediation mode', () => {
    beforeEach(() => {
      testContext.settings.set('mode', 'remediation');
    });

    it('clears transaction meta', async () => {
      const { authClient, settings, idxResponse } = testContext;
      jest.spyOn(authClient.idx, 'clearTransactionMeta');
      await interactionCodeFlow(settings, idxResponse);
      expect(authClient.idx.clearTransactionMeta).toHaveBeenCalled();
    });

    it('does not exchange code for tokens', async () => {
      jest.spyOn(testContext.authClient.token, 'exchangeCodeForTokens');
      await interactionCodeFlow(testContext.settings, testContext.idxResponse);
      expect(testContext.authClient.token.exchangeCodeForTokens).not.toHaveBeenCalled();
    });

    it('calls global success fn with interaction_code from response and state from saved transaction', async () => {
      jest.spyOn(testContext.settings, 'callGlobalSuccess');
      await interactionCodeFlow(testContext.settings, testContext.idxResponse);
      expect(testContext.settings.callGlobalSuccess).toHaveBeenCalledWith('SUCCESS', {
        'interaction_code': testContext.interactionCode,
        state: testContext.transactionMeta.state
      });
    });

    describe('with authParams.state', () => {
      beforeEach(() => {
        testContext.authParams.state = 'an auth param state';
      });

      it('calls global success fn with interaction_code and state from authParams.state', async () => {
        jest.spyOn(testContext.settings, 'callGlobalSuccess');
        await interactionCodeFlow(testContext.settings, testContext.idxResponse);
        expect(testContext.settings.callGlobalSuccess).toHaveBeenCalledWith('SUCCESS', {
          'interaction_code': testContext.interactionCode,
          state: testContext.authParams.state
        });
      });
    });
  });

  describe('relying-party mode', () => {
    it('throws an exception if transaction meta can not be loaded', async () => {
      const { settings, idxResponse, authClient } = testContext;
      authClient.idx.getSavedTransactionMeta.mockReturnValue(null);
      const expectedError = new ConfigError('Could not load transaction data from storage');
      await expect(interactionCodeFlow(settings, idxResponse)).rejects.toEqual(expectedError);
    });

    it('exchanges code for tokens using the codeVerifier from saved transaction', async () => {
      jest.spyOn(testContext.authClient.token, 'exchangeCodeForTokens');
      const { interactionCode, codeVerifier } = testContext;
      await interactionCodeFlow(testContext.settings, testContext.idxResponse);
      expect(testContext.authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        interactionCode,
        codeVerifier
      });
    });

    it('clears transaction meta', async () => {
      const { authClient, settings, idxResponse } = testContext;
      jest.spyOn(authClient.idx, 'clearTransactionMeta');
      await interactionCodeFlow(settings, idxResponse);
      expect(authClient.idx.clearTransactionMeta).toHaveBeenCalled();
    });

    describe('if exchangeCodeForTokens throws error', () => {
      beforeEach(() => {
        testContext.error = new Error('exchange code error');
        jest.spyOn(testContext.authClient.token, 'exchangeCodeForTokens').mockReturnValue(Promise.reject(testContext.error));
      });
      it('calls the global error handler', async () => {
        jest.spyOn(testContext.settings, 'callGlobalError');
        await interactionCodeFlow(testContext.settings, testContext.idxResponse);
        expect(testContext.settings.callGlobalError).toHaveBeenCalled();
      });

      it('clears transaction meta', async () => {
        const { authClient, settings, idxResponse } = testContext;
        jest.spyOn(authClient.idx, 'clearTransactionMeta');
        await interactionCodeFlow(settings, idxResponse);
        expect(authClient.idx.clearTransactionMeta).toHaveBeenCalled();
      });
    });
  });
});