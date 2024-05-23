const oktaLoginStub = jest.fn();
const oktaLoginLegacyStub = jest.fn();

import { databagString, databag } from '@okta/loginpage-mock';
import { registerListeners } from './registerListeners';
import * as utils from './utils';
import { render } from './main';

jest.mock('@okta/loginpage', () => ({
  OktaLogin: {
    initLoginPage: oktaLoginStub
  }
}));
jest.mock('@okta/loginpage-legacy', () => ({
  OktaLogin: {
    initLoginPage: oktaLoginLegacyStub,
  }
}));

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

    render(databagString);

    expect(registerListeners).toHaveBeenCalledTimes(1);
    expect(unsupportedContainer?.hasAttribute('style')).toBe(false);
    expect(unsupportedOnedrive?.hasAttribute('style')).toBe(false);
  });

  it('updates style when cookie is disabled', () => {
    jest.spyOn(window.navigator, 'cookieEnabled', 'get').mockReturnValue(false);
    document.body.innerHTML = `
      <div id="okta-sign-in" style="width:330px;"></div>
      <div id="unsupported-cookie" style="width:330px;"></div>
    `;
    const unsupportedContainer = document.getElementById('okta-sign-in');
    const unsupportedCookie = document.getElementById('unsupported-cookie');

    const newDatabag = { ...databag, failIfCookiesDisabled: true };
    render(JSON.stringify(newDatabag));

    expect(registerListeners).toHaveBeenCalledTimes(1);
    expect(unsupportedContainer?.hasAttribute('style')).toBe(false);
    expect(unsupportedCookie?.hasAttribute('style')).toBe(false);
  });


  describe('renders login page', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'isOldWebBrowserControl').mockReturnValueOnce(false);
      jest.spyOn(window.navigator, 'cookieEnabled', 'get').mockReturnValue(true);
    });

    it('uses legacy OktaLogin bundle when has disableNewLoginPage', () => {
      const newDatabag = { ...databag, disableNewLoginPage: true };
      render(JSON.stringify(newDatabag));

      const unsupportedContainer = document.getElementById('okta-sign-in');
      // element is removed
      expect(unsupportedContainer).toBe(null);
      // uses legacy okta login bundle
      expect(oktaLoginLegacyStub.mock.calls[0]).toMatchSnapshot();
      expect(oktaLoginStub).not.toHaveBeenCalled();
    });

    it('uses OktaLogin bundle when has no disableNewLoginPage', () => {
      const newDatabag = { ...databag };
      render(JSON.stringify(newDatabag));

      const unsupportedContainer = document.getElementById('okta-sign-in');
      // element is removed
      expect(unsupportedContainer).toBe(null);
      // uses legacy okta login bundle
      expect(oktaLoginStub.mock.calls[0]).toMatchSnapshot();
      expect(oktaLoginLegacyStub).not.toHaveBeenCalled();
    });


    it('sets up OktaPluginA11y when has SIW_PLUGIN_A11Y FF', () => {
      window.OktaPluginA11y = {
        init: jest.fn()
      };
      const oktaSignInMock = {};
      oktaLoginStub.mockReturnValueOnce({ oktaSignIn: oktaSignInMock });

      const newDatabag = {
        ...databag,
        featureFlags: [...databag.featureFlags, 'SIW_PLUGIN_A11Y']
      };
      render(JSON.stringify(newDatabag));

      expect(window.OktaPluginA11y.init).toHaveBeenCalledWith(oktaSignInMock);
    });
  });
});