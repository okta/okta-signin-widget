/* eslint max-params:[2, 28], max-statements:[2, 41], camelcase:0, max-len:[2, 180] */
import { _, $, internal } from 'okta';
import getAuthClient from 'helpers/getAuthClient';
import Router from 'v1/LoginRouter';
import AuthContainer from 'helpers/dom/AuthContainer';
import Beacon from 'helpers/dom/Beacon';
import IDPDiscoveryForm from 'helpers/dom/IDPDiscoveryForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resError from 'helpers/xhr/ERROR_webfinger';
import resSuccess from 'helpers/xhr/SUCCESS';
import resSuccessRepostIWA from 'helpers/xhr/IDPDiscoverySuccessRepost_IWA';
import resSuccessIWA from 'helpers/xhr/IDPDiscoverySuccess_IWA';
import resSuccessOktaIDP from 'helpers/xhr/IDPDiscoverySuccess_OktaIDP';
import resSuccessSAML from 'helpers/xhr/IDPDiscoverySuccess_SAML';
import resPasswordlessUnauthenticated from 'helpers/xhr/PASSWORDLESS_UNAUTHENTICATED';
import resUnauthenticated from 'helpers/xhr/UNAUTHENTICATED';
import resErrorUnauthorized from 'helpers/xhr/UNAUTHORIZED_ERROR';
import resSecurityImage from 'helpers/xhr/security_image';
import resSecurityImageFail from 'helpers/xhr/security_image_fail';
import IDPDiscovery from 'v1/models/IDPDiscovery';
import Q from 'q';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import DeviceFingerprint from 'v1/util/DeviceFingerprint';
import { UnsupportedBrowserError } from 'util/Errors';
import WidgetUtil from 'util/Util';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;
const BEACON_LOADING_CLS = 'beacon-loading';
const OIDC_STATE = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';

function setup(settings, requests) {
  settings || (settings = {});
  settings['features.idpDiscovery'] = true;
  settings['language'] = 'en';

  // To speed up the test suite, calls to debounce are
  // modified to wait 0 ms.
  const debounce = _.debounce;

  spyOn(_, 'debounce').and.callFake(function(fn) {
    return debounce(fn, 0);
  });

  const setNextResponse = Util.mockAjax(requests);
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: {
      issuer: baseUrl,
      pkce: false,
      transformErrorXHR: WidgetUtil.transformErrorXHR,
      headers: {},
    }
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');

  const setNextWebfingerResponse = function(res, reject) {
    spyOn(authClient, 'webfinger').and.callFake(function() {
      const deferred = Q.defer();

      if (reject) {
        deferred.reject(res);
      } else {
        deferred.resolve(res);
      }
      return deferred.promise;
    });
  };

  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );

  Util.registerRouter(router);
  const authContainer = new AuthContainer($sandbox);
  const form = new IDPDiscoveryForm($sandbox);
  const beacon = new Beacon($sandbox);

  router.on('afterError', afterErrorHandler);
  router.idpDiscovery();
  Util.mockJqueryCss();
  spyOn(router.appState, 'trigger').and.callThrough();
  return Expect.waitForIDPDiscovery({
    router: router,
    authContainer: authContainer,
    form: form,
    beacon: beacon,
    ac: authClient,
    setNextResponse: setNextResponse,
    setNextWebfingerResponse: setNextWebfingerResponse,
    successSpy: successSpy,
    afterErrorHandler: afterErrorHandler,
  });
}

function setupSocial(settings) {
  Util.mockOIDCStateGenerator();
  return setup(
    _.extend(
      {
        clientId: 'someClientId',
        redirectUri: 'https://0.0.0.0:9999',
        useClassicEngine: true,
        authScheme: 'OAUTH2',
        authParams: {
          responseType: 'id_token',
          display: 'popup',
          scopes: ['openid', 'email', 'profile'],
        },
        idps: [
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234',
          },
        ],
      },
      settings
    )
  ).then(function(test) {
    spyOn(window, 'open').and.callFake(function() {
      test.oidcWindow = {
        closed: false,
        close: jasmine.createSpy(),
        location: {
          assign: jasmine.createSpy()
        }
      };
      return test.oidcWindow;
    });
    return test;
  });
}

function setupPasswordlessAuth(primaryAuthResponse) {
  return setup({ 'features.passwordlessAuth': true }).then(function(test) {
    Util.mockRouterNavigate(test.router);
    test.setNextWebfingerResponse(resSuccessOktaIDP);
    test.setNextResponse(primaryAuthResponse ? primaryAuthResponse : resPasswordlessUnauthenticated);
    return test;
  });
}

function setupRegistrationButton(featuresRegistration, registrationObj) {
  const settings = {
    registration: registrationObj,
  };

  if (_.isBoolean(featuresRegistration)) {
    settings['features.registration'] = featuresRegistration;
  }
  return setup(settings);
}

function waitForBeaconChange(test) {
  const cur = test.beacon.getBeaconImage();

  return Expect.wait(function() {
    return test.beacon.getBeaconImage() !== cur;
  }, test);
}

function waitForDefaultBeaconLoaded(test) {
  return Expect.wait(function() {
    return test.beacon.hasClass('undefined-user');
  }, test);
}

function waitForSecurityBeaconLoaded(test) {
  return Expect.wait(function() {
    return test.beacon.hasClass('undefined-user') === false;
  }, test);
}

function waitForWebfingerCall(test) {
  return Expect.waitForSpyCall(test.ac.webfinger, test).then(test => {
    return Expect.waitForSpyCall(test.router.appState.trigger, test);
  });
}

function transformUsername(name) {
  const nameArr = name.split('@');

  return nameArr[0] + '@example.com';
}

function transformUsernameOnUnlock(name, operation) {
  if (operation === 'UNLOCK_ACCOUNT') {
    transformUsername(name);
  }
  return name;
}

function setupWith(options) {
  const examples = {
    customButton: {
      title: 'test text',
      className: 'test-class',
      click: function(e) {
        $(e.target).addClass('new-class');
      },
    },
    genericIdp: {
      type: 'SpaceBook',
      id: '0oaidiw9udOSceD1234',
    },
    socialAuth: {
      type: 'FACEBOOK',
      id: '0oaidiw9udOSceD1234',
    },
  };
  const settings = {};

  if (options.customButtons) {
    settings.customButtons = [examples.customButton];
  }
  if (options.genericIdp || options.socialAuth) {
    settings.idps = [];
  }
  if (options.socialAuth) {
    settings.idps.push(examples.socialAuth);
  }
  if (options.genericIdp) {
    settings.idps.push(examples.genericIdp);
  }
  return setup(settings);
}

function setupWithCustomButtons() {
  const settings = {
    customButtons: [
      {
        title: 'test text',
        className: 'test-class',
        click: function(e) {
          $(e.target).addClass('new-class');
        },
        dataAttr: 'test-data',
      },
    ],
  };

  return setup(settings);
}

function setupWithCustomButtonsWithIdp() {
  const settings = {
    customButtons: [
      {
        title: 'test text',
        className: 'test-class',
        click: function(e) {
          $(e.target).addClass('new-class');
        },
      },
    ],
    idps: [
      {
        type: 'FACEBOOK',
        id: '0oaidiw9udOSceD1234',
      },
    ],
  };

  return setup(settings);
}

function setupWithoutCustomButtonsAndWithIdp() {
  const settings = {
    customButtons: undefined,
    idps: [
      {
        type: 'FACEBOOK',
        id: '0oaidiw9udOSceD1234',
      },
    ],
  };

  return setup(settings);
}

function setupWithoutCustomButtonsWithoutIdp() {
  const settings = {
    customButtons: undefined,
    idps: undefined,
  };

  return setup(settings);
}

const setupWithTransformUsername = _.partial(setup, { username: 'foobar', transformUsername: transformUsername });

const setupWithTransformUsernameOnUnlock = _.partial(setup, { transformUsername: transformUsernameOnUnlock });

Expect.describe('IDPDiscovery', function() {
  describe('IDPDiscoveryModel', function() {
    it('returns validation error when email is blank', function() {
      const model = new IDPDiscovery({ username: '' });

      expect(model.validate().username).toEqual('model.validation.field.blank');
    });
  });

  describe('settings', function() {
    itp('uses default title', function() {
      return setup().then(function(test) {
        expect(test.form.titleText()).toEqual('Sign In');
      });
    });
    itp('uses default for username label', function() {
      return setup().then(function(test) {
        const $usernameLabel = test.form.idpDiscoveryUsernameLabel();

        expect($usernameLabel.text().trim()).toEqual('Username');
      });
    });
    itp('sets autocomplete on username', function() {
      return setup().then(function(test) {
        expect(test.form.getUsernameFieldAutocomplete()).toBe('username');
      });
    });
    itp('overrides rememberMe from settings and uses default text', function() {
      return setup({ 'features.rememberMe': true }).then(function(test) {
        const label = test.form.rememberMeLabelText();

        expect(label).toEqual('Remember me');
      });
    });
    itp('uses default for unlock account', function() {
      return setup({ 'features.selfServiceUnlock': true }).then(function(test) {
        const label = test.form.unlockLabel();

        expect(label.trim()).toBe('Unlock account?');
      });
    });
    itp('focuses on username field in browsers other than IE', function() {
      spyOn(BrowserFeatures, 'isIE').and.returnValue(false);
      return setup().then(function(test) {
        const $username = test.form.usernameField();

        // Focused element would be username DOM element
        expect($username[0]).toBe(document.activeElement);
      });
    });
    itp('does not focus on username field in IE', function() {
      spyOn(BrowserFeatures, 'isIE').and.returnValue(true);
      return setup().then(function(test) {
        const $username = test.form.usernameField();

        // Focused element would be body element
        expect($username[0]).not.toBe(document.activeElement);
      });
    });
  });

  describe('elements', function() {
    itp('has a security beacon if features.securityImage is true', function() {
      return setup({ features: { securityImage: true } }, [resSecurityImage]).then(function(test) {
        expect(test.beacon.isSecurityBeacon()).toBe(true);
      });
    });
    itp('beacon could be minimized if it is a security beacon', function() {
      return setup({ features: { securityImage: true } }, [resSecurityImage]).then(function(test) {
        expect(test.authContainer.canBeMinimized()).toBe(true);
      });
    });
    itp('does not show a beacon if features.securityImage is false', function() {

      // BaseLoginRouter will render twice if language bundles are not loaded:
      // https://github.com/okta/okta-signin-widget/blob/master/src/util/BaseLoginRouter.js#L202
      // We are not testing i18n, so we can mock language bundles as loaded
      Util.mockBundles();

      return setup().then(function(test) {
        expect(test.beacon.beacon().length).toBe(0);
      });
    });
    itp('has a username field', function() {
      return setup().then(function(test) {
        const username = test.form.usernameField();

        expect(username.length).toBe(1);
        expect(username.attr('type')).toEqual('text');
        expect(username.attr('id')).toEqual('idp-discovery-username');
      });
    });
    itp('has a next button', function() {
      return setup().then(function(test) {
        const nextButton = test.form.nextButton();

        expect(nextButton.length).toBe(1);
        expect(nextButton.attr('value')).toBe('Next');
        expect(nextButton.attr('type')).toEqual('submit');
        expect(nextButton.attr('id')).toEqual('idp-discovery-submit');
      });
    });
    itp('has a rememberMe checkbox if features.rememberMe is true', function() {
      return setup().then(function(test) {
        const cb = test.form.rememberMeCheckbox();

        expect(cb.length).toBe(1);
      });
    });
    itp('does not have a rememberMe checkbox if features.rememberMe is false', function() {
      return setup({ 'features.rememberMe': false }).then(function(test) {
        const cb = test.form.rememberMeCheckbox();

        expect(cb.length).toBe(0);
      });
    });
    itp('username field does not have explain by default', function() {
      return setup().then(function(test) {
        const explain = test.form.usernameExplain();

        expect(explain.length).toBe(0);
      });
    });
    itp('username field does have explain when it is customized', function() {
      const options = {
        i18n: {
          en: {
            'primaryauth.username.tooltip': 'Custom Username Explain',
          },
        },
      };

      return setup(options).then(function(test) {
        const explain = test.form.usernameExplain();

        expect(explain.text()).toEqual('Custom Username Explain');
      });
    });
    itp('has "Need help?" link', function() {
      return setup().then(function(test) {
        expect(test.form.helpFooterLabel().trim()).toBe('Need help signing in?');
      });
    });
    itp('has a help link', function() {
      return setup().then(function(test) {
        expect(test.form.helpLinkLabel().trim()).toBe('Help');
      });
    });
    itp('has the correct help link url', function() {
      return setup().then(function(test) {
        spyOn(SharedUtil, 'redirect');
        expect(test.form.helpLinkHref()).toBe('https://foo.com/help/login');
      });
    });
    itp('has a custom help link url when available', function() {
      return setup({ 'helpLinks.help': 'https://bar.com' }).then(function(test) {
        spyOn(SharedUtil, 'redirect');
        expect(test.form.helpLinkHref()).toBe('https://bar.com');
      });
    });
    itp('has helpFooter with right aria-attributes and default values', function() {
      return setup().then(function(test) {
        expect(test.form.helpFooter().attr('aria-expanded')).toBe('false');
        expect(test.form.helpFooter().attr('aria-controls')).toBe('help-links-container');
      });
    });
    itp('sets aria-expanded attribute correctly when clicking help', function() {
      return setup().then(function(test) {
        expect(test.form.helpFooter().attr('aria-expanded')).toBe('false');
        test.form.helpFooter().click();
        expect(test.form.helpFooter().attr('aria-expanded')).toBe('true');
      });
    });
    itp('has a forgot password link', function() {
      return setup().then(function(test) {
        expect(test.form.forgotPasswordLabel().trim()).toBe('Forgot password?');
      });
    });
    itp('forgot password link is not visible on load', function() {
      return setup().then(function(test) {
        expect(test.form.forgotPasswordLinkVisible()).toBe(false);
      });
    });
    itp('shows forgot password link when clicking help', function() {
      return setup().then(function(test) {
        test.form.helpFooter().click();
        expect(test.form.forgotPasswordLinkVisible()).toBe(true);
      });
    });
    itp('does not show forgot password link when disabled and clicked', function() {
      spyOn(SharedUtil, 'redirect');
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          test.form.helpFooter().click();
          expect(test.form.forgotPasswordLinkVisible()).not.toBe(true);
        });
    });
    itp('navigates to forgot password page when click forgot password link', function() {
      return setup().then(function(test) {
        spyOn(test.router, 'navigate');
        test.form.helpFooter().click();
        test.form.forgotPasswordLink().click();
        expect(test.router.navigate).toHaveBeenCalledWith('signin/forgot-password', { trigger: true });
      });
    });
    itp('does not navigate to forgot password page when link disabled and clicked', function() {
      spyOn(SharedUtil, 'redirect');
      return setup()
        .then(function(test) {
          spyOn(test.router, 'navigate');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(test.router.navigate).not.toHaveBeenCalledWith('signin/forgot-password', { trigger: true });
        });
    });
    itp('navigates to custom forgot password page when available', function() {
      return setup({ 'helpLinks.forgotPassword': 'https://foo.com' }).then(function(test) {
        spyOn(SharedUtil, 'redirect');
        test.form.helpFooter().click();
        test.form.forgotPasswordLink().click();
        expect(SharedUtil.redirect).toHaveBeenCalledWith('https://foo.com');
      });
    });
    itp('does not navigate to custom forgot password page when link disabled and clicked', function() {
      spyOn(SharedUtil, 'redirect');
      return setup({ 'helpLinks.forgotPassword': 'https://foo.com' })
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(SharedUtil.redirect).not.toHaveBeenCalledWith('https://foo.com');
        });
    });
    itp('unlock link is hidden on load', function() {
      return setup({ 'features.selfServiceUnlock': true }).then(function(test) {
        expect(test.form.unlockLinkVisible()).toBe(false);
      });
    });
    itp('shows unlock link when clicking help', function() {
      return setup({ 'features.selfServiceUnlock': true }).then(function(test) {
        test.form.helpFooter().click();
        expect(test.form.unlockLinkVisible()).toBe(true);
      });
    });
    itp('navigates to unlock page when click unlock link', function() {
      return setup({ 'features.selfServiceUnlock': true }).then(function(test) {
        spyOn(test.router, 'navigate');
        test.form.helpFooter().click();
        test.form.unlockLink().click();
        expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', { trigger: true });
      });
    });
    itp('does not navigate to unlock page when link disabled and clicked', function() {
      spyOn(SharedUtil, 'redirect');
      return setup()
        .then(function(test) {
          spyOn(test.router, 'navigate');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).not.toHaveBeenCalledWith('signin/unlock', { trigger: true });
        });
    });
    itp('navigates to custom unlock page when available', function() {
      return setup({
        'helpLinks.unlock': 'https://foo.com',
        'features.selfServiceUnlock': true,
      }).then(function(test) {
        spyOn(SharedUtil, 'redirect');
        test.form.helpFooter().click();
        test.form.unlockLink().click();
        expect(SharedUtil.redirect).toHaveBeenCalledWith('https://foo.com');
      });
    });
    itp('does not navigate to custom unlock page when link disabled and clicked', function() {
      spyOn(SharedUtil, 'redirect');
      return setup({
        'helpLinks.unlock': 'https://foo.com',
        'features.selfServiceUnlock': true,
      })
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(SharedUtil.redirect).not.toHaveBeenCalledWith('https://foo.com');
        });
    });
    itp('does not show unlock link if feature is off', function() {
      return setup().then(function(test) {
        expect(test.form.unlockLink().length).toBe(0);
      });
    });
    itp('does not show custom links if they do not exist', function() {
      return setup().then(function(test) {
        expect(test.form.customLinks().length).toBe(0);
      });
    });
    itp('shows custom links if they exist', function() {
      const customLinks = [
        { text: 'github', href: 'https://github.com', rel: 'noopener noreferrer' },
        { text: 'google', href: 'https://google.com', rel: 'noopener noreferrer' },
      ];

      return setup({ 'helpLinks.custom': customLinks }).then(function(test) {
        const links = test.form.customLinks();

        expect(links).toEqual(customLinks);
      });
    });
    itp('shows custom links with target attribute', function() {
      const customLinks = [
        { text: 'github', href: 'https://github.com', rel: 'noopener noreferrer', target: '_blank' },
        { text: 'google', href: 'https://google.com', rel: 'noopener noreferrer' },
        { text: 'okta', href: 'https://okta.com', rel: 'noopener noreferrer', target: '_custom' },
      ];

      return setup({ 'helpLinks.custom': customLinks }).then(function(test) {
        const links = test.form.customLinks();

        expect(links).toEqual(customLinks);
      });
    });
    itp('toggles "focused-input" css class on focus in and focus out', function() {
      return setup().then(function(test) {
        test.form.usernameField().focusin();
        expect(test.form.usernameField()[0].parentElement).toHaveClass('focused-input');
        test.form.usernameField().focusout();
        expect(test.form.usernameField()[0].parentElement).not.toHaveClass('focused-input');
      });
    });
  });

  describe('transform username', function() {
    itp('calls the transformUsername function with the right parameters', function() {
      spyOn(SharedUtil, 'redirect');
      return setupWithTransformUsername()
        .then(function(test) {
          spyOn(test.router.settings, 'transformUsername');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          expect(test.router.settings.transformUsername.calls.count()).toBe(1);
          expect(test.router.settings.transformUsername.calls.argsFor(0)).toEqual([
            'testuser@clouditude.net',
            'IDP_DISCOVERY',
          ]);
        });
    });
    itp('does not call transformUsername while loading security image', function() {
      return setup({ features: { securityImage: true }, transformUsername: transformUsername })
        .then(function(test) {
          spyOn(test.router.settings, 'transformUsername');
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect(test.router.settings.transformUsername.calls.count()).toBe(0);
          expect(Util.numAjaxRequests()).toBe(1);
          expect(Util.getAjaxRequest(0).url).toBe('https://foo.com/login/getimage?username=testuser%40clouditude.net');
        });
    });
    itp('changs the suffix of the username', function() {
      spyOn(SharedUtil, 'redirect');
      return setupWithTransformUsername()
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          expect(test.ac.webfinger).toHaveBeenCalledWith({
            resource: 'okta:acct:testuser@example.com',
            requestContext: undefined,
          });
        });
    });
    itp('does not change the suffix of the username if "IDP_DISCOVERY" operation is not handled', function() {
      spyOn(SharedUtil, 'redirect');
      return setupWithTransformUsernameOnUnlock()
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          expect(test.ac.webfinger).toHaveBeenCalledWith({
            resource: 'okta:acct:testuser@clouditude.net',
            requestContext: undefined,
          });
        });
    });
  });

  describe('Device Fingerprint', function() {
    itp(
      `is not computed if securityImage is off, deviceFingerprinting is
        true and useDeviceFingerprintForSecurityImage is true`,
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint');
        return setup({
          features: {
            securityImage: false,
            deviceFingerprinting: true,
            useDeviceFingerprintForSecurityImage: true,
          },
        })
          .then(function(test) {
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return Expect.wait(() => {
              return test.router.appState.get('username') === 'testuser@clouditude.net';
            });
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(0);
            expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
          });
      }
    );
    itp(
      `contains fingerprint header in get security image request if deviceFingerprinting
        is true (useDeviceFingerprintForSecurityImage defaults to true)`,
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
          const deferred = Q.defer();

          deferred.resolve('thisIsTheDeviceFingerprint');
          return deferred.promise;
        });
        return setup({ features: { securityImage: true, deviceFingerprinting: true } })
          .then(function(test) {
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);

            expect(ajaxArgs.requestHeaders['X-Device-Fingerprint']).toBe('thisIsTheDeviceFingerprint');
          });
      }
    );
    itp(
      `contains fingerprint header in get security image request if both features(
        deviceFingerprinting and useDeviceFingerprintForSecurityImage) are enabled`,
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
          const deferred = Q.defer();

          deferred.resolve('thisIsTheDeviceFingerprint');
          return deferred.promise;
        });
        return setup({
          features: {
            securityImage: true,
            deviceFingerprinting: true,
            useDeviceFingerprintForSecurityImage: true,
          },
        })
          .then(function(test) {
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);

            expect(ajaxArgs.requestHeaders['X-Device-Fingerprint']).toBe('thisIsTheDeviceFingerprint');
          });
      }
    );
    itp(
      `does not contain fingerprint header in get security image request if deviceFingerprinting
          is enabled but useDeviceFingerprintForSecurityImage is disabled`,
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint');
        return setup({
          features: {
            securityImage: true,
            deviceFingerprinting: true,
            useDeviceFingerprintForSecurityImage: false,
          },
        })
          .then(function(test) {
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);

            expect(ajaxArgs.requestHeaders['X-Device-Fingerprint']).toBeUndefined();
          });
      }
    );
    itp(
      `does not contain fingerprint header in get security image request if deviceFingerprinting
        is disabled and useDeviceFingerprintForSecurityImage is enabled`,
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint');
        return setup({ features: { securityImage: true, useDeviceFingerprintForSecurityImage: true } })
          .then(function(test) {
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);

            expect(ajaxArgs.requestHeaders['X-Device-Fingerprint']).toBeUndefined();
          });
      }
    );
    itp('does not contain fingerprint header in get security image request if feature is disabled', function() {
      spyOn(DeviceFingerprint, 'generateDeviceFingerprint');
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
          const ajaxArgs = Util.getAjaxRequest(0);

          expect(ajaxArgs.requestHeaders['X-Device-Fingerprint']).toBeUndefined();
        });
    });
    itp('renders primary auth with a device fingerprint for passwordless flow during idp discovery',
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
          const deferred = Q.defer();
          deferred.resolve('thisIsTheDeviceFingerprint');
          return deferred.promise;
        });
        return setup({ features: {deviceFingerprinting: true,  passwordlessAuth: true}, })
          .then(function(test) {
            Util.resetAjaxRequests();
            Util.mockRouterNavigate(test.router);
            test.setNextWebfingerResponse(resSuccessOktaIDP);
            test.setNextResponse(resPasswordlessUnauthenticated);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return Expect.waitForMfaVerify(test);
          })
          .then(function() {
            expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);
            expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBe('thisIsTheDeviceFingerprint');
          });
      });
    itp('renders primary auth with a device fingerprint when passwordless is disabled during idp discovery',
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
          const deferred = Q.defer();
          deferred.resolve('thisIsTheDeviceFingerprint');
          return deferred.promise;
        });
        return setup({ features: {deviceFingerprinting: true}})
          .then(function(test) {
            Util.mockRouterNavigate(test.router);
            test.setNextWebfingerResponse(resSuccessOktaIDP);
            test.setNextResponse(resUnauthenticated);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return Expect.waitForPrimaryAuth(test);
          })
          .then(function(test) {
            Util.resetAjaxRequests();
            test.form.setPassword('pass');
            test.form.submit();
            test.setNextResponse(resSuccess);
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function() {
            expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);
            expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBe('thisIsTheDeviceFingerprint');
          });
      });
    itp('renders primary auth when device fingerprint generation fails',
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
          const deferred = Q.defer();
          deferred.reject('testFailure');
          return deferred.promise;
        });
        return setup({ features: {deviceFingerprinting: true,  passwordlessAuth: true}, })
          .then(function(test) {
            Util.resetAjaxRequests();
            Util.mockRouterNavigate(test.router);
            test.setNextWebfingerResponse(resSuccessOktaIDP);
            test.setNextResponse(resPasswordlessUnauthenticated);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return Expect.waitForMfaVerify(test);
          })
          .then(function() {
            expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);
            expect(ajaxArgs.url).toBe('https://foo.com/api/v1/authn');
            expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBeUndefined();
          });
      });
  });

  describe('events', function() {
    describe('beacon loading', function() {
      itp('shows beacon-loading animation when authClient webfinger is called', function() {
        spyOn(SharedUtil, 'redirect');
        return setup({ features: { securityImage: true } })
          .then(function(test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function(test) {
            spyOn(test.securityBeacon, 'toggleClass').and.callThrough();
            test.setNextWebfingerResponse(resSuccessSAML);
            test.form.submit();
            return Expect.waitForSpyCall(test.securityBeacon.toggleClass, test);
          })
          .then(test => {
            expect(test.securityBeacon.toggleClass).toHaveBeenCalledWith(BEACON_LOADING_CLS, true);
            test.securityBeacon.toggleClass.calls.reset();
            return waitForWebfingerCall(test);
          })
          .then(function(test) {
            expect(test.securityBeacon.toggleClass).toHaveBeenCalledWith(BEACON_LOADING_CLS, false);
          });
      });
      itp('does not show beacon-loading animation when authClient webfinger fails', function() {
        return setup({ features: { securityImage: true } })
          .then(function(test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextWebfingerResponse(resError, true);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            const spyCalls = test.securityBeacon.toggleClass.calls;

            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
      });
      itp('shows beacon-loading animation when webfinger is submitted (no security image)', function() {
        spyOn(SharedUtil, 'redirect');
        return setup()
          .then(function(test) {
            test.setNextWebfingerResponse(resSuccessSAML);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return waitForWebfingerCall(test);
          })
          .then(function(test) {
            expect(test.beacon.isLoadingBeacon()).toBe(true);
          });
      });
      itp('does not show beacon-loading animation when webfinger fails (no security image)', function() {
        return setup()
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextWebfingerResponse(resError, true);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
      });
    });
    itp('does not make securityImage requests if features.securityImage is false', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          return Expect.wait(() => {
            return test.router.appState.get('username') === 'testuser@clouditude.net';
          });
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(0);
        });
    });
    itp('has default security image on page load and no rememberMe', function() {
      return setup({ features: { securityImage: true } }).then(waitForDefaultBeaconLoaded).then(function(test) {
        expect(test.form.securityBeacon()[0].className).toMatch('undefined-user');
        expect(test.form.securityBeacon()[0].className).not.toMatch('new-device');
        expect(test.form.securityBeacon().css('background-image')).toMatch(
          /\/base\/target\/img\/security\/default.*.png/
        );
      });
    });
    itp('updates security beacon when user enters correct username', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          expect(Util.getAjaxRequest(0).url).toBe('https://foo.com/login/getimage?username=testuser%40clouditude.net');
          expect($.fn.css).toHaveBeenCalledWith('background-image', 'url(/base/test/unit/assets/1x1.gif)');
          expect(test.form.accessibilityText()).toBe('a single pixel');
        });
    });
    itp('waits for username field to lose focus before fetching the security image', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImage);
          test.form.editingUsername('te');
          test.form.editingUsername('testu');
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
        });
    });
    itp('undefined username does not make API call', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImage);
          // security image and description will be set properly when username changes
          test.router.appState.set(
            {
              securityImage: undefined,
              securityImageDescription: undefined,
            },
            {
              silent: true,
            }
          );
          test.form.setUsername(undefined);
          return Expect.wait(() => {
            return !!test.router.appState.get('securityImage');
          }, test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(0);
          expect(test.router.appState.get('securityImage')).toContain('/img/security/default.png');
          expect(test.router.appState.get('securityImageDescription')).toBe('');
          expect(test.form.securityBeacon()[0].className).toContain('undefined-user');
        });
    });
    itp('updates security beacon to show the new user image when user enters unfamiliar username', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect(test.form.securityBeacon()[0].className).toMatch('new-user');
          expect(test.form.securityBeacon()[0].className).not.toMatch('undefined-user');
          expect(test.form.securityBeacon().css('background-image')).toMatch(
            /\/base\/target\/img\/security\/unknown-device.*\.png/
          );
        });
    });
    itp('shows an unknown user message when user enters unfamiliar username', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect(test.form.securityImageTooltipText()).toEqual(
            'This is the first time you are connecting to foo.com from this browser×'
          );
        });
    });
    itp('does not show anti-phishing message if security image is hidden', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.securityBeaconContainer().hide();
          spyOn($.qtip.prototype, 'toggle').and.callThrough();
          test.form.setUsername('testuser@clouditude.net');
          $(window).trigger('resize');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect($.qtip.prototype.toggle.calls.count()).toBe(1);
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: false }));
          $.qtip.prototype.toggle.calls.reset();
          test.form.securityBeaconContainer().show();
          $(window).trigger('resize');
          return Expect.waitForSpyCall($.qtip.prototype.toggle);
        })
        .then(function() {
          expect($.qtip.prototype.toggle.calls.count()).toBe(1);
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: true }));
        });
    });
    itp('show anti-phishing message if security image become visible', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          spyOn($.qtip.prototype, 'toggle').and.callThrough();
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: true }));
          $.qtip.prototype.toggle.calls.reset();
          test.form.securityBeaconContainer().hide();
          $(window).trigger('resize');
          return Expect.waitForSpyCall($.qtip.prototype.toggle, test);
        })
        .then(function(test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: false }));
          $.qtip.prototype.toggle.calls.reset();
          test.form.securityBeaconContainer().show();
          $(window).trigger('resize');
          return Expect.waitForSpyCall($.qtip.prototype.toggle, test);
        })
        .then(function() {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: true }));
        });
    });
    itp('guards against XSS when showing the anti-phishing message', function() {
      return setup({
        baseUrl: 'http://foo<i>xss</i>bar.com?bar=<i>xss</i>',
        features: { securityImage: true },
      })
        .then(function(test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect(test.form.securityImageTooltipText()).toEqual(
            'This is the first time you are connecting to foo<i>xss< from this browser×'
          );
        });
    });
    itp('removes anti-phishing message if help link is clicked', function() {
      return setup({
        baseUrl: 'http://foo<i>xss</i>bar.com?bar=<i>xss</i>',
        features: { securityImage: true, selfServiceUnlock: true },
      })
        .then(function(test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          // Tooltip exists
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(false);
          spyOn(test.router, 'navigate');
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', { trigger: true });
          // Verify tooltip is gone
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(true);
        });
    });
    itp('updates security beacon immediately if rememberMe is available', function() {
      Util.mockGetCookie('ln', 'testuser@clouditude.net');
      const options = {
        features: {
          rememberMe: true,
          securityImage: true,
        },
      };

      return setup(options, [resSecurityImage])
        .then(Expect.waitForAjaxRequest())
        .then(waitForSecurityBeaconLoaded)
        .then(function(test) {
          expect($.fn.css).toHaveBeenCalledWith('background-image', 'url(/base/test/unit/assets/1x1.gif)');
          expect(test.form.accessibilityText()).toBe('a single pixel');
        });
    });
    itp('calls globalErrorFn if cors is not enabled and security image request is made', function() {
      spyOn(BrowserFeatures, 'corsIsNotEnabled').and.returnValue(true);
      return setup({
        features: { securityImage: true },
      })
        .then(function(test) {
          test.setNextResponse({
            responseType: 'json',
            response: '',
            status: 0,
          });
          spyOn(test.router.settings, 'callGlobalError');
          test.form.setUsername('testuser@clouditude.net');
          return Expect.waitForSpyCall(test.router.settings.callGlobalError, test);
        })
        .then(function(test) {
          expect(test.router.settings.callGlobalError.calls.count()).toBe(1);
          const err = test.router.settings.callGlobalError.calls.mostRecent().args[0];

          expect(err instanceof UnsupportedBrowserError).toBe(true);
          expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
          expect(err.message).toEqual('There was an error sending the request - have you enabled CORS?');
        });
    });
    itp('has username in field if rememberMe is available', function() {
      Util.mockGetCookie('ln', 'testuser@clouditude.net');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        expect(test.form.usernameField().val()).toBe('testuser@clouditude.net');
      });
    });
    itp('has rememberMe checked if rememberMe is available', function() {
      Util.mockGetCookie('ln', 'testuser@clouditude.net');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
      });
    });
    itp('unchecks rememberMe if username is changed', function() {
      Util.mockGetCookie('ln', 'testuser@clouditude.net');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
        test.form.setUsername('new-user@clouditude.net');
        expect(test.form.rememberMeCheckboxStatus()).toBe('unchecked');
      });
    });
    itp('does not re-render rememberMe checkbox on changes', function() {
      Util.mockGetCookie('ln', 'testuser@clouditude.net');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        const orig = test.form.rememberMeCheckbox().get(0);

        test.form.setUsername('new-user@clouditude.net');
        expect(test.form.rememberMeCheckbox().get(0)).toBe(orig);
      });
    });
    itp('populates username if username is available', function() {
      const options = {
        username: 'testuser@ABC.com',
      };

      return setup(options).then(function(test) {
        expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
      });
    });
    itp('populates username if username is available and when features.rememberMe is false', function() {
      const options = {
        'features.rememberMe': false,
        username: 'testuser@ABC.com',
      };

      return setup(options).then(function(test) {
        const cb = test.form.rememberMeCheckbox();

        expect(cb.length).toBe(0);
        expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
      });
    });
    itp('ignores lastUsername and hides rememberMe if features.rememberMe is false and cookie is set', function() {
      Util.mockGetCookie('ln', 'testuser@ABC.com');
      const options = {
        'features.rememberMe': false,
      };

      return setup(options).then(function(test) {
        const cb = test.form.rememberMeCheckbox();

        expect(cb.length).toBe(0);
        expect(test.form.usernameField().val().length).toBe(0);
      });
    });
    itp('unchecks rememberMe if username is populated and lastUsername is different from username', function() {
      Util.mockGetCookie('ln', 'testuser@clouditude.net');
      const options = {
        'features.rememberMe': true,
        username: 'testuser@ABC.com',
      };

      return setup(options).then(function(test) {
        expect(test.form.rememberMeCheckboxStatus()).toBe('unchecked');
        expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
      });
    });
    itp('checks rememberMe if username is populated and lastUsername is same as username', function() {
      Util.mockGetCookie('ln', 'testuser@ABC.com');
      const options = {
        'features.rememberMe': true,
        username: 'testuser@ABC.com',
      };

      return setup(options).then(function(test) {
        expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
        expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
      });
    });
    itp('shows an error if username is empty and submitted', function() {
      return setup().then(function(test) {
        test.setNextWebfingerResponse({});
        test.form.submit();
        expect(test.form.usernameErrorField().length).toBe(1);
        const button = test.form.submitButton();
        const buttonClass = button.attr('class');

        expect(buttonClass).not.toContain('link-button-disabled');
        expect(test.form.isDisabled()).toBe(false);
        expect(test.ac.webfinger).not.toHaveBeenCalled();
      });
    });
    itp('calls authClient webfinger with correct values when submitted', function() {
      spyOn(SharedUtil, 'redirect');
      return setup({ 'idpDiscovery.requestContext': 'http://rain.okta1.com:1802/app/UserHome' })
        .then(function(test) {
          test.form.setUsername(' testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          expect(test.form.isDisabled()).toBe(true);
          expect(test.ac.webfinger).toHaveBeenCalledWith({
            resource: 'okta:acct:testuser@clouditude.net',
            requestContext: 'http://rain.okta1.com:1802/app/UserHome',
          });
        });
    });
    itp('does not call processCreds function before saving a model', function() {
      spyOn(SharedUtil, 'redirect');
      const processCredsSpy = jasmine.createSpy('processCreds');

      return setup({
        processCreds: processCredsSpy,
      })
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          expect(processCredsSpy.calls.count()).toBe(0);
          expect(test.ac.webfinger).toHaveBeenCalled();
        });
    });
    itp('sets rememberMe cookie if rememberMe is enabled and checked on submit', function() {
      spyOn(SharedUtil, 'redirect');
      const cookieSpy = Util.mockSetCookie();

      return setup({ 'features.rememberMe': true })
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net ');
          test.form.setRememberMe(true);
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function() {
          expect(cookieSpy).toHaveBeenCalledWith('ln', 'testuser@clouditude.net', {
            expires: 365,
            path: '/',
          });
        });
    });
    itp('removes rememberMe cookie if called with existing username and unchecked', function() {
      spyOn(SharedUtil, 'redirect');
      Util.mockGetCookie('ln', 'testuser@clouditude.net');
      const removeCookieSpy = Util.mockRemoveCookie();

      return setup({ 'features.rememberMe': true })
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.form.setRememberMe(false);
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function() {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
    });
    itp('removes rememberMe cookie if webfinger failed (400)', function() {
      const removeCookieSpy = Util.mockRemoveCookie();

      return setup()
        .then(function(test) {
          test.form.setUsername('testuser@clouditude.net');
          test.form.setRememberMe(true);
          test.setNextWebfingerResponse(resError, true);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function() {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
    });
    itp('shows an error if authClient returns with an error', function() {
      return setup()
        .then(function(test) {
          test.setNextWebfingerResponse(resError, true);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
        });
    });
  });

  describe('IDP Discovery', function() {
    itp('renders primary auth when idp is okta', function() {
      return setup()
        .then(function(test) {
          Util.mockRouterNavigate(test.router);
          test.setNextWebfingerResponse(resSuccessOktaIDP);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.router.appState.get('disableUsername')).toBe(true);
          expect(test.router.navigate).toHaveBeenCalledWith('signin', { trigger: true });
        });
    });
    itp('renders primary auth when idp is okta with shortname', function() {
      return setup()
        .then(function(test) {
          Util.mockRouterNavigate(test.router);
          test.setNextWebfingerResponse(resSuccessOktaIDP);
          test.form.setUsername('testuser');
          test.form.submit();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.router.appState.get('disableUsername')).toBe(true);
          expect(test.router.navigate).toHaveBeenCalledWith('signin', { trigger: true });
        });
    });
    itp('primary auth route should contain username when idp is okta and features.prefillUsernameFromIdpDiscovery is on', function() {
      return setup({ 'features.prefillUsernameFromIdpDiscovery': true })
        .then(function(test) {
          Util.mockRouterNavigate(test.router);
          test.setNextWebfingerResponse(resSuccessOktaIDP);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.router.appState.get('disableUsername')).toBe(true);
          expect(test.router.navigate).toHaveBeenCalledWith('signin/okta/testuser%40clouditude.net', { trigger: true });
        });
    });
    itp('disables username field if sign-in returns an error and username was previously disabled', function() {
      return setup()
        .then(function(test) {
          Util.mockRouterNavigate(test.router);
          test.setNextWebfingerResponse(resSuccessOktaIDP);
          test.form.setUsername('testuser');
          test.form.submit();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.router.appState.get('disableUsername')).toBe(true);
          expect(test.form.isUsernameDisabled()).toBe(true);
          expect(test.router.navigate).toHaveBeenCalledWith('signin', { trigger: true });
          // ensure 'Back to sign in' footer is there
          expect(test.form.backLinkFooter().length).toBe(1);

          test.setNextResponse(resErrorUnauthorized);
          test.form.setPassword('dummyPassword');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.router.appState.get('disableUsername')).toBe(true);
          expect(test.form.isUsernameDisabled()).toBe(true);
        });           
    });     
    itp('redirects to idp for SAML idps', function() {
      spyOn(SharedUtil, 'redirect');
      return setup()
        .then(function(test) {
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.setUsername(' testuser@clouditude.net ');
          test.form.submit();
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(SharedUtil.redirect).toHaveBeenCalledWith('http://demo.okta1.com:1802/sso/saml2/0oa2hhcwIc78OGP1W0g4');
        });
    });
    itp('redirects using form Get to idp for SAML idps when features.redirectByFormSubmit is on', function() {
      spyOn(WidgetUtil, 'redirectWithFormGet');
      return setup({ 'features.redirectByFormSubmit': true })
        .then(function(test) {
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.setUsername(' testuser@clouditude.net ');
          test.form.submit();
          return Expect.waitForSpyCall(WidgetUtil.redirectWithFormGet);
        })
        .then(function() {
          expect(WidgetUtil.redirectWithFormGet).toHaveBeenCalledWith(
            'http://demo.okta1.com:1802/sso/saml2/0oa2hhcwIc78OGP1W0g4'
          );
        });
    });
    itp('redirects to idp for idps other than okta/saml', function() {
      spyOn(SharedUtil, 'redirect');
      return setup()
        .then(function(test) {
          test.setNextWebfingerResponse(resSuccessIWA);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(SharedUtil.redirect).toHaveBeenCalledWith('http://demo.okta1.com:1802/login/sso_iwa');
        });
    });
    itp(
      'redirects using form GET to idp for idps other than okta/saml when features.redirectByFormSubmit is on',
      function() {
        spyOn(WidgetUtil, 'redirectWithFormGet');
        return setup({ 'features.redirectByFormSubmit': true })
          .then(function(test) {
            test.setNextWebfingerResponse(resSuccessIWA);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return Expect.waitForSpyCall(WidgetUtil.redirectWithFormGet);
          })
          .then(function() {
            expect(WidgetUtil.redirectWithFormGet).toHaveBeenCalledWith('http://demo.okta1.com:1802/login/sso_iwa');
          });
      }
    );
    itp('redirects using form GET to idp when OKTA_INVALID_SESSION_REPOST=true', function() {
      spyOn(WidgetUtil, 'redirectWithFormGet');
      return setup()
        .then(function(test) {
          test.setNextWebfingerResponse(resSuccessRepostIWA);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForSpyCall(WidgetUtil.redirectWithFormGet);
        })
        .then(function() {
          expect(WidgetUtil.redirectWithFormGet).toHaveBeenCalledWith(
            'http://demo.okta1.com:1802/login/sso_iwa?fromURI=%2Fapp%2Finstance%2Fkey%3FSAMLRequest%3Dencoded%26RelayState%3DrelayState%26OKTA_INVALID_SESSION_REPOST%3Dtrue'
          );
        });
    });
  });

  describe('Passwordless Auth', function() {
    itp('automatically calls authClient.signIn when idp is Okta', function() {
      return setupPasswordlessAuth()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser@test.com');
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser@test.com',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
    itp('shows MfaVerify view after authClient.signIn returns with UNAUTHENTICATED', function() {
      return setupPasswordlessAuth()
        .then(function(test) {
          test.form.setUsername('testuser@test.com');
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function(test) {
          expect(test.form.el('factor-question').length).toEqual(1);
        });
    });
    itp('shows an error when response is unauthorized', function() {
      return setupPasswordlessAuth(resErrorUnauthorized)
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser@test.com');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.beacon.isLoadingBeacon()).toBe(false);
          expect(test.beacon.beacon().length).toBe(0);
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Unable to sign in');
        });
    });
  });

  describe('Registration Flow', function() {
    itp('does not show the registration button if features.registration is not set', function() {
      return setup().then(function(test) {
        expect(test.form.registrationContainer().length).toBe(0);
      });
    });
    itp('does not show the registration button if features.registration is undefined', function() {
      const registration = {};

      return setupRegistrationButton(undefined, registration).then(function(test) {
        expect(test.form.registrationContainer().length).toBe(0);
      });
    });
    itp('does not show the registration button if features.registration is false', function() {
      const registration = {};

      return setupRegistrationButton(false, registration).then(function(test) {
        expect(test.form.registrationContainer().length).toBe(0);
      });
    });
    itp('show the registration button if registration.enable is true', function() {
      const registration = {};

      return setupRegistrationButton(true, registration).then(function(test) {
        expect(test.form.registrationContainer().length).toBe(1);
        expect(test.form.registrationLabel().length).toBe(1);
        expect(test.form.registrationLabel().text()).toBe('Don\'t have an account?');
        expect(test.form.registrationLink().length).toBe(1);
        expect(test.form.registrationLink().text()).toBe('Sign up');
        expect(typeof registration.click).toEqual('undefined');
      });
    });
    itp('calls settings.registration.click if its a function and when the link is clicked', function() {
      const registration = {
        click: jasmine.createSpy('registrationSpy'),
      };

      return setupRegistrationButton(true, registration).then(function(test) {
        expect(test.form.registrationContainer().length).toBe(1);
        expect(test.form.registrationLabel().length).toBe(1);
        expect(test.form.registrationLabel().text()).toBe('Don\'t have an account?');
        expect(test.form.registrationLink().length).toBe(1);
        expect(test.form.registrationLink().text()).toBe('Sign up');
        test.form.registrationLink().click();
        expect(registration.click).toHaveBeenCalled();
      });
    });
  });

  describe('Additional Auth Button', function() {
    itp('does not display custom buttons when it is undefined', function() {
      return setupWithoutCustomButtonsAndWithIdp().then(function(test) {
        expect(test.form.authDivider().length).toBe(1);
        expect(test.form.additionalAuthButton().length).toBe(0);
        expect(test.form.facebookButton().length).toBe(1);
      });
    });
    itp('does not display social auth/generic idp when idps is undefined', function() {
      return setupWithCustomButtons().then(function(test) {
        expect(test.form.authDivider().length).toBe(1);
        expect(test.form.additionalAuthButton().length).toBe(1);
        expect(test.form.facebookButton().length).toBe(0);
      });
    });
    itp('does not display any additional buttons when idps and customButtons are undefined', function() {
      return setupWithoutCustomButtonsWithoutIdp().then(function(test) {
        expect(test.form.authDivider().length).toBe(0);
        expect(test.form.additionalAuthButton().length).toBe(0);
        expect(test.form.facebookButton().length).toBe(0);
      });
    });
    itp('does not show the divider and buttons if settings.customButtons is not set', function() {
      return setup().then(function(test) {
        expect(test.form.authDivider().length).toBe(0);
        expect(test.form.additionalAuthButton().length).toBe(0);
      });
    });
    itp('show the divider and buttons if settings.customButtons is not empty', function() {
      return setupWithCustomButtons().then(function(test) {
        expect(test.form.authDivider().length).toBe(1);
        expect(test.form.additionalAuthButton().length).toBe(1);
      });
    });
    itp('sets text with property passed', function() {
      return setupWithCustomButtons().then(function(test) {
        expect(test.form.additionalAuthButton().text()).toEqual('test text');
      });
    });
    itp('sets class with property passed', function() {
      return setupWithCustomButtons().then(function(test) {
        expect(test.form.additionalAuthButton().hasClass('test-class')).toBe(true);
      });
    });
    itp('clickHandler is called when button is clicked', function() {
      return setupWithCustomButtons().then(function(test) {
        expect(test.form.additionalAuthButton().hasClass('new-class')).toBe(false);
        test.form.additionalAuthButton().click();
        expect(test.form.additionalAuthButton().hasClass('new-class')).toBe(true);
      });
    });
    itp('displays custom button translation', function() {
      const settings = {
        i18n: {
          en: {
            'customButton.title': 'Custom Translated Title',
          },
        },
        customButtons: [
          {
            i18nKey: 'customButton.title',
          },
        ],
      };

      return setup(settings).then(function(test) {
        expect(test.form.additionalAuthButton().text()).toEqual('Custom Translated Title');
      });
    });
    itp('ignores custom button translation if title is passed', function() {
      const settings = {
        i18n: {
          en: {
            'customButton.title': 'Custom Translated Title',
          },
        },
        customButtons: [
          {
            i18nKey: 'customButton.title',
            title: 'Title Overrides i18n'
          },
        ],
      };

      return setup(settings).then(function(test) {
        expect(test.form.additionalAuthButton().text()).toEqual('Title Overrides i18n');
      });
    });
    itp('displays generic idp buttons', function() {
      return setupWith({ genericIdp: true }).then(function(test) {
        expect(test.form.authDivider().length).toEqual(1);
        expect(test.form.additionalAuthButton().length).toEqual(0);
        expect(test.form.facebookButton().length).toEqual(0);
        expect(test.form.socialAuthButton('general-idp').length).toEqual(1);
        expect(test.form.forgotPasswordLinkVisible()).toBe(false);
      });
    });
    itp('displays generic idp and custom buttons', function() {
      return setupWith({ genericIdp: true, customButtons: true }).then(function(test) {
        expect(test.form.authDivider().length).toEqual(1);
        expect(test.form.additionalAuthButton().length).toEqual(1);
        expect(test.form.facebookButton().length).toEqual(0);
        expect(test.form.socialAuthButton('general-idp').length).toEqual(1);
        expect(test.form.forgotPasswordLinkVisible()).toBe(false);
      });
    });
    itp('displays generic idp and social auth buttons', function() {
      return setupWith({ genericIdp: true, socialAuth: true }).then(function(test) {
        expect(test.form.authDivider().length).toEqual(1);
        expect(test.form.additionalAuthButton().length).toEqual(0);
        expect(test.form.facebookButton().length).toEqual(1);
        expect(test.form.socialAuthButton('general-idp').length).toEqual(1);
        expect(test.form.forgotPasswordLinkVisible()).toBe(false);
      });
    });
    itp('displays generic idp, custom buttons, and social auth buttons', function() {
      return setupWith({ genericIdp: true, customButtons: true, socialAuth: true }).then(function(test) {
        expect(test.form.authDivider().length).toEqual(1);
        expect(test.form.additionalAuthButton().length).toEqual(1);
        expect(test.form.facebookButton().length).toEqual(1);
        expect(test.form.socialAuthButton('general-idp').length).toEqual(1);
        expect(test.form.forgotPasswordLinkVisible()).toBe(false);
      });
    });
    itp('displays social auth and custom buttons', function() {
      return setupWithCustomButtonsWithIdp().then(function(test) {
        expect(test.form.authDivider().length).toEqual(1);
        expect(test.form.additionalAuthButton().length).toEqual(1);
        expect(test.form.facebookButton().length).toEqual(1);
        expect(test.form.socialAuthButton('general-idp').length).toEqual(0);
        expect(test.form.forgotPasswordLinkVisible()).toBe(false);
      });
    });
    itp('triggers the afterError event if there is no valid id token returned', function() {
      spyOn(window, 'addEventListener');
      return setupSocial()
        .then(function(test) {
          test.form.facebookButton().click();
          // Wait for "popup" to be created (is async with okta-auth-js 2.6)
          return Expect.waitForWindowListener('message', test);
        })
        .then(function(test) {
          const args = window.addEventListener.calls.mostRecent().args;

          expect(args[0]).toBe('message');
          const callback = args[1];

          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              state: OIDC_STATE,
              error: 'OAuth Error',
              error_description: 'Message from server',
            },
          });
          return Expect.waitForSpyCall(test.afterErrorHandler, test);
        })
        .then(function(test) {
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'idp-discovery',
            },
            {
              name: 'OAUTH_ERROR',
              message: 'Message from server',
            },
          ]);
        });
    });
  });
});
