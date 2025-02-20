import { databagString, databag, jspPageDatabag } from '@okta/loginpage-mock';
import { registerListeners } from './registerListeners';
import * as utils from './utils';
import { render } from './main';

jest.mock('./registerListeners', () => ({
  registerListeners: jest.fn(),
}));

jest.mock('./buildConfig', () => {
  return {
    __esModule: true,
    ...jest.requireActual('./buildConfig'),
  };
});

jest.mock('./utils', () => {
  return {
    __esModule: true,
    ...jest.requireActual('./utils'),
  };
});

describe('main', () => {
  const runLoginPage = jest.fn();

  beforeEach(() => {
    window.okta = {
      locale: 'en'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates unsupportedContainer when in old web browser', () => {
    jest.spyOn(utils, 'isOldWebBrowserControl').mockReturnValueOnce(true);
    document.body.innerHTML = `
      <div id="okta-sign-in" style="width:330px;"></div>
      <div id="unsupported-onedrive" style="width:330px;"></div>
    `;
    const unsupportedContainer = document.getElementById('okta-sign-in');
    const unsupportedOnedrive = document.getElementById('unsupported-onedrive');

    render(databagString, jspPageDatabag, runLoginPage);

    expect(registerListeners).toHaveBeenCalledTimes(1);
    expect(unsupportedContainer?.hasAttribute('style')).toBe(false);
    expect(unsupportedOnedrive?.hasAttribute('style')).toBe(false);
  });

  it.each([[true,true], [true,false], [false,true],[false, false]])(
    'updates style when ksEnabled is %s and cookie is %s and isMfaAttestation is falsy',
    (ksEnabled, cookiesEnabled) => {
      jspPageDatabag.isCookieCheckingKSEnabled = ksEnabled;
      const cookieEnabledSpy = jest.spyOn(utils, 'areCookiesEnabled').mockReturnValueOnce(cookiesEnabled);
      const navigatorSpy = jest.spyOn(window.navigator, 'cookieEnabled', 'get').mockReturnValueOnce(cookiesEnabled);
      document.body.innerHTML = `
        <div id="okta-sign-in" style="width:330px;"></div>
        <div id="unsupported-cookie" style="width:330px;"></div>
      `;
      const unsupportedContainer = document.getElementById('okta-sign-in');
      const unsupportedCookie = document.getElementById('unsupported-cookie');

      const newDatabag = { ...databag, isMfaAttestation: undefined };
      render(JSON.stringify(newDatabag), jspPageDatabag, runLoginPage);

      expect(registerListeners).toHaveBeenCalledTimes(1);
      expect(cookieEnabledSpy).toHaveBeenCalledTimes(ksEnabled ? 1 : 0);
      expect(navigatorSpy).toHaveBeenCalledTimes(ksEnabled ? 0 : 1);
      expect(unsupportedContainer?.hasAttribute('style')).toBe(cookiesEnabled);
      expect(unsupportedCookie?.hasAttribute('style')).toBe(cookiesEnabled);
  });


  describe('renders login page', () => {
    const runLoginPage = jest.fn().mockImplementation((fn) => fn());
    const oktaSignInMock = {};

    beforeEach(() => {
      window.OktaLogin = {
        initLoginPage: jest.fn().mockReturnValue({
          oktaSignIn: oktaSignInMock,
        }),
      };
      window.OktaPluginA11y = {
        init: jest.fn()
      };

      jest.spyOn(utils, 'isOldWebBrowserControl').mockReturnValueOnce(false);
      jest.spyOn(window.navigator, 'cookieEnabled', 'get').mockReturnValue(true);
    });

    it('calls passed in runLoginPage fn', () => {
      render(databagString, { ...jspPageDatabag }, runLoginPage);

      const unsupportedContainer = document.getElementById('okta-sign-in');
      // element is removed
      expect(unsupportedContainer).toBe(null);
      expect(runLoginPage).toHaveBeenCalled();
    });

    it('sets up OktaPluginA11y when has SIW_PLUGIN_A11Y FF', () => {
      const newDatabag = {
        ...databag,
        featureFlags: [...databag.featureFlags, 'SIW_PLUGIN_A11Y']
      };
      render(JSON.stringify(newDatabag), jspPageDatabag, runLoginPage);

      expect(window.OktaPluginA11y?.init).toHaveBeenCalledWith(oktaSignInMock);
    });
  });
});