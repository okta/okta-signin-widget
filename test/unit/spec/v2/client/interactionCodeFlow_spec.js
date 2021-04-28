import { interactionCodeFlow } from 'v2/client/interactionCodeFlow';
import { Model } from 'okta';

jest.mock('v2/client/transactionMeta', () => {
  return {
    clearTransactionMeta: () => {}
  };
});

const mocked = {
  transactionMeta: require('v2/client/transactionMeta')
};

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
      transactionManager: {
        load: () => transactionMeta
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve()
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
      jest.spyOn(mocked.transactionMeta, 'clearTransactionMeta');
      await interactionCodeFlow(testContext.settings, testContext.idxResponse);
      expect(mocked.transactionMeta.clearTransactionMeta).toHaveBeenCalled();
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
      jest.spyOn(mocked.transactionMeta, 'clearTransactionMeta');
      await interactionCodeFlow(testContext.settings, testContext.idxResponse);
      expect(mocked.transactionMeta.clearTransactionMeta).toHaveBeenCalled();
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
        jest.spyOn(mocked.transactionMeta, 'clearTransactionMeta');
        await interactionCodeFlow(testContext.settings, testContext.idxResponse);
        expect(mocked.transactionMeta.clearTransactionMeta).toHaveBeenCalled();
      });
    });
  });
});