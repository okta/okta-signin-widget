import {
  createTransactionMeta,
  getTransactionMeta,
  saveTransactionMeta,
  clearTransactionMeta,
  isTransactionMetaValid
} from 'v2/client/transactionMeta';
import { Model } from 'okta';

jest.mock('util/Logger', () => {
  return {
    warn: () => {}
  };
});

const mocked = {
  Logger: require('util/Logger')
};

describe('v2/client/transactionMeta', () => {
  let testContext;
  beforeEach(() => {
    const state = 'a-test-state';
    const interactionHandle = 'a-test-interaction-handle';
    const codeChallenge = 'a-test-code-challenge';
    const codeChallengeMethod = 'test-code-challenge-method';
    const transactionMeta = {
      state,
      interactionHandle,
      codeChallenge,
      codeChallengeMethod
    };
    const authParams = {};
    const authClient = {
      options: authParams,
      transactionManager: {
        exists: () => !!testContext.transactionMeta,
        load: () => testContext.transactionMeta,
        clear: () => {},
        save: () => {}
      },
      token: {
        prepareTokenParams: () => Promise.resolve()
      }
    };
    const settings = new Model();
    settings.getAuthClient = () => authClient;
    testContext = {
      interactionHandle,
      codeChallenge,
      codeChallengeMethod,
      transactionMeta,
      settings,
      authParams,
      authClient
    };
  });
  
  function assertIsPromise(res) {
    expect(typeof res.then).toBe('function');
    expect(typeof res.catch).toBe('function');
    expect(typeof res.finally).toBe('function');
  }

  describe('createTransactionMeta', () => {
    it('calls `authClient.token.prepareTokenParams`', async () => {
      jest.spyOn(testContext.authClient.token, 'prepareTokenParams');
      await createTransactionMeta(testContext.settings);
      expect(testContext.authClient.token.prepareTokenParams).toHaveBeenCalled();
    });
    it('returns a promise', () => {
      const res = createTransactionMeta(testContext.settings);
      assertIsPromise(res);
      return res;
    });
  });

  describe('getTransactionMeta', () => {
    it('returns a promise', () => {
      const res = getTransactionMeta(testContext.settings);
      assertIsPromise(res);
      return res;
    });
    describe('no existing meta', () => {
      beforeEach(() => {
        testContext.transactionMeta = null;
        expect(testContext.authClient.transactionManager.exists()).toBe(false);
        testContext.newMeta = { foo: 'bar' };
        jest.spyOn(testContext.authClient.token, 'prepareTokenParams').mockReturnValue(Promise.resolve(testContext.newMeta));
      });
      it('returns new meta', async () => {
        const res = await getTransactionMeta(testContext.settings);
        expect(res).toEqual(testContext.newMeta);
      });
      it('honors `codeChallenge`, and `codeChallengeMethod` options', async () => {
        testContext.settings.set('codeChallenge', testContext.codeChallenge);
        testContext.settings.set('codeChallengeMethod', testContext.codeChallengeMethod);
        const res = await getTransactionMeta(testContext.settings);
        expect(res.foo).toBe('bar');
        expect(res.codeChallenge).toBe(testContext.codeChallenge);
        expect(res.codeChallengeMethod).toBe(testContext.codeChallengeMethod);
      });
    });

    describe('with existing meta', () => {
      describe('existing is valid', () => {
        beforeEach(() => {
          jest.spyOn(testContext.authClient.token, 'prepareTokenParams');
        });
        afterEach(() => {
          expect(testContext.authClient.token.prepareTokenParams).not.toHaveBeenCalled();
        });
        it('returns existing meta', async () => {
          const res = await getTransactionMeta(testContext.settings);
          expect(res).toEqual(testContext.transactionMeta);
        });
        it('honors `codeChallenge`, and `codeChallengeMethod` options', async () => {
          const { codeChallenge, codeChallengeMethod } = testContext;
          testContext.settings.set('codeChallenge', codeChallenge);
          testContext.settings.set('codeChallengeMethod', codeChallengeMethod);
          Object.assign(testContext.transactionMeta, {
            codeChallenge,
            codeChallengeMethod 
          });

          const res = await getTransactionMeta(testContext.settings);
          expect(res).toEqual(testContext.transactionMeta);
          expect(res.codeChallenge).toBe(codeChallenge);
          expect(res.codeChallengeMethod).toBe(codeChallengeMethod);
        });
      });

      describe('existing is invalid', () => {
        beforeEach(() => {
          testContext.newMeta = { foo: 'bar' };
          jest.spyOn(testContext.authClient.token, 'prepareTokenParams').mockReturnValue(Promise.resolve(testContext.newMeta));
          testContext.authParams.clientId = 'fake'; // will cause transaction meta to be invalid
        });
        afterEach(() => {
          expect(testContext.authClient.token.prepareTokenParams).toHaveBeenCalled();
        });

        it('returns new meta', async () => {
          const res = await getTransactionMeta(testContext.settings);
          expect(res).toEqual(testContext.newMeta);
        });
  
        it('honors `codeChallenge`, and `codeChallengeMethod` options', async () => {
          const { codeChallenge, codeChallengeMethod } = testContext;
          testContext.settings.set('codeChallenge', codeChallenge);
          testContext.settings.set('codeChallengeMethod', codeChallengeMethod);
  
          const res = await getTransactionMeta(testContext.settings);
          expect(res.foo).toBe('bar');
          expect(res.codeChallenge).toBe(codeChallenge);
          expect(res.codeChallengeMethod).toBe(codeChallengeMethod);
        });

        it('prints a warning message', async () => {
          jest.spyOn(mocked.Logger, 'warn');
          await getTransactionMeta(testContext.settings);

          expect(mocked.Logger.warn).toHaveBeenCalledWith(
            'Saved transaction meta does not match the current configuration. ' + 
            'This may indicate that two apps are sharing a storage key.'
          );
        });
      });
    });
  });

  describe('saveTransactionMeta', () => {
    it('calls `authClient.transactionManager.save`', () => {
      jest.spyOn(testContext.authClient.transactionManager, 'save');
      saveTransactionMeta(testContext.settings, testContext.transactionMeta);
      expect(testContext.authClient.transactionManager.save).toHaveBeenCalledWith(testContext.transactionMeta);
    });
  });

  describe('clearTransactionMeta', () => {
    it('calls `authClient.transactionManager.clear`', () => {
      jest.spyOn(testContext.authClient.transactionManager, 'clear');
      clearTransactionMeta(testContext.settings);
      expect(testContext.authClient.transactionManager.clear).toHaveBeenCalledWith();
    });
  });


  describe('isTransactionMetaValid', () => {
    it('returns false if `clientId` does not match', () => {
      testContext.transactionMeta.clientId = 'abc';
      testContext.authParams.clientId = 'def';
      expect(isTransactionMetaValid(testContext.settings, testContext.transactionMeta)).toBe(false);
    });

    it('returns false if `redirectUri` does not match', () => {
      testContext.transactionMeta.redirectUri = 'abc';
      testContext.authParams.redirectUri = 'def';
      expect(isTransactionMetaValid(testContext.settings, testContext.transactionMeta)).toBe(false);
    });

    it('returns false if `codeChallenge` does not match', () => {
      testContext.transactionMeta.codeChallenge = 'abc';
      testContext.settings.set('codeChallenge', 'def');
      expect(isTransactionMetaValid(testContext.settings, testContext.transactionMeta)).toBe(false);
    });

    it('returns false if `codeChallengeMethod` does not match', () => {
      testContext.transactionMeta.codeChallengeMethod = 'abc';
      testContext.settings.set('codeChallengeMethod', 'def');
      expect(isTransactionMetaValid(testContext.settings, testContext.transactionMeta)).toBe(false);
    });

    it('returns true if clientId and redirectId match, with empty settings', () => {
      testContext.transactionMeta.clientId = 'abc';
      testContext.authParams.clientId = 'abc';
      testContext.transactionMeta.redirectUri = 'abc';
      testContext.authParams.redirectUri = 'abc';
      expect(isTransactionMetaValid(testContext.settings, testContext.transactionMeta)).toBe(true);
    });

    it('returns true if clientId and redirectId from authParams and codeChallenge, codeChallengeMethod from settings match', () => {
      testContext.transactionMeta.clientId = 'abc';
      testContext.authParams.clientId = 'abc';
      testContext.transactionMeta.redirectUri = 'abc';
      testContext.authParams.redirectUri = 'abc';
      testContext.transactionMeta.codeChallenge = 'abc';
      testContext.settings.set('codeChallenge', 'abc');
      testContext.transactionMeta.codeChallengeMethod = 'abc';
      testContext.settings.set('codeChallengeMethod', 'abc');
      expect(isTransactionMetaValid(testContext.settings, testContext.transactionMeta)).toBe(true);
    });
  });

});