/* eslint max-params:[2, 32], max-statements:[2, 46], camelcase:0, max-len:[2, 180] */
import { _, $, internal } from 'okta';
import { OAuthError } from '@okta/okta-auth-js';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import PrimaryAuthController from 'v1/controllers/PrimaryAuthController';
import AuthContainer from 'helpers/dom/AuthContainer';
import Beacon from 'helpers/dom/Beacon';
import PrimaryAuthForm from 'helpers/dom/PrimaryAuthForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resLockedOut from 'helpers/xhr/ACCOUNT_LOCKED_OUT';
import resCancel from 'helpers/xhr/CANCEL';
import resInvalidText from 'helpers/xhr/ERROR_INVALID_TEXT_RESPONSE';
import resNonJson from 'helpers/xhr/ERROR_NON_JSON_RESPONSE';
import resErrorValid from 'helpers/xhr/ERROR_VALID_RESPONSE';
import resThrottle from 'helpers/xhr/ERROR_throttle';
import resFactorRequired from 'helpers/xhr/FACTOR_REQUIRED';
import resPasswordlessUnauthenticated from 'helpers/xhr/PASSWORDLESS_UNAUTHENTICATED';
import resPwdExpired from 'helpers/xhr/PASSWORD_EXPIRED';
import resSuccess from 'helpers/xhr/SUCCESS';
import resUnauthenticated from 'helpers/xhr/UNAUTHENTICATED';
import resUnauthorized from 'helpers/xhr/UNAUTHORIZED_ERROR';
import resSecurityImage from 'helpers/xhr/security_image';
import resSecurityImageFail from 'helpers/xhr/security_image_fail';
import resSecurityImageNewUser from 'helpers/xhr/security_image_new_user';
import PrimaryAuth from 'v1/models/PrimaryAuth';
import Q from 'q';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import DeviceFingerprint from 'v1/util/DeviceFingerprint';
import Errors from 'util/Errors';
import TypingUtil from 'v1/util/TypingUtil';
import LoginUtil from 'util/Util';
import CookieUtil from 'util/CookieUtil';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;
const BEACON_LOADING_CLS = 'beacon-loading';
const OIDC_STATE = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';
const OIDC_NONCE = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';
const AUTH_TIME = (1451606400) * 1000; // The time the "VALID_ID_TOKEN" was issued
const VALID_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6' +
  'Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0iLCJ0eXAiOiJKV1Qi' +
  'fQ.eyJ2ZXIiOjEsImlzcyI6Imh0dHBzOi8vZm9vLmNvbSIsInN1Y' +
  'iI6IjAwdWlsdE5RSzJXc3pzMlJWMGczIiwibG9naW4iOiJzYW1sa' +
  'mFja3NvbkBnYWNrLm1lIiwiYXVkIjoic29tZUNsaWVudElkIiwia' +
  'WF0IjoxNDUxNjA2NDAwLCJleHAiOjE2MDk0NTkyMDAsImFtciI6W' +
  'yJwd2QiXSwiaWRwIjoiMG9haWRpdzl1ZE9TY2VEcXcwZzMiLCJub' +
  '25jZSI6ImdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ' +
  '2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2ciLCJhdXRoX' +
  '3RpbWUiOjE0NTE2MDY0MDAsImlkcF90eXBlIjoiRkFDRUJPT0siL' +
  'CJuYW1lIjoiU2FtbCBKYWNrc29uIiwicHJvZmlsZSI6Imh0dHBzO' +
  'i8vd3d3LmZhY2Vib29rLmNvbS9hcHBfc2NvcGVkX3VzZXJfaWQvM' +
  'TIyODE5NjU4MDc2MzU3LyIsImdpdmVuX25hbWUiOiJTYW1sIiwiZ' +
  'mFtaWx5X25hbWUiOiJKYWNrc29uIiwidXBkYXRlZF9hdCI6MTQ1M' +
  'TYwNjQwMCwiZW1haWwiOiJzYW1samFja3NvbkBnYWNrLm1lIiwiZ' +
  'W1haWxfdmVyaWZpZWQiOnRydWV9.fJ8ZzLojgQKdZLvssGrSshTH' +
  'DhhUF6G2bPm9zRLPeZBh1zUiVccvV-0UzJERuWoL07hFt7QGGoxR' +
  'lXvxoMVtFk-fcdCkn1DnTtIzsFPOjysBl2vjwVBJXg9h1Nymd91l' +
  'dI5eorOMrbamRfxOFkEUC9P9mgO6DcVfR5oxY0pjfMA';

const VALID_ACCESS_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXIiOj' +
  'EsImp0aSI6IkFULnJ2Ym5TNGlXdTJhRE5jYTNid1RmMEg5Z' +
  'VdjV2xsS1FlaU5ZX1ZlSW1NWkEiLCJpc3MiOiJodHRwczov' +
  'L2xib3lldHRlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p' +
  '5YzhtdlZUSk8wZzciLCJhdWQiOiJodHRwczovL2xib3lldH' +
  'RlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p5YzhtdlZUS' +
  'k8wZzciLCJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIs' +
  'ImlhdCI6MTQ2ODQ2NzY0NywiZXhwIjoxNDY4NDcxMjQ3LCJ' +
  'jaWQiOiJQZjBhaWZyaFladTF2MFAxYkZGeiIsInVpZCI6Ij' +
  'AwdTFwY2xhNXFZSVJFRExXQ1FWIiwic2NwIjpbIm9wZW5pZ' +
  'CIsImVtYWlsIl19.ziKfS8IjSdOdTHCZllTDnLFdE96U9bS' +
  'IsJzI0MQ0zlnM2QiiA7nvS54k6Xy78ebnkJvmeMCctjXVKk' +
  'JOEhR6vs11qVmIgbwZ4--MqUIRU3WoFEsr0muLl039QrUa1' +
  'EQ9-Ua9rPOMaO0pFC6h2lfB_HfzGifXATKsN-wLdxk6cgA';

const typingPattern =
  '0,2.15,0,0,6,3210950388,1,95,-1,0,-1,-1,\
          0,-1,-1,9,86,44,0,-1,-1|4403,86|143,143|240,62|15,127|176,39|712,87';

async function setup(settings, requests, refreshState) {
  settings || (settings = {});

  // To speed up the test suite, calls to debounce are
  // modified to wait 0 ms.
  const debounce = _.debounce;

  spyOn(_, 'debounce').and.callFake(function(fn) {
    return debounce(fn, 0);
  });

  // Footer uses slideToggle to animate the change. mock this method so everything happens synchronously
  const slideToggle = $.prototype.slideToggle;
  spyOn($.prototype, 'slideToggle').and.callFake(function(speed, easing, callback) {
    slideToggle.call(this, 0, easing, callback);
    Util.callAllTimeouts();
  });

  const setNextResponse = Util.mockAjax(requests);
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: Object.assign({
      issuer: baseUrl,
      transformErrorXHR: LoginUtil.transformErrorXHR,
    }, settings.authParams)
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
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
  Util.mockRouterNavigate(router);
  const authContainer = new AuthContainer($sandbox);
  const form = new PrimaryAuthForm($sandbox);
  const beacon = new Beacon($sandbox);

  router.on('afterError', afterErrorHandler);
  let test;
  if (refreshState) {
    const stateToken = 'dummy-token';

    setNextResponse(resUnauthenticated);
    router.refreshAuthState(stateToken);
    Util.mockJqueryCss();
    test = await Expect.waitForPrimaryAuth({
      router: router,
      authContainer: authContainer,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler,
    });
  } else {
    router.primaryAuth();
    Util.mockJqueryCss();
    test = await Expect.waitForPrimaryAuth({
      router: router,
      authContainer: authContainer,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler,
    });
  }

  Util.callAllTimeouts(); // to set focus from debounce
  return test;
}

function setupUnauthenticated(settings, requests) {
  return setup(settings, requests, true);
}

function setupPasswordlessAuth(requests, refreshState) {
  return setup({ 'features.passwordlessAuth': true }, requests, refreshState).then(function(test) {
    test.setNextResponse(resPasswordlessUnauthenticated);
    return Q(test);
  });
}

function setupSocial(settings) {
  Util.mockOIDCStateGenerator();
  Util.loadWellKnownAndKeysCache();
  return setup(
    _.extend(
      {
        clientId: 'someClientId',
        redirectUri: 'https://0.0.0.0:9999',
        authScheme: 'OAUTH2',
        authParams: {
          responseType: 'id_token',
          display: 'popup',
          pkce: false,
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

function setupSocialNoneOIDCMode(settings) {
  Util.mockOIDCStateGenerator();
  return setup(
    _.extend(
      {
        redirectUri: 'https://0.0.0.0:9999',
        idps: [
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234',
          },
        ],
      },
      settings
    )
  );
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

function setupPIV(pivAuthentication, useDefaultText) {
  const buttonText = useDefaultText ? '' : 'piv test text';
  const settings = {
    piv: {
      text: buttonText,
      className: 'piv-test-class',
      certAuthUrl: pivAuthentication ? 'https://rain.mtls.okta1.com:80/auth/cert/primaryAuth' : '',
    },
  };

  return setup(settings);
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

function transformUsername(name) {
  const suffix = '@example.com';

  return name.indexOf(suffix) !== -1 ? name : name + suffix;
}

function transformUsernameOnUnlock(name, operation) {
  if (operation === 'UNLOCK_ACCOUNT') {
    transformUsername(name);
  }
  return name;
}

function expectErrorEvent(test, code, err) {
  expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
  expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
    {
      controller: 'primary-auth',
    },
    jasmine.objectContaining({
      name: 'AuthApiError',
      message: err,
      statusCode: code,
    }),
  ]);
}

const setupWithTransformUsername = _.partial(setup, { username: 'foobar', transformUsername: transformUsername });

const setupWithTransformUsernameOnUnlock = _.partial(setup, { transformUsername: transformUsernameOnUnlock });

Expect.describe('PrimaryAuth', function() {
  beforeEach(() => {
    // ensure a clean environment for each test
    CookieUtil.removeUsernameCookie();
  });
  Expect.describe('PrimaryAuthModel', function() {
    it('returns username validation error when username is blank', function() {
      const model = new PrimaryAuth({ username: '', password: 'pass' });

      expect(model.validate().username).toEqual('Please enter a username');
    });

    it('returns password validation error when password is blank', function() {
      const model = new PrimaryAuth({ username: 'user', password: '' });

      expect(model.validate().password).toEqual('Please enter a password');
    });
  });

  Expect.describe('settings', function() {
    itp('uses default title', function() {
      return setup().then(function(test) {
        expect(test.form.titleText()).toEqual('Sign In');
      });
    });
    itp('uses default for username label', function() {
      return setup().then(function(test) {
        const $usernameLabel = test.form.usernameLabel();

        expect($usernameLabel.text().trim()).toEqual('Username');
      });
    });
    itp('sets autocomplete on username', function() {
      return setup().then(function(test) {
        expect(test.form.getUsernameFieldAutocomplete()).toBe('username');
      });
    });
    itp('sets autocomplete on password', function() {
      return setup().then(function(test) {
        expect(test.form.getPasswordFieldAutocomplete()).toBe('current-password');
      });
    });
    itp('uses default for password label', function() {
      return setup().then(function(test) {
        const $passwordLabel = test.form.passwordLabel();

        expect($passwordLabel.text().trim()).toEqual('Password');
      });
    });
    itp('uses default for rememberMe', function() {
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
    itp('overrides rememberMe from settings', function() {
      const options = { 'features.rememberMe': true };

      return setup(options).then(function(test) {
        const label = test.form.rememberMeLabelText();

        expect(label).toEqual('Remember me');
      });
    });
    itp('username field does not have explain by default', function() {
      return setup().then(function(test) {
        const explain = test.form.usernameExplain();

        expect(explain.length).toBe(0);
      });
    });
    itp('has css display:block', () => {
      return setup().then(() => {
        return Expect.waitForCss('.auth-container')
          .then(() => {
            const mainElement = $('.auth-container')[0];
            expect(window.getComputedStyle(mainElement).display).toBe('block');
          });
      });
    });
    itp('username field does not have explain when only label is customized', function() {
      const options = {
        language: 'en',
        i18n: {
          en: {
            'primaryauth.username.placeholder': 'Custom Username Label',
          },
        },
      };

      return setup(options).then(function(test) {
        const explain = test.form.usernameExplain();

        expect(explain.length).toBe(0);
      });
    });
    itp('username field does have explain when is customized', function() {
      const options = {
        language: 'en',
        i18n: {
          en: {
            'primaryauth.username.tooltip': 'Custom Username Explain',
          },
        },
      };

      return setup(options).then(function(test) {
        Util.callAllTimeouts();
        const explain = test.form.usernameExplain();

        expect(explain.text()).toEqual('Custom Username Explain');
      });
    });
    itp('password field does not have explain by default', function() {
      return setup().then(function(test) {
        const explain = test.form.passwordExplain();

        expect(explain.length).toBe(0);
      });
    });
    itp('password field does not have explain when only label is customized', function() {
      const options = {
        language: 'en',
        i18n: {
          en: {
            'primaryauth.password.placeholder': 'Custom Password Explain',
          },
        },
      };

      return setup(options).then(function(test) {
        const explain = test.form.passwordExplain();

        expect(explain.length).toBe(0);
      });
    });
    itp('password field does have explain when is customized', function() {
      const options = {
        language: 'en',
        i18n: {
          en: {
            'primaryauth.password.tooltip': 'Custom Password Explain',
          },
        },
      };

      return setup(options).then(function(test) {
        const explain = test.form.passwordExplain();

        expect(explain.text()).toEqual('Custom Password Explain');
      });
    });
    itp('focuses on username field in browsers other than IE', function() {
      spyOn(BrowserFeatures, 'isIE').and.returnValue(false);
      return setup().then(function(test) {
        // focus() is called by _applyMode_ before the view is added to DOM
        // this would not work except for the fact that focus is wrapped in debounce() which uses setTimeout to delay the call
        Util.callAllTimeouts();
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

  Expect.describe('elements', function() {
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
      // This causes a race with loading beacon. We are not testing i18n, so we can mock language bundles as loaded
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
        expect(username.attr('id')).toEqual('okta-signin-username');
        expect(username.prop('required')).toEqual(true);
      });
    });
    itp('has a password field', function() {
      return setup().then(function(test) {
        const password = test.form.passwordField();

        expect(password.length).toBe(1);
        expect(password.attr('type')).toEqual('password');
        expect(password.attr('id')).toEqual('okta-signin-password');
        expect(password.prop('required')).toEqual(true);
      });
    });
    itp('has a sign in button', function() {
      return setup().then(function(test) {
        const signInButton = test.form.signInButton();

        expect(signInButton.length).toBe(1);
        expect(signInButton.attr('type')).toEqual('submit');
        expect(signInButton.attr('id')).toEqual('okta-signin-submit');
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
    itp('has helpFooter with right aria-attributes and default values', function() {
      return setup().then(function(test) {
        expect(test.form.helpFooter().attr('aria-expanded')).toBe('false');
        expect(test.form.helpFooter().attr('aria-controls')).toBe('help-links-container');
      });
    });
    // OKTA-407603 enable or move this test
    // eslint-disable-next-line jasmine/no-disabled-tests
    xit('sets aria-expanded attribute correctly when clicking help', function() {
      return setup().then(function(test) {
        expect(test.form.helpFooter().attr('aria-expanded')).toBe('false');
        test.form.helpFooter().click();
        expect(test.form.helpFooter().attr('aria-expanded')).toBe('true');
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
    itp('has the correct rel attributes for help link', function() {
      return setup().then(function(test) {
        expect(test.form.helpLink().attr('rel')).toBe('noopener noreferrer');
      });
    });
    itp('has a custom help link url when available', function() {
      return setup({ 'helpLinks.help': 'https://bar.com' }).then(function(test) {
        spyOn(SharedUtil, 'redirect');
        expect(test.form.helpLinkHref()).toBe('https://bar.com');
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
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          test.form.helpFooter().click();
          expect(test.form.forgotPasswordLinkVisible()).not.toBe(true);
        });
    });
    itp('navigates to forgot password page when click forgot password link', function() {
      return setup().then(function(test) {
        test.form.helpFooter().click();
        test.form.forgotPasswordLink().click();
        expect(test.router.navigate).toHaveBeenCalledWith('signin/forgot-password', { trigger: true });
      });
    });
    itp('does not navigate to forgot password page when link disabled and clicked', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
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
      return setup({ 'helpLinks.forgotPassword': 'https://foo.com' })
        .then(function(test) {
          spyOn(SharedUtil, 'redirect');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
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
        test.form.helpFooter().click();
        test.form.unlockLink().click();
        expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', { trigger: true });
      });
    });
    itp('does not navigate to unlock page when link disabled and clicked', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
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
      return setup({
        'helpLinks.unlock': 'https://foo.com',
        'features.selfServiceUnlock': true,
      })
        .then(function(test) {
          spyOn(SharedUtil, 'redirect');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
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
    itp('Does not show the password toggle button if features.showPasswordToggleOnSignInPage is not set', function() {
      return setup({ 'features.showPasswordToggleOnSignInPage': false }).then(function(test) {
        test.form.setPassword('testpass');
        test.form.setUsername('testuser');
        expect(test.form.passwordToggleContainer().length).toBe(0);
      });
    });
    itp('Show the password toggle button if features.showPasswordToggleOnSignInPage is set', function() {
      return setup({ 'features.showPasswordToggleOnSignInPage': true }).then(function(test) {
        test.form.setPassword('testpass');
        test.form.setUsername('testuser');
        expect(test.form.passwordToggleContainer().length).toBe(1);
      });
    });
    itp(
      'Toggles icon when the password toggle button with features.showPasswordToggleOnSignInPage is clicked',
      function() {
        return setup({ 'features.showPasswordToggleOnSignInPage': true }).then(function(test) {
          test.form.setPassword('testpass');
          test.form.setUsername('testuser');
          expect(test.form.passwordToggleContainer().length).toBe(1);
          expect(test.form.$('#okta-signin-password').attr('type')).toBe('password');
          test.form.passwordToggleShowContainer().click();
          expect(test.form.$('#okta-signin-password').attr('type')).toBe('text');
          expect(test.form.passwordToggleShowContainer().is(':visible')).toBe(false);
          expect(test.form.passwordToggleHideContainer().is(':visible')).toBe(true);
          test.form.passwordToggleHideContainer().click();
          expect(test.form.$('#okta-signin-password').attr('type')).toBe('password');
          expect(test.form.passwordToggleShowContainer().is(':visible')).toBe(true);
          expect(test.form.passwordToggleHideContainer().is(':visible')).toBe(false);
        });
      }
    );
    itp('Toggles password field from text to password after 30 seconds', function() {
      return setup({ 'features.showPasswordToggleOnSignInPage': true }).then(function(test) {
        jasmine.clock().uninstall();
        const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;
        jasmine.clock().install();
        test.form.setPassword('testpass');
        test.form.setUsername('testuser');
        expect(test.form.passwordToggleContainer().length).toBe(1);
        expect(test.form.$('#okta-signin-password').attr('type')).toBe('password');
        test.form.passwordToggleShowContainer().click();
        expect(test.form.$('#okta-signin-password').attr('type')).toBe('text');
        expect(test.form.passwordToggleShowContainer().is(':visible')).toBe(false);
        expect(test.form.passwordToggleHideContainer().is(':visible')).toBe(true);
        // t25
        jasmine.clock().tick(25 * 1000);
        expect(test.form.$('#okta-signin-password').attr('type')).toBe('text');
        expect(test.form.passwordToggleShowContainer().is(':visible')).toBe(false);
        expect(test.form.passwordToggleHideContainer().is(':visible')).toBe(true);
        // t35
        jasmine.clock().tick(35 * 1000);
        expect(test.form.$('#okta-signin-password').attr('type')).toBe('password');
        expect(test.form.passwordToggleShowContainer().is(':visible')).toBe(true);
        expect(test.form.passwordToggleHideContainer().is(':visible')).toBe(false);
        jasmine.clock().uninstall();
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      });
    });
    itp('sets username input aria-invalid="false" on init and clears on blur', function() {
      return setup()
        .then((test) => {
          expect(test.form.usernameField()[0].getAttribute('aria-invalid')).toEqual('false');
          test.form.usernameField().focusin();
          expect(test.form.usernameField()[0].getAttribute('aria-invalid')).toEqual('false');
          test.form.usernameField().focusout();
          return test;
        })
        .then((test) => {
          expect(test.form.usernameField()[0].getAttribute('aria-invalid')).toBeFalsy();
        });
    });
    itp('sets password input aria-invalid="false" on init and clears on blur', function() {
      return setup()
        .then(function(test) {
          expect(test.form.passwordField()[0].getAttribute('aria-invalid')).toEqual('false');
          test.form.passwordField().focusin();
          expect(test.form.passwordField()[0].getAttribute('aria-invalid')).toEqual('false');
          test.form.passwordField().focusout();
          return test;
        })
        .then((test) => {
          expect(test.form.passwordField()[0].getAttribute('aria-invalid')).toBeFalsy();
        });
    });
    itp('show username validation error when username field is dirty', function() {
      return setup().then(function(test) {
        test.form.usernameField().focus();
        test.form.setUsername('testuser');
        const msg1 = test.router.controller.model.validateField('username');

        expect(msg1).toEqual(undefined);
        test.form.usernameField().focus();
        test.form.setUsername('');
        const msg2 = test.router.controller.model.validateField('username').username;

        expect(msg2).toEqual('Please enter a username');
      });
    });
    itp('does not show username validation error when username field is not dirty', function() {
      return setup().then(function(test) {
        test.form.usernameField().focusin();
        Util.callAllTimeouts();
        expect(test.form.usernameField()[0].parentElement).toHaveClass('focused-input');
        test.form.usernameField().focusout();
        Util.callAllTimeouts(); // focus is wrapped in debounce() which uses setTimeout()
        expect(test.form.usernameField()[0].parentElement).not.toHaveClass('focused-input');
        spyOn(test.router.controller.model, 'validate');
        expect(test.router.controller.model.validate).not.toHaveBeenCalled();
      });
    });
    itp('show password validation error when password field is dirty', function() {
      return setup().then(function(test) {
        test.form.passwordField().focusin();
        Util.callAllTimeouts();
        test.form.setPassword('Abcd1234');

        const msg1 = test.router.controller.model.validateField('password');

        expect(msg1).toEqual(undefined);
        test.form.passwordField().focus();
        test.form.setPassword('');
        const msg2 = test.router.controller.model.validateField('password').password;

        expect(msg2).toEqual('Please enter a password');
      });
    });
    itp('does not show password validation error when password field is not dirty', function() {
      return setup({ username: 'abc' }).then(function(test) {
        spyOn(test.router.controller.model, 'validate');
        test.form.passwordField().focusin();
        Util.callAllTimeouts();
        expect(test.form.passwordField()[0].parentElement).toHaveClass('focused-input');
        test.form.passwordField().focusout();
        expect(test.form.passwordField()[0].parentElement).not.toHaveClass('focused-input');
        expect(test.router.controller.model.validate).not.toHaveBeenCalled();
      });
    });
  });

  Expect.describe('Okta UA', function() {
    itp('tracks Okta UA for widget in "x-okta-user-agent-extended"', function() {
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          const ajaxArgs = Util.getAjaxRequest(0);
          expect(ajaxArgs.requestHeaders['x-okta-user-agent-extended'].indexOf('okta-signin-widget-9.9.99')).toBeGreaterThan(-1);
        });
    });
  });

  Expect.describe('transform username', function() {
    itp('calls the transformUsername function with the right parameters', function() {
      return setupWithTransformUsername()
        .then(function(test) {
          spyOn(test.router.settings, 'transformUsername');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          expect(test.router.settings.transformUsername.calls.count()).toBe(1);
          expect(test.router.settings.transformUsername.calls.argsFor(0)).toEqual(['testuser', 'PRIMARY_AUTH']);
        });
    });
    itp('does not call transformUsername while loading security image', function() {
      return setup({ features: { securityImage: true }, transformUsername: transformUsername })
        .then(function(test) {
          spyOn(test.router.settings, 'transformUsername');
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect(test.router.settings.transformUsername.calls.count()).toBe(0);
          expect(Util.numAjaxRequests()).toBe(1);
          expect(Util.getAjaxRequest(0).url).toBe('https://foo.com/login/getimage?username=testuser');
        });
    });
    itp('adds the suffix to the username if the username does not have it', function() {
      return setupWithTransformUsername()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser@example.com',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
    itp('adds the suffix to the inital username if it is provided', function() {
      return setupWithTransformUsername()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'foobar@example.com',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
    itp('does not add the suffix to the username if the username already has it', function() {
      return setupWithTransformUsername()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser@example.com');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser@example.com',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
    itp('does not add the suffix to the username if "PRIMARY_AUTH" operation is not handled', function() {
      return setupWithTransformUsernameOnUnlock()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
  });

  Expect.describe('Typing biometrics', function() {
    itp('does not contain typing pattern header in primary auth request if feature is disabled', function() {
      return setup({ features: { trackTypingPattern: false } })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          spyOn(TypingUtil, 'track').and.callFake(function(target) {
            expect(target).toBe('okta-signin-username');
          });
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(TypingUtil.track).not.toHaveBeenCalled();
          expect(Util.numAjaxRequests()).toBe(1);
          const ajaxArgs = Util.getAjaxRequest(0);

          expect(ajaxArgs.requestHeaders['x-typing-pattern']).toBe(undefined);
        });
    });

    itp('contains typing pattern header in primary auth request if feature is enabled', function() {
      return setup({ features: { trackTypingPattern: true } })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          spyOn(TypingUtil, 'track').and.callFake(function(targetId) {
            expect(targetId).toBe('okta-signin-username');
          });
          spyOn(TypingUtil, 'getTypingPattern').and.callFake(function() {
            return typingPattern;
          });
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          const ajaxArgs = Util.getAjaxRequest(0);

          expect(ajaxArgs.requestHeaders['x-typing-pattern']).toBe(typingPattern);
        });
    });

    itp('continues with primary auth if typing pattern cannot be computed', function() {
      return setup({ features: { trackTypingPattern: true } })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          spyOn(TypingUtil, 'getTypingPattern').and.callFake(function() {
            return;
          });
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          const ajaxArgs = Util.getAjaxRequest(0);

          expect(ajaxArgs.requestHeaders['x-typing-pattern']).toBeUndefined();
        });
    });
  });

  Expect.describe('Device Fingerprint', function() {
    itp(
      `is not computed if securityImage is off, deviceFingerprinting is true
        and useDeviceFingerprintForSecurityImage is true`,
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
            spyOn(PrimaryAuthController.prototype, 'shouldComputeDeviceFingerprint').and.callThrough();
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return Expect.waitForSpyCall(PrimaryAuthController.prototype.shouldComputeDeviceFingerprint, test);
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
            test.form.setUsername('testuser');
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
      `contains fingerprint header in get security image request if both features
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
            test.form.setUsername('testuser');
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
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);

            expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBeUndefined();
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
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);

            expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBeUndefined();
          });
      }
    );
    itp('does not contain device fingerprint header in primaryAuth if feature is disabled', function() {
      spyOn(DeviceFingerprint, 'generateDeviceFingerprint');
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
          const ajaxArgs = Util.getAjaxRequest(0);

          expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBeUndefined();
        });
    });
    itp('contains device fingerprint header in primaryAuth if feature is enabled', function() {
      spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
        const deferred = Q.defer();

        deferred.resolve('thisIsTheDeviceFingerprint');
        return deferred.promise;
      });
      return setup({ features: { deviceFingerprinting: true } })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
          const ajaxArgs = Util.getAjaxRequest(0);

          expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBe('thisIsTheDeviceFingerprint');
        });
    });
    itp('continues with primary auth if there is an error getting fingerprint when feature is enabled', function() {
      spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
        const deferred = Q.defer();

        deferred.reject('there was an error');
        return deferred.promise;
      });
      return setup({ features: { deviceFingerprinting: true } })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
          const ajaxArgs = Util.getAjaxRequest(0);

          expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBeUndefined();
          Expect.isJsonPost(ajaxArgs, {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
    itp(
      'contains device fingerprint and typing pattern header in primaryAuth if both features are enabled',
      function() {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
          const deferred = Q.defer();

          deferred.resolve('thisIsTheDeviceFingerprint');
          return deferred.promise;
        });
        spyOn(TypingUtil, 'track').and.callFake(function(target) {
          expect(target).toBe('okta-signin-username');
        });
        spyOn(TypingUtil, 'getTypingPattern').and.callFake(function() {
          return typingPattern;
        });
        return setup({ features: { deviceFingerprinting: true, trackTypingPattern: true } })
          .then(function(test) {
            Util.resetAjaxRequests();
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
            const ajaxArgs = Util.getAjaxRequest(0);

            expect(ajaxArgs.requestHeaders['x-device-fingerprint']).toBe('thisIsTheDeviceFingerprint');
            expect(ajaxArgs.requestHeaders['x-typing-pattern']).toBe(typingPattern);
          });
      }
    );
    itp('does not load deviceFingerprint when username field looses focus if username is empty', function() {
      spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
        const deferred = Q.defer();

        deferred.resolve('thisIsTheDeviceFingerprint');
        return deferred.promise;
      });
      return setup({ features: { securityImage: true, deviceFingerprinting: true } }).then(function(test) {
        test.setNextResponse(resSecurityImage);
        test.form.setUsername('');
        test.form.usernameField().focusout();
        expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
      });
    });
    itp('disables the "sign in" button while fetching fingerprint before model.save', function() {
      spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function() {
        const deferred = Q.defer();

        deferred.resolve('thisIsTheDeviceFingerprint');
        return deferred.promise;
      });
      return setup({
        features: { securityImage: true, deviceFingerprinting: true, useDeviceFingerprintForSecurityImage: false },
      })
        .then(function(test) {
          test.securityBeacon = test.router.header.currentBeacon.$el;
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          spyOn(PrimaryAuthController.prototype, 'toggleButtonState').and.callThrough();
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          const spyCalls = PrimaryAuthController.prototype.toggleButtonState.calls;

          expect(spyCalls.count()).toBe(2);
          // get device fingerprint
          expect(spyCalls.argsFor(0)).toEqual([true]);
          // submit creds to authn
          expect(spyCalls.argsFor(1)).toEqual([true]);
        });
    });
  });

  Expect.describe('events', function() {
    Expect.describe('beacon loading', function() {
      itp('shows beacon-loading animation when primaryAuth is submitted', function() {
        return setup({ features: { securityImage: true } })
          .then(function(test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function(test) {
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextResponse(resSuccess);
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function(test) {
            const spyCalls = test.securityBeacon.toggleClass.calls;

            expect(spyCalls.count()).toBe(3);
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]); // in view
            expect(spyCalls.argsFor(1)).toEqual([BEACON_LOADING_CLS, true]); // in model
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]); // in model
            expect(test.securityBeacon.html()).toBe(
              '<div class="beacon-blank">' +
              '<div class="radial-progress-bar" style="clip: rect(0px, 96px, 96px, 48px);">' +
              '<div class="circle left" style="transform: rotate(0deg); text-indent: 1px;"></div>' + 
              '<div class="circle right" style="transform: rotate(0deg); text-indent: 1px;"></div>' + 
              '</div>' + // beacon-blank
              '</div>' + // radial-progress-bar
              '<div aria-live="polite" role="img" class="bg-helper auth-beacon auth-beacon-security" data-se="security-beacon" ' + 
              'style="background-image: url(&quot;/base/test/unit/assets/1x1.gif&quot;);">' + 
              '<span class="accessibility-text">a single pixel</span><div class="okta-sign-in-beacon-border js-auth-beacon-border auth-beacon-border"></div>' + 
              '</div>' // bg-helper
            );
          });
      });
      itp('shows beacon-loading animation when primaryAuth is submitted (with deviceFingerprint)', function() {
        return setup({
          features: { securityImage: true, deviceFingerprinting: true, useDeviceFingerprintForSecurityImage: false },
        })
          .then(function(test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function(test) {
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextResponse(resSuccess);
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function(test) {
            const spyCalls = test.securityBeacon.toggleClass.calls;

            expect(spyCalls.count()).toBe(3);
            // get fingerprint
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            // model.save
            expect(spyCalls.argsFor(1)).toEqual([BEACON_LOADING_CLS, true]);
            // model.save complete
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
      });
      itp('does not show beacon-loading animation when primaryAuth fails', function() {
        return setup({ features: { securityImage: true } })
          .then(function(test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextResponse(resUnauthorized);
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForSpyCall(test.afterErrorHandler, test);
          })
          .then(function(test) {
            const spyCalls = test.securityBeacon.toggleClass.calls;

            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
      });
      itp('does not show beacon-loading animation when password expires', function() {
        return setup({ features: { securityImage: true } })
          .then(function(test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextResponse(resPwdExpired);
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForPasswordExpired(test);
          })
          .then(function(test) {
            const spyCalls = test.securityBeacon.toggleClass.calls;
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
      });
      itp('does not show beacon-loading animation on CORS error', function() {
        return setup({ features: { securityImage: true } })
          .then(function(test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            spyOn(test.router.settings, 'callGlobalError');
            test.setNextResponse({ status: 0, response: {} });
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForSpyCall(test.router.settings.callGlobalError, test);
          })
          .then(function(test) {
            const spyCalls = test.securityBeacon.toggleClass.calls;

            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
      });
      itp('shows beacon-loading animation when primaryAuth is submitted (no security image)', function() {
        return setup()
          .then(function(test) {
            test.setNextResponse(resSuccess);
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function(test) {
            expect(test.beacon.isLoadingBeacon()).toBe(true);
          });
      });
      itp('does not show beacon-loading animation when primaryAuth fails (no security image)', function() {
        return setup()
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resUnauthorized);
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForSpyCall(test.afterErrorHandler, test);
          })
          .then(function(test) {
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
      });
      itp('does not show beacon-loading animation when password expires (no security image)', function() {
        return setup()
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resPwdExpired);
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForPasswordExpired(test);
          })
          .then(function(test) {
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
      });
      it('hides beacon-loading animation when user lockout message is displayed(no security image and selfServiceUnlock is off)', function() {
        return setup()
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resLockedOut);
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Your account is locked. Please contact your administrator.');
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
      });
      itp('hide beacon spinner when security image is disabled during invalid login attempt', function() {
        return setup()
          .then(function(test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resUnauthorized);
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Unable to sign in');
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
      });
      itp('does not show beacon-loading animation on CORS error (no security image)', function() {
        return setup()
          .then(function(test) {
            spyOn(test.router.settings, 'callGlobalError');
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse({ status: 0, response: {} });
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return Expect.waitForSpyCall(test.router.settings.callGlobalError, test);
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
          spyOn(PrimaryAuthController.prototype, 'shouldComputeDeviceFingerprint').and.callThrough();
          test.form.setUsername('testuser');
          return Expect.waitForSpyCall(PrimaryAuthController.prototype.shouldComputeDeviceFingerprint, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(0);
        });
    });
    itp('has default security image on page load and no rememberMe', function() {
      return setup({ features: { securityImage: true } }).then(function(test) {
        expect(test.form.securityBeacon()[0].className).toMatch('undefined-user');
        expect(test.form.securityBeacon()[0].className).not.toMatch('new-device');
        expect(test.form.securityBeacon().css('background-image')).toMatch(
          /\/base\/target\/img\/security\/default.*\.png/
        );
      });
    });
    itp('shows beacon-loading animation while loading security image (with deviceFingerprint)', function() {
      return setup({ features: { securityImage: true, deviceFingerprinting: true } })
        .then(function(test) {
          test.securityBeacon = test.router.header.currentBeacon.$el;
          spyOn(test.securityBeacon, 'toggleClass');
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          const spyCalls = test.securityBeacon.toggleClass.calls;

          expect(spyCalls.count()).toBe(2);
          expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
          expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
        });
    });
    itp('updates security beacon when user enters correct username', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('test+user');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          // reserved characters in the username (like "+") should be escaped, since it's in the query
          expect(Util.getAjaxRequest(0).url).toEqual('https://foo.com/login/getimage?username=test%2Buser');
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
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
        });
    });
    itp('updates security beacon to show the new user image when user enters unfamiliar username', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser');
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
          test.form.setUsername('testuser');
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
          test.form.setUsername('testuser');
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
    
    itp('show anti-phishing message when security image is new user', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          spyOn($.qtip.prototype, 'toggle').and.callThrough();
          test.setNextResponse(resSecurityImageNewUser);
          test.form.setUsername('testuser');
          return Expect.waitForSecurityImageTooltip(true, test);
        })
        .then(function(test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: true }));
          $.qtip.prototype.toggle.calls.reset();
          test.form.securityBeaconContainer().hide();
          $(window).trigger('resize');
          return Expect.waitForSecurityImageTooltip(false, test);
        })
        .then(function(test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: false }));
          $.qtip.prototype.toggle.calls.reset();
          test.form.securityBeaconContainer().show();
          $(window).trigger('resize');
          return Expect.waitForSecurityImageTooltip(true, test);
        })
        .then(function() {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: true }));
        });
    });
    itp('show anti-phishing message if security image become visible', function() {
      return setup({ features: { securityImage: true } })
        .then(function(test) {
          spyOn($.qtip.prototype, 'toggle').and.callThrough();
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser');
          return Expect.waitForSecurityImageTooltip(true, test);
        })
        .then(function(test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: true }));
          $.qtip.prototype.toggle.calls.reset();
          test.form.securityBeaconContainer().hide();
          $(window).trigger('resize');
          return Expect.waitForSecurityImageTooltip(false, test);
        })
        .then(function(test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({ 0: false }));
          $.qtip.prototype.toggle.calls.reset();
          test.form.securityBeaconContainer().show();
          $(window).trigger('resize');
          return Expect.waitForSecurityImageTooltip(true, test);
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
          test.form.setUsername('testuser');
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
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function(test) {
          // Tooltip exists
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(false);
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', { trigger: true });
          // Verify tooltip is gone
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(true);
        });
    });
    itp('updates security beacon immediately if rememberMe is available', function() {
      Util.mockGetCookie('ln', 'testuser');
      const options = {
        features: {
          rememberMe: true,
          securityImage: true,
        },
      };

      return setup(options, [resSecurityImage])
        .then(function(test) {
          return Expect.wait(function() {
            return test.form.accessibilityText() === 'a single pixel';
          }, test);
        })
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
          test.form.setUsername('testuser');
          return Expect.waitForSpyCall(test.router.settings.callGlobalError, test);
        })
        .then(function(test) {
          const err = test.router.settings.callGlobalError.calls.mostRecent().args[0];

          expect(err instanceof Errors.UnsupportedBrowserError).toBe(true);
          expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
          expect(err.message).toEqual('There was an error sending the request - have you enabled CORS?');
        });
    });
    itp('has username in field if rememberMe is available', function() {
      Util.mockGetCookie('ln', 'testuser');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        expect(test.form.usernameField().val()).toBe('testuser');
      });
    });
    itp('has rememberMe checked if rememberMe is available', function() {
      Util.mockGetCookie('ln', 'testuser');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
      });
    });
    itp('unchecks rememberMe if username is changed', function() {
      Util.mockGetCookie('ln', 'testuser');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
        test.form.setUsername('new-user');
        expect(test.form.rememberMeCheckboxStatus()).toBe('unchecked');
      });
    });
    itp('does not re-render rememberMe checkbox on changes', function() {
      Util.mockGetCookie('ln', 'testuser');
      const options = {
        'features.rememberMe': true,
      };

      return setup(options).then(function(test) {
        const orig = test.form.rememberMeCheckbox().get(0);

        test.form.setUsername('new-user');
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
        username: 'testuser@ABC.com',
        'features.rememberMe': false,
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
      Util.mockGetCookie('ln', 'testuser');
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
        Util.resetAjaxRequests();
        test.form.submit();
        expect(test.form.usernameErrorField().length).toBe(1);
        const button = test.form.submitButton();
        const buttonClass = button.attr('class');

        expect(buttonClass).not.toContain('link-button-disabled');
        expect(test.form.isDisabled()).toBe(false);
        expect(Util.numAjaxRequests()).toBe(0);
      });
    });
    itp('shows an error if password is empty and submitted', function() {
      return setup().then(function(test) {
        Util.resetAjaxRequests();
        test.form.submit();
        expect(test.form.passwordErrorField().length).toBe(1);
        const button = test.form.submitButton();
        const buttonClass = button.attr('class');

        expect(buttonClass).not.toContain('link-button-disabled');
        expect(test.form.isDisabled()).toBe(false);
        expect(Util.numAjaxRequests()).toBe(0);
      });
    });
    itp('reenables button and fields after a CORS error', function() {
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse({ status: 0, response: {} });
          test.form.submit();
          return Expect.waitForAjaxRequest(test);
        })
        .then(function(test) {
          const button = test.form.submitButton();
          const buttonClass = button.attr('class');

          expect(buttonClass).not.toContain('link-button-disabled');
          expect(test.form.isDisabled()).toBe(false);
        });
    });
    /*
    This test no longer works. test.form.submit() triggers a Promise
    which will terminate after the assertions run. There is currently
    no event to wait on and tick() will wait too long and the link
    button will have been disabled and re-enabled.
     This requires some work - need to provide a helper method to do
    something like:
      1. Mock ajax request, but don't return the response
     1. Have test validate expection, and then call a function to
        resolve the response promise
     */
    // itp('disables the "sign in" button when clicked', function () {
    //   return setup().then(function (test) {
    //     Util.resetAjaxRequests();
    //     test.form.setUsername('testuser');
    //     test.form.setPassword('pass');
    //     test.setNextResponse(resUnauthorized);
    //     test.form.submit();
    //     var button = test.form.submitButton();
    //     var buttonClass = button.attr('class');
    //     expect(buttonClass).toContain('link-button-disabled');
    //     expect(test.form.isDisabled()).toBe(true);
    //     return tick(test);
    //   })
    //     .then(function (test) {
    //       var button = test.form.submitButton();
    //       var buttonClass = button.attr('class');
    //       expect(buttonClass).not.toContain('link-button-disabled');
    //       expect(test.form.isDisabled()).toBe(false);
    //     });
    // });
    itp('calls authClient primaryAuth with form values when submitted', function() {
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.successSpy.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          // Form is kept disabling until `globalSuccessFn` does something else,
          // change the DOM or redirect. Widget will not re-enable form when success.
          expect(test.form.isDisabled()).toBe(true);
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
    itp('calls authentication with stateToken if status is UNAUTHENTICATED', function() {
      return setupUnauthenticated()
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          expect(test.form.isDisabled()).toBe(true);
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.okta.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              stateToken: 'aStateToken',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false,
              },
            },
          });
        });
    });
    itp('calls processCreds function before saving a model', function() {
      const processCredsSpy = jasmine.createSpy('processCreds');

      return setup({
        processCreds: processCredsSpy,
      })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'testuser',
            password: 'pass',
          });
          expect(Util.numAjaxRequests()).toBe(1);
        });
    });
    itp('calls async processCreds function before saving a model', function() {
      const processCredsSpy = jasmine.createSpy('processCreds');
      return setup({
        processCreds: function(creds, callback) {
          processCredsSpy(creds, callback);
          callback();
        },
      })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith(
            {
              username: 'testuser',
              password: 'pass',
            },
            jasmine.any(Function)
          );
          expect(Util.numAjaxRequests()).toBe(1);
        });
    });
    itp('calls async processCreds function and can prevent saving a model', function() {
      const processCredsSpy = jasmine.createSpy('processCreds');

      return setup({
        processCreds: function(creds, callback) {
          processCredsSpy(creds, callback);
        },
      })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(processCredsSpy);
        })
        .then(function() {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith(
            {
              username: 'testuser',
              password: 'pass',
            },
            jasmine.any(Function)
          );
          expect(Util.numAjaxRequests()).toBe(0);
        });
    });
    itp('calls authClient with multiOptionalFactorEnroll=true if feature is true', function() {
      return setup({ 'features.multiOptionalFactorEnroll': true })
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          expect(test.form.isDisabled()).toBe(true);
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: true,
              },
            },
          });
        });
    });
    itp('sets rememberMe cookie if rememberMe is enabled and checked on submit', function() {
      const cookieSpy = Util.mockSetCookie();

      return setup({ 'features.rememberMe': true })
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.form.setRememberMe(true);
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(cookieSpy).toHaveBeenCalledWith('ln', 'testuser', {
            expires: 365,
            path: '/',
          });
        });
    });
    itp('removes rememberMe cookie if called with existing username and unchecked', function() {
      Util.mockGetCookie('ln', 'testuser');
      const removeCookieSpy = Util.mockRemoveCookie();

      return setup({ 'features.rememberMe': true })
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.form.setRememberMe(false);
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function() {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
    });
    itp('removes rememberMe cookie if Authentication failed (401)', function() {
      const removeCookieSpy = Util.mockRemoveCookie();

      return setup()
        .then(function(test) {
          test.form.setUsername('invalidUser');
          test.form.setPassword('anyPwd');
          test.form.setRememberMe(true);
          test.setNextResponse(resUnauthorized);
          test.form.submit();
          return Expect.waitForSpyCall(test.afterErrorHandler, test);
        })
        .then(function() {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
    });
    itp('shows an error if authClient returns with an error', function() {
      return setup()
        .then(function(test) {
          test.setNextResponse(resUnauthorized);
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Unable to sign in');
        });
    });
    itp('shows the right throttle error message', function() {
      return setup()
        .then(function(test) {
          test.setNextResponse(resThrottle);
          test.form.setUsername('testuser');
          test.form.setPassword('testpass');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('You exceeded the maximum number of requests. Try again in a while.');
          expectErrorEvent(test, 429, 'API call exceeded rate limit due to too many requests.');
        });
    });
    itp('shows the correct error if authClient returns with a correct error object', function() {
      return setup()
        .then(function(test) {
          test.setNextResponse(resErrorValid);
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Unable to sign in');
          expectErrorEvent(test, 401, 'Authentication failed');
        });
    });
    itp('shows a form error if authClient returns with an error that is plain text', function() {
      return setup()
        .then(function(test) {
          test.setNextResponse(resNonJson);
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Unable to sign in');
          expectErrorEvent(test, 401, 'Authentication failed');
        });
    });
    itp('shows a form error if authClient returns with an error that is plain text and not a valid json', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.setNextResponse(resInvalidText);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Could not parse server response');
          expectErrorEvent(test, 401, 'Could not parse server response');
        });
    });
    itp('shows an error if authClient returns with LOCKED_OUT response and selfServiceUnlock is off', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resLockedOut);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Your account is locked. Please contact your administrator.');
        });
    });
    itp('triggers afterError event if authClient returns with LOCKED_OUT response and selfServiceUnlock is off', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resLockedOut);
          test.form.submit();
          return Expect.waitForSpyCall(test.afterErrorHandler, test);
        })
        .then(function(test) {
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'primary-auth',
            },
            {
              name: 'AuthApiError',
              message: 'Your account is locked. Please contact your administrator.',
              xhr: {
                responseJSON: {
                  errorCauses: [],
                  errorSummary: 'Your account is locked. Please contact your administrator.',
                  errorCode: 'E0000119'
                }
              }
            },
          ]);
        });
    });
    itp('redirects to "unlock" if authClient returns with LOCKED_OUT response and selfServiceUnlock is on', function() {
      return setup({ 'features.selfServiceUnlock': true })
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resLockedOut);
          test.form.submit();
          return Expect.waitForSpyCall(test.router.navigate, test);
        })
        .then(function(test) {
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', { trigger: true });
        });
    });
    itp('calls globalErrorFn if authClient returns with a cors enabled error', function() {
      return setup()
        .then(function(test) {
          spyOn(test.router.settings, 'callGlobalError');
          test.setNextResponse({
            responseType: 'json',
            response: '',
            status: 0,
          });
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.form.submit();
          return Expect.waitForSpyCall(test.router.settings.callGlobalError, test);
        })
        .then(function(test) {
          const err = test.router.settings.callGlobalError.calls.mostRecent().args[0];

          expect(err instanceof Errors.UnsupportedBrowserError).toBe(true);
          expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
          expect(err.message).toEqual('There was an error sending the request - have you enabled CORS?');
        });
    });

    itp('shows an error if redirect is required for MFA', function() {
      const serverMessage = 'The client specified not to prompt, but the client app requires re-authentication or MFA.';
      const error = new OAuthError('login_required', serverMessage);
      const clientMessage = 'MFA means need redirect';
      return setup({
        // Set OIDC config to attempt to fetch tokens with /authorize
        clientId: 'fake',
        redirectUri: 'http://fake',
        authParams: {
          pkce: false
        },
        language: 'en',
        i18n: {
          en: {
            'error.mfa.required': clientMessage
          }
        }
      })
        .then(function(test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          spyOn(test.ac.token, 'getWithoutPrompt').and.returnValue(Promise.reject(error));
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe(clientMessage);
        });
    });
  });

  Expect.describe('Passwordless Auth', function() {
    itp('does not have a password field', function() {
      return setupPasswordlessAuth().then(function(test) {
        const password = test.form.passwordField();

        expect(password.length).toBe(0);
      });
    });
    itp('calls authClient.signIn with username only', function() {
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

    itp(
      'calls transaction.authenticate with the same stateToken that the widget was bootstrapped with, in the config object',
      function() {
        return setupPasswordlessAuth(null, true)
          .then(function(test) {
            Util.resetAjaxRequests();
            test.form.setUsername('testuser@test.com');
            test.form.submit();
            return Expect.waitForMfaVerify(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.okta.com/api/v1/authn',
              data: {
                username: 'testuser@test.com',
                stateToken: 'aStateToken',
                options: {
                  warnBeforePasswordExpired: true,
                  multiOptionalFactorEnroll: false,
                },
              },
            });
          });
      }
    );

    itp('can sign in again when sign out is clicked on mfa and no Idx state token', function() {
      return setupPasswordlessAuth(null, true, false)
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser@test.com');
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function(test) {
          // log out when prompted for first factor in UNAUTHENTICATED state
          spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
          test.setNextResponse(resCancel);
          $(test.form.el('signout-link')).click();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          // try to log back in
          expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
          Expect.isPrimaryAuth(test.router.controller);
          Util.resetAjaxRequests();
          test.form.setUsername('testuser@test.com');
          test.setNextResponse(resPasswordlessUnauthenticated);
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function(test) {
          // should see prompt for factor
          expect(test.form.el('factor-question').length).toEqual(1);
        });
    });

    itp(
      'calls transaction.login with the same stateToken that the widget was bootstrapped with, in the config object',
      function() {
        return setupPasswordlessAuth(null, true, true)
          .then(function(test) {
            Util.resetAjaxRequests();
            test.form.setUsername('testuser@test.com');
            test.form.submit();
            return Expect.waitForMfaVerify(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.okta.com/api/v1/authn',
              data: {
                username: 'testuser@test.com',
                stateToken: 'aStateToken',
                options: {
                  warnBeforePasswordExpired: true,
                  multiOptionalFactorEnroll: false,
                },
              },
            });
          });
      }
    );

    itp('can sign in again when sign out is clicked on mfa and there is Idx state token', function() {
      return setupPasswordlessAuth(null, true, true)
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setUsername('testuser@test.com');
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function(test) {
          // log out when prompted for first factor in UNAUTHENTICATED state
          spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
          test.setNextResponse(resCancel);
          $(test.form.el('signout-link')).click();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          // try to log back in
          expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
          Expect.isPrimaryAuth(test.router.controller);
          Util.resetAjaxRequests();
          test.form.setUsername('testuser@test.com');
          test.setNextResponse(resFactorRequired);
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function(test) {
          // should see prompt for factor
          expect(test.form.el('factor-question').length).toEqual(1);
        });
    });
  });

  Expect.describe('Social Auth', function() {
    itp('does not show the divider or buttons if no idps are passed in', function() {
      return setup().then(function(test) {
        expect(test.form.hasSocialAuthDivider()).toBe(false);
        expect(test.form.socialAuthButtons().length).toEqual(0);
      });
    });
    itp('shows a divider and a button for each idp that is passed in', function() {
      const settings = {
        idps: [
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234',
          },
          {
            type: 'GOOGLE',
            id: '0oaidiw9udOSceD5678',
          },
        ],
      };

      return setup(settings).then(function(test) {
        expect(test.form.hasSocialAuthDivider()).toBe(true);
        expect(test.form.socialAuthButtons().length).toEqual(2);
        expect(test.form.facebookButton().length).toEqual(1);
        expect(test.form.googleButton().length).toEqual(1);
      });
    });
    itp('shows idps in the order specified', function() {
      const settings = {
        idps: [
          {
            type: 'LINKEDIN',
            id: '0oaidiw9udOSceD1111',
          },
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234',
          },
          {
            type: 'GOOGLE',
            id: '0oaidiw9udOSceD5678',
          },
          {
            type: 'APPLE',
            id: '0oaz2emOZGUKjuZwX0g3',
          },
          {
            type: 'MICROSOFT',
            id: '0oaidiw9udOSceD3333',
          },
        ],
      };

      return setup(settings).then(function(test) {
        const buttons = test.form.socialAuthButtons();

        expect(buttons.eq(0).attr('class')).toContain('social-auth-linkedin-button');
        expect(buttons.eq(1).attr('class')).toContain('social-auth-facebook-button');
        expect(buttons.eq(2).attr('class')).toContain('social-auth-google-button');
        expect(buttons.eq(3).attr('class')).toContain('social-auth-apple-button');
        expect(buttons.eq(4).attr('class')).toContain('social-auth-microsoft-button');
      });
    });
    itp('optionally adds a class for idp buttons', function() {
      const settings = {
        idps: [
          {
            type: 'GOOGLE',
            id: '0oaidiw9udOSceD5678',
            className: 'example-class',
          },
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234',
          },
          {
            id: '0oaidiw9udOSceD1111',
            text: 'Not default text',
            className: 'other-class',
          },
        ],
      };

      return setup(settings).then(function(test) {
        const buttons = test.form.socialAuthButtons();

        expect(buttons.eq(0).attr('class')).toContain('social-auth-google-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-facebook-button');
        expect(buttons.eq(0).attr('class')).toContain('example-class');
        expect(buttons.eq(0).attr('class')).not.toContain('other-class');

        expect(buttons.eq(1).attr('class')).not.toContain('social-auth-google-button');
        expect(buttons.eq(1).attr('class')).toContain('social-auth-facebook-button');
        expect(buttons.eq(1).attr('class')).not.toContain('example-class');
        expect(buttons.eq(1).attr('class')).not.toContain('other-class');

        expect(buttons.eq(2).attr('class')).not.toContain('social-auth-google-button');
        expect(buttons.eq(2).attr('class')).not.toContain('social-auth-facebook-button');
        expect(buttons.eq(2).attr('class')).not.toContain('example-class');
        expect(buttons.eq(2).attr('class')).toContain('other-class');
      });
    });
    itp('displays styled buttons for supported types', function() {
      const idpTypes = [
        'FACEBOOK',
        'GOOGLE',
        'LINKEDIN',
        'MICROSOFT',
        'APPLE',
        'GITHUB',
        'GITLAB',
        'YAHOO',
        'LINE',
        'PAYPAL',
        'PAYPAL_SANDBOX',
        'SALESFORCE',
        'AMAZON',
        'YAHOOJP',
        'DISCORD',
        'ADOBE',
        'ORCID',
        'SPOTIFY',
        'XERO',
        'QUICKBOOKS',
      ];
      const settings = {
        idps: idpTypes.map(t => ({ type: t, id: '0oaDUMMY' }))
      };

      return setup(settings).then(function(test) {
        const buttons = test.form.socialAuthButtons();
        expect(buttons.length).toBe(idpTypes.length);
        for (const [i, type] of idpTypes.entries()) {
          expect(buttons.eq(i).attr('class')).toContain(`social-auth-${type.toLowerCase()}-button`);
        }
      });
    });
    itp('displays generic idp buttons for unknown types', function() {
      const settings = {
        idps: [
          {
            type: 'Tweeter',
            id: '0oaidiw9udOSceD1111',
          },
        ],
      };

      return setup(settings).then(function(test) {
        const buttons = test.form.socialAuthButtons();

        expect(buttons.length).toBe(1);
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-tweeter-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-linkedin-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-facebook-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-google-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-apple-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-microsoft-button');
        expect(buttons.eq(0).attr('class')).toContain('social-auth-general-idp-button');
      });
    });
    itp('type is optional for generic idp buttons', function() {
      const settings = {
        idps: [
          {
            id: '0oaidiw9udOSceD1111',
          },
        ],
      };

      return setup(settings).then(function(test) {
        const buttons = test.form.socialAuthButtons();

        expect(buttons.length).toBe(1);
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-linkedin-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-facebook-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-google-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-apple-button');
        expect(buttons.eq(0).attr('class')).not.toContain('social-auth-microsoft-button');
        expect(buttons.eq(0).attr('class')).toContain('social-auth-general-idp-button');
      });
    });
    itp('sets the text for generic idp buttons', function() {
      const settings = {
        idps: [
          {
            id: '0oaidiw9udOSceD1111',
            text: 'Not default text',
          },
        ],
      };

      return setup(settings).then(function(test) {
        const buttons = test.form.socialAuthButtons();

        expect(buttons.eq(0).text()).toEqual('Not default text');
      });
    });
    itp('gives default text if no text provided for generic idp buttons', function() {
      const settings = {
        idps: [
          {
            id: '0oaidiw9udOSceD1111',
          },
        ],
      };

      return setup(settings).then(function(test) {
        const buttons = test.form.socialAuthButtons();

        expect(buttons.eq(0).text()).toEqual('{ Please provide a text value }');
      });
    });
    itp('shows the buttons below the primary auth form by default', function() {
      const settings = {
        idps: [
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234',
          },
          {
            type: 'LINKEDIN',
            id: '0oaidiw9udOSceD1111',
          },
          {
            type: 'GOOGLE',
            id: '0oaidiw9udOSceD5678',
          },
          {
            type: 'APPLE',
            id: '0oaz2emOZGUKjuZwX0g3',
          },
          {
            type: 'MICROSOFT',
            id: '0oaidiw9udOSceD3333',
          },
        ],
      };

      return setup(settings).then(function(test) {
        expect(test.form.primaryAuthForm().index()).toBe(0);
        expect(test.form.primaryAuthContainer().index()).toBe(1);
        expect(test.form.socialAuthButtons().length).toBe(5);
        expect(test.form.facebookButton().length).toBe(1);
        expect(test.form.googleButton().length).toBe(1);
        expect(test.form.appleButton().length).toBe(1);
        expect(test.form.linkedInButton().length).toBe(1);
        expect(test.form.microsoftButton().length).toBe(1);
      });
    });
    itp('shows the buttons above the primary auth form when "idpDisplay" is passed as "PRIMARY"', function() {
      const settings = {
        idpDisplay: 'PRIMARY',
        idps: [
          {
            type: 'LINKEDIN',
            id: '0oaidiw9udOSceD1234',
          },
          {
            type: 'GOOGLE',
            id: '0oaidiw9udOSceD5678',
          },
          {
            type: 'APPLE',
            id: '0oaz2emOZGUKjuZwX0g3',
          },
        ],
      };

      return setup(settings).then(function(test) {
        expect(test.form.primaryAuthContainer().index()).toBe(0);
        expect(test.form.primaryAuthForm().index()).toBe(1);
        expect(test.form.socialAuthButtons().length).toBe(3);
        expect(test.form.linkedInButton().length).toBe(1);
        expect(test.form.googleButton().length).toBe(1);
        expect(test.form.appleButton().length).toBe(1);
      });
    });
    itp('shows the buttons below the primary auth form when "idpDisplay" is passed as "SECONDARY"', function() {
      const settings = {
        idpDisplay: 'SECONDARY',
        idps: [
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234',
          },
          {
            type: 'GOOGLE',
            id: '0oaidiw9udOSceD5678',
          },
          {
            type: 'APPLE',
            id: '0oaz2emOZGUKjuZwX0g3',
          },
        ],
      };

      return setup(settings).then(function(test) {
        expect(test.form.primaryAuthForm().index()).toBe(0);
        expect(test.form.primaryAuthContainer().index()).toBe(1);
        expect(test.form.socialAuthButtons().length).toBe(3);
        expect(test.form.facebookButton().length).toBe(1);
        expect(test.form.googleButton().length).toBe(1);
        expect(test.form.appleButton().length).toBe(1);
      });
    });
    itp('opens a popup with the correct url when an idp button is clicked', function() {
      return setupSocial()
        .then(function(test) {
          test.form.facebookButton().click();
          return Promise.all([test, Expect.waitForSpyCall(test.oidcWindow.location.assign)]);
        })
        .then(function([test]) {
          expect(window.open.calls.count()).toBe(1);
          expect(window.open).toHaveBeenCalledWith(
            '/',
            'External Identity Provider User Authentication',
            'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
          );
          const expectedRedirectUri = 'https://foo.com/oauth2/v1/authorize?' +
          'client_id=someClientId&' +
          'display=popup&' +
          'idp=0oaidiw9udOSceD1234&' +
          'nonce=' +
          OIDC_NONCE +
          '&' +
          'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
          'response_mode=okta_post_message&' +
          'response_type=id_token&' +
          'state=' +
          OIDC_STATE +
          '&' +
          'scope=openid%20email%20profile';
          expect(test.oidcWindow.location.assign).toHaveBeenCalledWith(expectedRedirectUri);
        });
    });
    itp('navigate to "/sso/idp/:id" at none OIDC mode when an idp button is clicked', function() {
      spyOn(SharedUtil, 'redirect');
      const opt = {
        relayState: '/oauth2/v1/authorize/redirect?okta_key=FTAUUQK8XbZi0h2MyEDnBFTLnTFpQGqfNjVnirCXE0U',
      };

      return setupSocialNoneOIDCMode(opt).then(function(test) {
        test.form.facebookButton().click();
        expect(SharedUtil.redirect.calls.count()).toBe(1);
        expect(SharedUtil.redirect).toHaveBeenCalledWith(
          'https://foo.com/sso/idps/0oaidiw9udOSceD1234?' +
            $.param({ fromURI: '/oauth2/v1/authorize/redirect?okta_key=FTAUUQK8XbZi0h2MyEDnBFTLnTFpQGqfNjVnirCXE0U' })
        );
      });
    });
    itp('opens a popup with the correct url when an idp button is clicked and asking for an accessToken', function() {
      return setupSocial({ 'authParams.responseType': 'token' })
        .then(function(test) {
          test.form.facebookButton().click();
          return Promise.all([test, Expect.waitForSpyCall(test.oidcWindow.location.assign)]);
        })
        .then(function([test]) {
          const expectedRedirectUri = 'https://foo.com/oauth2/v1/authorize?' +
          'client_id=someClientId&' +
          'display=popup&' +
          'idp=0oaidiw9udOSceD1234&' +
          'nonce=' +
          OIDC_NONCE +
          '&' +
          'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
          'response_mode=okta_post_message&' +
          'response_type=token&' +
          'state=' +
          OIDC_STATE +
          '&' +
          'scope=openid%20email%20profile';
          expect(window.open.calls.count()).toBe(1);
          expect(window.open).toHaveBeenCalledWith(
            '/',
            'External Identity Provider User Authentication',
            'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
          );
          expect(test.oidcWindow.location.assign).toHaveBeenCalledWith(expectedRedirectUri);
        });
    });
    itp(
      'opens a popup with the correct url when an idp button is clicked and asking for an accessToken and idToken',
      function() {
        return setupSocial({ 'authParams.responseType': ['id_token', 'token'] })
          .then(function(test) {
            test.form.facebookButton().click();
            return Promise.all([test, Expect.waitForSpyCall(window.open)]);
          })
          .then(function([test]) {
            const expectedRedirectUri = 'https://foo.com/oauth2/v1/authorize?' +
            'client_id=someClientId&' +
            'display=popup&' +
            'idp=0oaidiw9udOSceD1234&' +
            'nonce=' +
            OIDC_NONCE +
            '&' +
            'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
            'response_mode=okta_post_message&' +
            'response_type=id_token%20token&' +
            'state=' +
            OIDC_STATE +
            '&' +
            'scope=openid%20email%20profile';
            expect(window.open.calls.count()).toBe(1);
            expect(window.open).toHaveBeenCalledWith(
              '/',
              'External Identity Provider User Authentication',
              'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
            );
            expect(test.oidcWindow.location.assign).toHaveBeenCalledWith(expectedRedirectUri);
          });
      }
    );
    itp(
      'calls the global success function with the idToken and user data when the popup sends a message with idToken',
      function() {
        Util.loadWellKnownAndKeysCache();
        spyOn(window, 'addEventListener');

        // In this test the id token will be returned succesfully. It must pass all validation.
        // Mock the date to 10 seconds after token was issued.
        jasmine.clock().mockDate(new Date(AUTH_TIME + 10000));
        return setupSocial()
          .then(function(test) {
            test.form.facebookButton().click();
            return Expect.waitForWindowListener('message', test);
          })
          .then(function(test) {
            jasmine.clock().mockDate(new Date(AUTH_TIME + 10000));
            const args = window.addEventListener.calls.mostRecent().args;
            const callback = args[1];
            callback.call(null, {
              origin: 'https://foo.com',
              data: {
                id_token: VALID_ID_TOKEN,
                state: OIDC_STATE,
              },
            });
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function(test) {
            expect(test.successSpy.calls.count()).toBe(1);
            const data = test.successSpy.calls.argsFor(0)[0];

            expect(data.status).toBe('SUCCESS');
            expect(data.tokens.idToken.idToken).toBe(VALID_ID_TOKEN);
            expect(data.tokens.idToken.claims).toEqual({
              amr: ['pwd'],
              aud: 'someClientId',
              auth_time: 1451606400,
              email: 'samljackson@gack.me',
              email_verified: true,
              exp: 1609459200,
              family_name: 'Jackson',
              given_name: 'Saml',
              iat: 1451606400,
              idp: '0oaidiw9udOSceDqw0g3',
              nonce: OIDC_NONCE,
              idp_type: 'FACEBOOK',
              iss: 'https://foo.com',
              login: 'samljackson@gack.me',
              name: 'Saml Jackson',
              profile: 'https://www.facebook.com/app_scoped_user_id/122819658076357/',
              sub: '00uiltNQK2Wszs2RV0g3',
              updated_at: 1451606400,
              ver: 1,
            });
          })
          .finally(function() {
            jasmine.clock().uninstall();
          });
      }
    );
    itp('calls the global success function with the idToken and accessToken', function() {
      Util.loadWellKnownAndKeysCache();
      spyOn(window, 'addEventListener');

      // In this test the id token will be returned succesfully. It must pass all validation.
      // Mock the date to 10 seconds after token was issued.
      jasmine.clock().mockDate(new Date(AUTH_TIME + 10000));
      return setupSocial({ 'authParams.responseType': ['id_token', 'token'] })
        .then(function(test) {
          test.form.facebookButton().click();
          return Expect.waitForWindowListener('message', test);
        })
        .then(function(test) {
          const args = window.addEventListener.calls.mostRecent().args;
          const callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE,
              access_token: VALID_ACCESS_TOKEN,
              expires_in: 3600,
              scope: 'openid email profile',
              token_type: 'Bearer',
            },
          });
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          expect(test.successSpy.calls.count()).toBe(1);
          const data = test.successSpy.calls.argsFor(0)[0];

          expect(data.status).toBe('SUCCESS');
          expect(data.tokens.idToken.idToken).toBe(VALID_ID_TOKEN);

          expect(data.tokens.accessToken.accessToken).toBe(VALID_ACCESS_TOKEN);
          expect(data.tokens.accessToken.scopes).toEqual(['openid', 'email', 'profile']);
          expect(data.tokens.accessToken.tokenType).toBe('Bearer');
        })
        .finally(function() {
          jasmine.clock().uninstall();
        });
    });
    itp('triggers the afterError event if there is no valid id token returned', function() {
      spyOn(window, 'addEventListener');
      return setupSocial()
        .then(function(test) {
          test.form.facebookButton().click();
          return Expect.waitForWindowListener('message', test);
        })
        .then(function(test) {
          const args = window.addEventListener.calls.mostRecent().args;
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
              controller: 'primary-auth',
            },
            {
              name: 'OAUTH_ERROR',
              message: 'Message from server',
            },
          ]);
        });
    });

    // TODO: add test to verify the behavior when missing `state` in the data
    itp('ignores messages with the wrong origin', function() {
      const successSpy = jasmine.createSpy('successSpy');
      const errorSpy = jasmine.createSpy('errorSpy');

      spyOn(window, 'addEventListener');

      return setupSocial({ globalErrorFn: errorSpy, globalSuccessFn: successSpy })
        .then(function(test) {
          test.form.facebookButton().click();
          return Expect.waitForWindowListener('message', test);
        })
        .then(function(test) {
          const args = window.addEventListener.calls.mostRecent().args;
          const callback = args[1];
          callback.call(null, {
            origin: 'https://evil.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE,
            },
          });
          return Expect.waitForSpyCall(test.afterErrorHandler, test);
        })
        .then(function(test) {
          expect(successSpy.calls.count()).toBe(0);
          expect(errorSpy.calls.count()).toBe(0);
          expect(test.afterErrorHandler).toHaveBeenCalledWith(
            {
              controller: 'primary-auth',
            },
            {
              name: 'OAUTH_ERROR',
              message: 'The request does not match client configuration',
            }
          );
        });
    });
    itp('closes the popup after receiving the idToken message', function() {
      const successSpy = jasmine.createSpy('successSpy');

      spyOn(window, 'addEventListener');
      return setupSocial({ globalSuccessFn: successSpy })
        .then(function(test) {
          test.form.facebookButton().click();
          return Expect.waitForWindowListener('message', test);
        })
        .then(function(test) {
          const args = window.addEventListener.calls.mostRecent().args;
          const callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE,
            },
          });
          return Expect.waitForSpyCall(test.oidcWindow.close, test);
        })
        .then(function(test) {
          expect(test.oidcWindow.close).toHaveBeenCalled();
        });
    });

    // Reminder: Think about how to mock this out in the future - currently
    // cannot mock it because we defer to AuthJs to do set window.location.
    // On the plus side, there is an e2e test that covers this.
    // eslint-disable-next-line jasmine/no-disabled-tests
    xit('redirects to the correct url in the social idp redirect flow');
  });
});

Expect.describe('Additional Auth Button', function() {
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
  itp('displays social auth and custom buttons', function() {
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

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(1);
      expect(test.form.additionalAuthButton().length).toBe(1);
      expect(test.form.facebookButton().length).toBe(1);
    });
  });
  itp('does not display custom buttons when it is undefined', function() {
    const settings = {
      customButtons: undefined,
      idps: [
        {
          type: 'FACEBOOK',
          id: '0oaidiw9udOSceD1234',
        },
      ],
    };

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(1);
      expect(test.form.additionalAuthButton().length).toBe(0);
      expect(test.form.facebookButton().length).toBe(1);
    });
  });
  itp('does not display social auth when it is undefined', function() {
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
      idps: undefined,
    };

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(1);
      expect(test.form.additionalAuthButton().length).toBe(1);
      expect(test.form.facebookButton().length).toBe(0);
    });
  });
  itp('does not display any additional buttons when social auth and customButtons are undefined', function() {
    const settings = {
      customButtons: undefined,
      idps: undefined,
    };

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(0);
      expect(test.form.additionalAuthButton().length).toBe(0);
      expect(test.form.facebookButton().length).toBe(0);
    });
  });
});

Expect.describe('PIV Button', function() {
  itp('does not show the divider and buttons if certAuthUrl is not defined', function() {
    return setupPIV(false).then(function(test) {
      expect(test.form.authDivider().length).toBe(0);
      expect(test.form.pivButton().length).toBe(0);
    });
  });
  itp('does not show the divider and buttons if settings.piv is not set', function() {
    return setup().then(function(test) {
      expect(test.form.authDivider().length).toBe(0);
      expect(test.form.pivButton().length).toBe(0);
    });
  });
  itp('show the divider and buttons if settings.piv is not empty', function() {
    return setupPIV(true).then(function(test) {
      expect(test.form.authDivider().length).toBe(1);
      expect(test.form.pivButton().length).toBe(1);
    });
  });
  itp('shows default text if none passed', function() {
    return setupPIV(true, true).then(function(test) {
      expect(test.form.pivButton().text()).toEqual('Sign in with PIV / CAC card');
    });
  });
  itp('sets text with property passed', function() {
    return setupPIV(true).then(function(test) {
      expect(test.form.pivButton().text()).toEqual('piv test text');
    });
  });
  itp('sets class with property passed', function() {
    return setupPIV(true).then(function(test) {
      expect(test.form.pivButton().hasClass('piv-test-class')).toBe(true);
    });
  });
  itp('navigates to piv login flow when button is clicked', function() {
    return setupPIV(true).then(function(test) {
      test.form.pivButton().click();
      expect(test.router.navigate).toHaveBeenCalledWith('signin/verify/piv', { trigger: true });
    });
  });
  itp('displays social auth, piv and custom buttons', function() {
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
      piv: {
        text: 'piv test text',
        className: 'piv-test-class',
        certAuthUrl: 'https://rain.mtls.okta1.com:80/auth/cert/primaryAuth',
      },
    };

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(1);
      expect(test.form.additionalAuthButton().length).toBe(1);
      expect(test.form.facebookButton().length).toBe(1);
      expect(test.form.pivButton().length).toBe(1);
    });
  });
  itp('does not display piv button when certAuthUrl is not defined', function() {
    const settings = {
      idps: [
        {
          type: 'FACEBOOK',
          id: '0oaidiw9udOSceD1234',
        },
      ],
      piv: {
        text: 'piv test text',
        className: 'piv-test-class',
      },
    };

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(1);
      expect(test.form.pivButton().length).toBe(0);
      expect(test.form.facebookButton().length).toBe(1);
    });
  });
  itp('does not display social auth when it is undefined', function() {
    const settings = {
      piv: {
        text: 'piv test text',
        className: 'piv-test-class',
        certAuthUrl: 'https://rain.mtls.okta1.com:80/auth/cert/primaryAuth',
      },
      idps: undefined,
    };

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(1);
      expect(test.form.pivButton().length).toBe(1);
      expect(test.form.facebookButton().length).toBe(0);
    });
  });
  itp('does not display any additional buttons when social auth, piv and customButtons are undefined', function() {
    const settings = {
      piv: undefined,
      customButtons: undefined,
      idps: undefined,
    };

    return setup(settings).then(function(test) {
      expect(test.form.authDivider().length).toBe(0);
      expect(test.form.additionalAuthButton().length).toBe(0);
      expect(test.form.pivButton().length).toBe(0);
      expect(test.form.facebookButton().length).toBe(0);
    });
  });
});

Expect.describe('Registration Flow', function() {
  itp('does not show the registration button if features.registration is not set', function() {
    return setup().then(function(test) {
      expect(test.form.registrationContainer().length).toBe(0);
    });
  });
  itp('does not show the registration button if features.registration is false', function() {
    const registration = {};

    return setupRegistrationButton(null, registration).then(function(test) {
      expect(test.form.registrationContainer().length).toBe(0);
    });
  });
  itp('show the registration button if settings.registration.enable is true', function() {
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
  itp('the registration button is a custom function', function() {
    const registration = {
      click: function() {
        window.location.href = 'http://www.test.com';
      },
    };

    return setupRegistrationButton(true, registration).then(function(test) {
      expect(test.form.registrationContainer().length).toBe(1);
      expect(test.form.registrationLabel().length).toBe(1);
      expect(test.form.registrationLabel().text()).toBe('Don\'t have an account?');
      expect(test.form.registrationLink().length).toBe(1);
      expect(test.form.registrationLink().text()).toBe('Sign up');
      expect(typeof registration.click).toEqual('function');
    });
  });
  itp('calls settings.registration.click if its a function and when the link is clicked', function() {
    const registration = {
      click: jasmine.createSpy('registrationSpy'),
    };

    return setupRegistrationButton(true, registration).then(function(test) {
      test.form.registrationLink().click();
      expect(registration.click).toHaveBeenCalled();
    });
  });
});
