import { emailVerifyCallback } from 'v2/client/emailVerifyCallback';
import TerminalOTPOnly from '../../../../../playground/mocks/data/idp/idx/terminal-return-otp-only-no-location.json';
import { Model } from 'okta';

describe('email verify callback', () => {
  let testContext;
  beforeEach(() => {
    const authClient = {
      idx: {
        proceed: () => {},
        getSavedTransactionMeta: () => {},
        clearTransactionMeta: () => {}
      }
    };
    const settings = new Model();
    settings.getAuthClient = () => authClient;
    const otp = 'fake-otp';
    settings.set('otp', otp); // this flow is only triggered when otp is set
    testContext = {
      otp,
      authClient,
      settings
    };
  });
  describe('if there is an interactionHandle in storage', () => {
    beforeEach(() => {
      const { authClient } = testContext;
      const interactionHandle = 'fake-interactionHandle';
      jest.spyOn(authClient.idx, 'getSavedTransactionMeta').mockResolvedValue({ interactionHandle });
    });

    it('it passes the otp from settings to idx.proceed()', async () => {
      const { settings, authClient, otp } = testContext;
      jest.spyOn(authClient.idx, 'proceed');
      await emailVerifyCallback(settings);
      expect(authClient.idx.proceed).toHaveBeenCalledWith({
        exchangeCodeForTokens: false,
        shouldProceedWithEmailAuthenticator: false,
        otp
      });
    });
    it('returns response from idx.proceed', async () => {
      const { settings, authClient, otp } = testContext;
      const idxResponse = { fake: true };
      jest.spyOn(authClient.idx, 'proceed').mockResolvedValue(idxResponse);
      const res = await emailVerifyCallback(settings);
      expect(authClient.idx.proceed).toHaveBeenCalledWith({
        exchangeCodeForTokens: false,
        shouldProceedWithEmailAuthenticator: false,
        otp
      });
      expect(res).toBe(idxResponse);
    });
  });

  it('if no interactionHandle in storage, returns an idx response with a terminal message', async () => {
    const { settings, authClient } = testContext;
    const otp = 'fake-otp';
    settings.set('otp', otp);
    jest.spyOn(authClient.idx, 'getSavedTransactionMeta').mockResolvedValue({});
    jest.spyOn(authClient.idx, 'proceed');
    const res = await emailVerifyCallback(settings);
    expect(authClient.idx.proceed).not.toHaveBeenCalled();
    expect(res.rawIdxState.messages).toEqual(TerminalOTPOnly.messages);
  });
  it('if storage is null, returns an idx response with a terminal message', async () => {
    const { settings, authClient } = testContext;
    const otp = 'fake-stateToken';
    settings.set('otp', otp);
    jest.spyOn(authClient.idx, 'getSavedTransactionMeta').mockResolvedValue(null);
    jest.spyOn(authClient.idx, 'proceed');
    const res = await emailVerifyCallback(settings);
    expect(authClient.idx.proceed).not.toHaveBeenCalled();
    expect(res.rawIdxState.messages).toEqual(TerminalOTPOnly.messages);
  });
});