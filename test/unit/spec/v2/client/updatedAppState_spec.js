import { Model } from 'okta';
import { updateAppState } from '../../../../../src/v2/client';
import CookieUtil from '../../../../../src/util/CookieUtil';
import AppState from '../../../../../src/v2/models/AppState';

describe('v2/client/updateAppState', () => {
  let testContext;
  const originName = 'foo.bar';
  const originNameEmail = originName + '@domain.com';
  const newName = 'not.bar';

  beforeEach(() => {
    const settings = new Model();
    settings.set('features.rememberMe', true);
    settings.set('features.rememberMyUsernameOnOIE', true);

    const appState = new AppState({}, {settings});

    testContext = {
      appState,
    };
  });

  describe('updateAppState, verify cookie-updating cases of function updateIdentifierCookie', () => {
    it('updateAppState, updating cookie by identifier', async () => {
      const { appState } = testContext;
      const idxResponse = { fake: true, context: { user: {value: {identifier: originName} } }, rawIdxState: {success: true} };

      updateAppState(appState, idxResponse);
      expect(CookieUtil.getCookieUsername()).toBe(originName);
    });

    it('updateAppState, updating cookie for another identifier', async () => {
      const { appState } = testContext;
      CookieUtil.setUsernameCookie(originName);

      const idxResponse = { fake: true, context: { user: {value: {identifier: newName} } }, rawIdxState: {success: true} };

      updateAppState(appState, idxResponse);
      expect(CookieUtil.getCookieUsername()).toBe(newName);
    });

    it('updateAppState, not updating cookie for same username with email domain', async () => {
      const { appState } = testContext;
      CookieUtil.setUsernameCookie(originName);

      const idxResponse = { fake: true, context: { user: {value: {identifier: originNameEmail} } }, rawIdxState: {success: true} };

      updateAppState(appState, idxResponse);
      expect(CookieUtil.getCookieUsername()).toBe(originName);
    });
  });
});