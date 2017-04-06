/* eslint max-params:[2, 28], max-statements:[2, 36], camelcase:0, max-len:[2, 180] */
define([
  'okta/underscore',
  'okta/jquery',
  'vendor/lib/q',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'okta',
  'helpers/mocks/Util',
  'helpers/dom/AuthContainer',
  'helpers/dom/PrimaryAuthForm',
  'helpers/dom/Beacon',
  'LoginRouter',
  'util/BrowserFeatures',
  'util/Errors',
  'util/DeviceFingerprint',
  'shared/util/Util',
  'helpers/util/Expect',
  'helpers/xhr/security_image',
  'helpers/xhr/security_image_fail',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/ACCOUNT_LOCKED_OUT',
  'helpers/xhr/PASSWORD_EXPIRED',
  'helpers/xhr/UNAUTHORIZED_ERROR',
  'helpers/xhr/ERROR_NON_JSON_RESPONSE',
  'helpers/xhr/ERROR_INVALID_TEXT_RESPONSE',
  'helpers/xhr/ERROR_throttle',
  'sandbox'
],
function (_, $, Q, OktaAuth, LoginUtil, Okta, Util, AuthContainer, PrimaryAuthForm,
          Beacon, Router, BrowserFeatures, Errors, DeviceFingerprint, SharedUtil, Expect, resSecurityImage,
          resSecurityImageFail, resSuccess, resLockedOut, resPwdExpired, resUnauthorized,
          resNonJson, resInvalidText, resThrottle, $sandbox) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  var BEACON_LOADING_CLS = 'beacon-loading';
  var OIDC_STATE = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';
  var OIDC_NONCE = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';
  var VALID_ID_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXIiOjEsIml' +
                       'zcyI6Imh0dHBzOi8vZm9vLmNvbSIsInN1YiI6IjAwdWlsdE5RSzJ' +
                       'Xc3pzMlJWMGczIiwibG9naW4iOiJzYW1samFja3NvbkBnYWNrLm1' +
                       'lIiwiYXVkIjoic29tZUNsaWVudElkIiwiaWF0IjoxNDUxNjA2NDA' +
                       'wLCJleHAiOjE2MDk0NTkyMDAsImFtciI6WyJwd2QiXSwiaWRwIjo' +
                       'iMG9haWRpdzl1ZE9TY2VEcXcwZzMiLCJub25jZSI6ImdnZ2dnZ2d' +
                       'nZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2d' +
                       'nZ2dnZ2dnZ2dnZ2dnZ2dnZ2ciLCJhdXRoX3RpbWUiOjE0NTE2MDY' +
                       '0MDAsImlkcF90eXBlIjoiRkFDRUJPT0siLCJuYW1lIjoiU2FtbCB' +
                       'KYWNrc29uIiwicHJvZmlsZSI6Imh0dHBzOi8vd3d3LmZhY2Vib29' +
                       'rLmNvbS9hcHBfc2NvcGVkX3VzZXJfaWQvMTIyODE5NjU4MDc2MzU' +
                       '3LyIsImdpdmVuX25hbWUiOiJTYW1sIiwiZmFtaWx5X25hbWUiOiJ' +
                       'KYWNrc29uIiwidXBkYXRlZF9hdCI6MTQ1MTYwNjQwMCwiZW1haWw' +
                       'iOiJzYW1samFja3NvbkBnYWNrLm1lIiwiZW1haWxfdmVyaWZpZWQ' +
                       'iOnRydWV9.Aq_42PVQwGW7WIT02fSaSLF5jvIZjnIy6pJvsXyduR' +
                       'bx6SUbTzKr3R5dsZRskau9Awi91aDv4a1QRWANPmJZabzxScg9LA' +
                       'e4J-RRZxZ0EbQZ6n8l9KVdUb_ndhcKmVAhmhK0GcQbuwk8frcVou' +
                       '6gAQPJowg832umoCss-gEvimU';
  var VALID_ACCESS_TOKEN = 'anythingbecauseitsopaque';

  function setup(settings, requests) {
    settings || (settings = {});

    // To speed up the test suite, calls to debounce are
    // modified to wait 0 ms.
    var debounce = _.debounce;
    spyOn(_, 'debounce').and.callFake(function (fn) {
      return debounce(fn, 0);
    });

    var setNextResponse = Util.mockAjax(requests);
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR, headers: {}});
    var successSpy = jasmine.createSpy('success');

    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    Util.registerRouter(router);
    var authContainer = new AuthContainer($sandbox);
    var form = new PrimaryAuthForm($sandbox);
    var beacon = new Beacon($sandbox);
    router.primaryAuth();
    Util.mockJqueryCss();
    return Expect.waitForPrimaryAuth({
      router: router,
      authContainer: authContainer,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy
    });
  }

  function setupSocial(settings) {
    Util.mockOIDCStateGenerator();
    return setup(_.extend({
      clientId: 'someClientId',
      redirectUri: 'https://0.0.0.0:9999',
      authScheme: 'OAUTH2',
      authParams: {
        responseType: 'id_token',
        display: 'popup',
        scopes: [
          'openid',
          'email',
          'profile'
        ]
      },
      idps: [
        {
          type: 'FACEBOOK',
          id: '0oaidiw9udOSceD1234'
        }
      ]
    }, settings))
    .then(function (test) {
      spyOn(window, 'open').and.callFake(function () {
        test.oidcWindow = {closed: false, close: jasmine.createSpy()};
        return test.oidcWindow;
      });
      return tick(test);
    });
  }

  function setupAdditionalAuthButton() {
    var settings = {
      customButtons: [
        {
          title: 'test text',
          className: 'test-class',
          click: function (e) {
            $(e.target).addClass('new-class');
          },
          dataAttr: 'test-data'
        }
      ]
    };
    return setup(settings);
  }

  function waitForBeaconChange(test) {
    return tick() //wait to read value of user input
    .then(tick)   //wait to receive ajax response
    .then(tick)   //wait for animation (TODO: verify if needed)
    .then(function () { return test; });
  }

  function transformUsername(name) {
    var suffix = '@example.com';
    return (name.indexOf(suffix) !== -1) ? name : (name + suffix);
  }

  function transformUsernameOnUnlock(name, operation) {
    if (operation === 'UNLOCK_ACCOUNT') {
      transformUsername(name);
    }
    return name;
  }

  var setupWithTransformUsername = _.partial(setup, {username: 'foobar', transformUsername: transformUsername});
  var setupWithTransformUsernameOnUnlock = _.partial(setup, {transformUsername: transformUsernameOnUnlock});

  Expect.describe('PrimaryAuth', function () {

    Expect.describe('settings', function () {
      itp('uses default title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toEqual('Sign In');
        });
      });
      itp('uses default for username placeholder', function () {
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          expect($username.attr('placeholder')).toEqual('Username');
        });
      });
      itp('prevents autocomplete on username', function () {
        return setup().then(function (test) {
          expect(test.form.getUsernameFieldAutocomplete()).toBe('off');
        });
      });
      itp('prevents autocomplete on password', function () {
        return setup().then(function (test) {
          expect(test.form.getPasswordFieldAutocomplete()).toBe('off');
        });
      });
      itp('uses default for password placeholder', function () {
        return setup().then(function (test) {
          var $password = test.form.passwordField();
          expect($password.attr('placeholder')).toEqual('Password');
        });
      });
      itp('uses default for rememberMe', function () {
        return setup({ 'features.rememberMe': true }).then(function (test) {
          var label = test.form.rememberMeLabelText();
          expect(label).toEqual('Remember me');
        });
      });
      itp('uses default for unlock account', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          var label = test.form.unlockLabel();
          expect(label.trim()).toBe('Unlock account?');
        });
      });
      itp('overrides rememberMe from settings', function () {
        var options = { 'features.rememberMe': true };
        return setup(options).then(function (test) {
          var label = test.form.rememberMeLabelText();
          expect(label).toEqual('Remember me');
        });
      });
      itp('uses default for username tooltip', function () {
        return setup().then(function (test) {
          var tip = test.form.usernameTooltipText();
          expect(tip).toEqual('Username');
        });
      });
      itp('uses default for password tooltip', function () {
        return setup().then(function (test) {
          var tip = test.form.passwordTooltipText();
          expect(tip).toEqual('Password');
        });
      });
      itp('focuses on username field in browsers other than IE', function () {
        spyOn(BrowserFeatures, 'isIE').and.returnValue(false);
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          // Focused element would be username DOM element
          expect($username[0]).toBe(document.activeElement);
        });
      });
      itp('does not focus on username field in IE', function () {
        spyOn(BrowserFeatures, 'isIE').and.returnValue(true);
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          // Focused element would be body element
          expect($username[0]).not.toBe(document.activeElement);
        });
      });
    });

    Expect.describe('customizing the tooltip', function () {
      itp('if the placeholder and tooltip differ,' +
       'display both in the tooltip', function () {
        spyOn(Okta, 'loc').and.callFake(function (key) {
          // remove the common part: 'primaryauth.username.'
          return key.slice(21);
        });
        return setup().then(function (test) {
          var tip = test.form.usernameTooltipText();
          expect(tip).toMatch('placeholder');
          expect(tip).toMatch('tooltip');
        });
      });
      itp('if the placeholder and tooltip equal,' +
       'display only one of them', function () {
        spyOn(Okta, 'loc').and.callFake(function () {
          return 'same text';
        });
        return setup().then(function (test) {
          var tip = test.form.usernameTooltipText();
          expect(tip).toEqual('same text');
        });
      });
      itp('if the placeholder is not defined,' +
       'display only the tooltip', function () {
        spyOn(Okta, 'loc').and.callFake(function (key) {
          if (key === 'primaryauth.username.placeholder') {
            return null;
          } else {
            return 'tooltip';
          }
        });
        return setup().then(function (test) {
          var tip = test.form.usernameTooltipText();
          expect(tip).toEqual('tooltip');
        });
      });
    });

    Expect.describe('elements', function () {
      itp('has a security beacon if features.securityImage is true', function () {
        return setup({ features: { securityImage: true }}, [resSecurityImage]).then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('beacon could be minimized if it is a security beacon', function () {
        return setup({ features: { securityImage: true }}, [resSecurityImage]).then(function (test) {
          expect(test.authContainer.canBeMinimized()).toBe(true);
        });
      });
      itp('does not show a beacon if features.securityImage is false', function () {
        return setup().then(function (test) {
          expect(test.beacon.beacon().length).toBe(0);
        });
      });
      itp('has a username field', function () {
        return setup().then(function (test) {
          var username = test.form.usernameField();
          expect(username.length).toBe(1);
          expect(username.attr('type')).toEqual('text');
        });
      });
      itp('has a password field', function () {
        return setup().then(function (test) {
          var password = test.form.passwordField();
          expect(password.length).toBe(1);
          expect(password.attr('type')).toEqual('password');
        });
      });
      itp('has a rememberMe checkbox if features.rememberMe is true', function () {
        return setup().then(function (test) {
          var cb = test.form.rememberMeCheckbox();
          expect(cb.length).toBe(1);
        });
      });
      itp('does not have a rememberMe checkbox if features.rememberMe is false', function () {
        return setup({ 'features.rememberMe': false }).then(function (test) {
          var cb = test.form.rememberMeCheckbox();
          expect(cb.length).toBe(0);
        });
      });
      itp('has "Need help?" link', function () {
        return setup().then(function (test) {
          expect(test.form.helpFooterLabel().trim()).toBe('Need help signing in?');
        });
      });
      itp('has a help link', function () {
        return setup().then(function (test) {
          expect(test.form.helpLinkLabel().trim()).toBe('Help');
        });
      });
      itp('has the correct help link url', function () {
        return setup().then(function (test) {
          spyOn(SharedUtil, 'redirect');
          expect(test.form.helpLinkHref()).toBe('https://foo.com/help/login');
        });
      });
      itp('has a custom help link url when available', function () {
        return setup({ 'helpLinks.help': 'https://bar.com' }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          expect(test.form.helpLinkHref()).toBe('https://bar.com');
        });
      });
      itp('has a forgot password link', function () {
        return setup().then(function (test) {
          expect(test.form.forgotPasswordLabel().trim()).toBe('Forgot password?');
        });
      });
      itp('forgot password link is not visible on load', function () {
        return setup().then(function (test) {
          expect(test.form.forgotPasswordLinkVisible()).toBe(false);
        });
      });
      itp('shows forgot password link when clicking help', function () {
        return setup().then(function (test) {
          test.form.helpFooter().click();
          expect(test.form.forgotPasswordLinkVisible()).toBe(true);
        });
      });
      itp('does not show forgot password link when disabled and clicked', function () {
        return setup().then(function (test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          expect(test.form.forgotPasswordLinkVisible()).not.toBe(true);
        });
      });
      itp('navigates to forgot password page when click forgot password link', function () {
        return setup().then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/forgot-password', {trigger: true});
        });
      });
      itp('does not navigate to forgot password page when link disabled and clicked', function () {
        return setup().then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(test.router.navigate).not.toHaveBeenCalledWith('signin/forgot-password', {trigger: true});
        });
      });
      itp('navigates to custom forgot password page when available', function () {
        return setup({ 'helpLinks.forgotPassword': 'https://foo.com' }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('does not navigate to custom forgot password page when link disabled and clicked', function () {
        return setup({ 'helpLinks.forgotPassword': 'https://foo.com' }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(SharedUtil.redirect).not.toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('unlock link is hidden on load', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          expect(test.form.unlockLinkVisible()).toBe(false);
        });
      });
      itp('shows unlock link when clicking help', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          test.form.helpFooter().click();
          expect(test.form.unlockLinkVisible()).toBe(true);
        });
      });
      itp('navigates to unlock page when click unlock link', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', {trigger: true});
        });
      });
      itp('does not navigate to unlock page when link disabled and clicked', function () {
        return setup().then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).not.toHaveBeenCalledWith('signin/unlock', {trigger: true});
        });
      });
      itp('navigates to custom unlock page when available', function () {
        return setup({
          'helpLinks.unlock': 'https://foo.com',
          'features.selfServiceUnlock': true
        }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('does not navigate to custom unlock page when link disabled and clicked', function () {
        return setup({
          'helpLinks.unlock': 'https://foo.com',
          'features.selfServiceUnlock': true
        }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(SharedUtil.redirect).not.toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('does not show unlock link if feature is off', function () {
        return setup().then(function (test) {
          expect(test.form.unlockLink().length).toBe(0);
        });
      });
      itp('does not show custom links if they do not exist', function () {
        return setup().then(function (test) {
          expect(test.form.customLinks().length).toBe(0);
        });
      });
      itp('shows custom links if they exist', function () {
        var customLinks = [
          { text: 'github', href: 'https://github.com' },
          { text: 'google', href: 'https://google.com' }
        ];
        return setup({ 'helpLinks.custom': customLinks }).then(function (test) {
          var links = test.form.customLinks();
          expect(links).toEqual(customLinks);
        });
      });
      itp('toggles "focused-input" css class on focus in and focus out', function () {
        return setup().then(function (test) {
          test.form.usernameField().focus();
          expect(test.form.usernameField()[0].parentElement).toHaveClass('focused-input');
          test.form.passwordField().focus();
          expect(test.form.usernameField()[0].parentElement).not.toHaveClass('focused-input');
        });
      });
    });

    Expect.describe('transform username', function () {
      itp('calls the transformUsername function with the right parameters', function () {
        return setupWithTransformUsername().then(function (test) {
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
      itp('does not call transformUsername while loading security image', function () {
        return setup({ features: { securityImage: true }, transformUsername: transformUsername })
        .then(function (test) {
          spyOn(test.router.settings, 'transformUsername');
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.router.settings.transformUsername.calls.count()).toBe(0);
          expect($.ajax.calls.count()).toBe(1);
          expect($.ajax.calls.argsFor(0)[0]).toEqual({
            url: 'https://foo.com/login/getimage?username=testuser',
            type: 'get',
            dataType: undefined,
            data: undefined,
            success: undefined
          });
        });
      });
      itp('adds the suffix to the username if the username does not have it', function () {
        return setupWithTransformUsername().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser@example.com',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false
              }
            }
          });
        });
      });
      itp('adds the suffix to the inital username if it is provided', function () {
        return setupWithTransformUsername().then(function (test) {
          $.ajax.calls.reset();
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'foobar@example.com',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false
              }
            }
          });
        });
      });
      itp('does not add the suffix to the username if the username already has it', function () {
        return setupWithTransformUsername().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser@example.com');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser@example.com',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false
              }
            }
          });
        });
      });
      itp('does not add the suffix to the username if "PRIMARY_AUTH" operation is not handled', function () {
        return setupWithTransformUsernameOnUnlock().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false
              }
            }
          });
        });
      });
    });

    Expect.describe('Device Fingerprint', function () {
      itp('does not contain device fingerprint header in primaryAuth if feature is enabled', function () {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint');
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
          var ajaxArgs = $.ajax.calls.argsFor(0);
          expect(ajaxArgs[0].headers['X-Device-Fingerprint']).toBeUndefined();
        });
      });
      itp('contains device fingerprint header in primaryAuth if feature is enabled', function () {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function () {
          var deferred = Q.defer();
          deferred.resolve('thisIsTheDeviceFingerprint');
          return deferred.promise;
        });
        return setup({ features: { deviceFingerprinting: true }})
        .then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
          var ajaxArgs = $.ajax.calls.argsFor(0);
          expect(ajaxArgs[0].headers['X-Device-Fingerprint']).not.toBeUndefined();
        });
      });
      itp('continues with primary auth if there is an error getting fingerprint when feature is enabled', function () {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function () {
          var deferred = Q.defer();
          deferred.reject('there was an error');
          return deferred.promise;
        });
        return setup({ features: { deviceFingerprinting: true }})
        .then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
          var ajaxArgs = $.ajax.calls.argsFor(0);
          expect(ajaxArgs[0].headers['X-Device-Fingerprint']).toBeUndefined();
          Expect.isJsonPost(ajaxArgs, {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false
              }
            }
          });
        });
      });
    });

    Expect.describe('events', function () {

      Expect.describe('beacon loading', function () {
        itp('shows beacon-loading animation when primaryAuth is submitted', function () {
          return setup({ features: { securityImage: true }})
          .then(function (test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function (test) {
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextResponse(resSuccess);
            test.form.setPassword('pass');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            var spyCalls = test.securityBeacon.toggleClass.calls;
            expect(spyCalls.count()).toBe(2);
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
        });
        itp('does not show beacon-loading animation when primaryAuth fails', function () {
          return setup({ features: { securityImage: true }})
          .then(function (test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextResponse(resUnauthorized);
            test.form.setPassword('pass');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            var spyCalls = test.securityBeacon.toggleClass.calls;
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
        });
        itp('does not show beacon-loading animation when password expires', function () {
          return setup({ features: { securityImage: true }})
          .then(function (test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextResponse(resPwdExpired);
            test.form.setPassword('pass');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            var spyCalls = test.securityBeacon.toggleClass.calls;
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
        });
        itp('does not show beacon-loading animation on CORS error', function () {
          return setup({ features: { securityImage: true }})
          .then(function (test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser');
            return waitForBeaconChange(test);
          })
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            spyOn(test.router.settings, 'callGlobalError');
            test.setNextResponse({status: 0, response: {}});
            test.form.setPassword('pass');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            var spyCalls = test.securityBeacon.toggleClass.calls;
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
        });
        itp('shows beacon-loading animation when primaryAuth is submitted (no security image)', function () {
          return setup().then(function (test) {
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
        itp('does not show beacon-loading animation when primaryAuth fails (no security image)', function () {
          return setup().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resUnauthorized);
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
        });
        itp('does not show beacon-loading animation when password expires (no security image)', function () {
          return setup().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resPwdExpired);
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
        });
        itp('does not show beacon-loading animation on CORS error (no security image)', function () {
          return setup().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse({status: 0, response: {}});
            test.form.setUsername('testuser');
            test.form.setPassword('pass');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
        });
      });
      itp('does not make securityImage requests if features.securityImage is false', function () {
        return setup()
        .then(function (test) {
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(0);
        });
      });
      itp('has default security image on page load and no rememberMe', function () {
        return setup({ features: { securityImage: true }})
        .then(waitForBeaconChange)
        .then(function (test) {
          expect(test.form.securityBeacon()[0].className).toMatch('undefined-user');
          expect(test.form.securityBeacon()[0].className).not.toMatch('new-device');
          expect(test.form.securityBeacon().css('background-image')).toBe('none');
        });
      });
      itp('updates security beacon when user enters correct username', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(1);
          expect($.ajax.calls.argsFor(0)[0]).toEqual({
            url: 'https://foo.com/login/getimage?username=testuser',
            type: 'get',
            dataType: undefined,
            data: undefined,
            success: undefined
          });
          expect($.fn.css).toHaveBeenCalledWith('background-image', 'url(../../../test/unit/assets/1x1.gif)');
          expect(test.form.accessibilityText()).toBe('a single pixel');
        });
      });
      itp('waits for username field to lose focus before fetching the security image', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImage);
          test.form.editingUsername('te');
          test.form.editingUsername('testu');
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
        });
      });
      itp('updates security beacon to show the new user image when user enters unfamiliar username', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.form.securityBeacon()[0].className).toMatch('new-user');
          expect(test.form.securityBeacon()[0].className).not.toMatch('undefined-user');
          expect(test.form.securityBeacon().css('background-image')).toBe('none');
        });
      });
      itp('shows an unknown user message when user enters unfamiliar username', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.form.securityImageTooltipText()).toEqual('This is the first time you are connecting to foo.com from this browser×');
        });
      });
      itp('guards against XSS when showing the anti-phishing message', function () {
        return setup({
          baseUrl: 'http://foo<i>xss</i>bar.com?bar=<i>xss</i>',
          features: { securityImage: true }
        })
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.form.securityImageTooltipText()).toEqual('This is the first time you are connecting to foo<i>xss< from this browser×');
        });
      });
      itp('removes anti-phishing message if help link is clicked', function () {
        return setup({
          baseUrl: 'http://foo<i>xss</i>bar.com?bar=<i>xss</i>',
          features: { securityImage: true, selfServiceUnlock: true }
        })
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          // Tooltip exists
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(false);
          spyOn(test.router, 'navigate');
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', {trigger: true});
          // Verify tooltip is gone
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(true);
        });
      });
      itp('updates security beacon immediately if rememberMe is available', function () {
        Util.mockCookie('ln', 'testuser');
        var options = {
          features: {
            rememberMe: true,
            securityImage: true
          }
        };
        return setup(options, [resSecurityImage])
        .then(waitForBeaconChange)
        .then(function (test) {
          expect($.fn.css).toHaveBeenCalledWith('background-image', 'url(../../../test/unit/assets/1x1.gif)');
          expect(test.form.accessibilityText()).toBe('a single pixel');
        });
      });
      itp('calls globalErrorFn if cors is not enabled and security image request is made', function () {
        spyOn(BrowserFeatures, 'corsIsNotEnabled').and.returnValue(true);
        return setup({
          features: { securityImage: true }
        })
        .then(function (test) {
          test.setNextResponse({
            responseType: 'json',
            response: '',
            status: 0
          });
          spyOn(test.router.settings, 'callGlobalError');
          test.form.setUsername('testuser');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          var err = test.router.settings.callGlobalError.calls.mostRecent().args[0];
          expect(err instanceof Errors.UnsupportedBrowserError).toBe(true);
          expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
          expect(err.message).toEqual('There was an error sending the request - have you enabled CORS?');
        });
      });
      itp('has username in field if rememberMe is available', function () {
        Util.mockCookie('ln', 'testuser');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          expect(test.form.usernameField().val()).toBe('testuser');
        });
      });
      itp('has rememberMe checked if rememberMe is available', function () {
        Util.mockCookie('ln', 'testuser');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
        });
      });
      itp('unchecks rememberMe if username is changed', function () {
        Util.mockCookie('ln', 'testuser');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
          test.form.setUsername('new-user');
          expect(test.form.rememberMeCheckboxStatus()).toBe('unchecked');
        });
      });
      itp('does not re-render rememberMe checkbox on changes', function () {
        Util.mockCookie('ln', 'testuser');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          var orig = test.form.rememberMeCheckbox().get(0);
          test.form.setUsername('new-user');
          expect(test.form.rememberMeCheckbox().get(0)).toBe(orig);
        });
      });
      itp('populate username if username is available', function () {
        var options = {
          'username': 'testuser@ABC.com'
        };
        return setup(options).then(function (test) {
          expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
        });
      });
      itp('unchecks rememberMe if username is populated and lastUsername is different from username', function () {
        Util.mockCookie('ln', 'testuser');
        var options = {
          'features.rememberMe': true,
          'username': 'testuser@ABC.com'
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('unchecked');
          expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
        });
      });
      itp('checks rememberMe if username is populated and lastUsername is same as username', function () {
        Util.mockCookie('ln', 'testuser@ABC.com');
        var options = {
          'features.rememberMe': true,
          'username': 'testuser@ABC.com'
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
          expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
        });
      });
      itp('shows an error if username is empty and submitted', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.submit();
          expect(test.form.usernameErrorField().length).toBe(1);
          var button = test.form.submitButton();
          var buttonClass = button.attr('class');
          expect(buttonClass).not.toContain('link-button-disabled');
          expect(test.form.isDisabled()).toBe(false);
          expect($.ajax).not.toHaveBeenCalled();
        });
      });
      itp('shows an error if password is empty and submitted', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.submit();
          expect(test.form.passwordErrorField().length).toBe(1);
          var button = test.form.submitButton();
          var buttonClass = button.attr('class');
          expect(buttonClass).not.toContain('link-button-disabled');
          expect(test.form.isDisabled()).toBe(false);
          expect($.ajax).not.toHaveBeenCalled();
        });
      });
      itp('reenables button and fields after a CORS error', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse({status: 0, response: {}});
          test.form.submit();
          return tick(test);
        })
        .then(function (test) {
          var button = test.form.submitButton();
          var buttonClass = button.attr('class');
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
      //     $.ajax.calls.reset();
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
      itp('calls authClient primaryAuth with form values when submitted', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          expect(test.form.isDisabled()).toBe(true);
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false
              }
            }
          });
        });
      });
      itp('calls processCreds function before saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCreds');
        return setup({
          processCreds: processCredsSpy
        })
        .then(function (test) {
          $.ajax.calls.reset();
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
            password: 'pass'
          });
          expect($.ajax.calls.count()).toBe(1);
        });
      });
      itp('calls async processCreds function before saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCreds');
        return setup({
          'processCreds': function(creds, callback) {
            processCredsSpy(creds, callback);
            callback();
          }
        })
        .then(function (test) {
          $.ajax.calls.reset();
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
            password: 'pass'
          }, jasmine.any(Function));
          expect($.ajax.calls.count()).toBe(1);
        });
      });
      itp('calls async processCreds function and can prevent saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCreds');
        return setup({
          'processCreds': function(creds, callback) {
            processCredsSpy(creds, callback);
          }
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function() {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'testuser',
            password: 'pass'
          }, jasmine.any(Function));
          expect($.ajax.calls.count()).toBe(0);
        });
      });
      itp('calls authClient with multiOptionalFactorEnroll=true if feature is true', function () {
        return setup({'features.multiOptionalFactorEnroll': true}).then(function (test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          expect(test.form.isDisabled()).toBe(true);
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser',
              password: 'pass',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: true
              }
            }
          });
        });
      });
      itp('sets rememberMe cookie if rememberMe is enabled and checked on submit', function () {
        var cookieSpy = Util.mockCookie();
        return setup({ 'features.rememberMe': true })
        .then(function (test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.form.setRememberMe(true);
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect(cookieSpy).toHaveBeenCalledWith('ln', 'testuser', {
            expires: 365,
            path: '/'
          });
        });
      });
      itp('removes rememberMe cookie if called with existing username and unchecked', function () {
        Util.mockCookie('ln', 'testuser');
        var removeCookieSpy = Util.mockRemoveCookie();
        return setup({ 'features.rememberMe': true }).then(function (test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.form.setRememberMe(false);
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
      });
      itp('removes rememberMe cookie if Authentication failed (401)', function () {
        var removeCookieSpy = Util.mockRemoveCookie();
        return setup()
        .then(function (test) {
          test.form.setUsername('invalidUser');
          test.form.setPassword('anyPwd');
          test.form.setRememberMe(true);
          test.setNextResponse(resUnauthorized);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
      });
      itp('shows an error if authClient returns with an error', function () {
        return setup()
        .then(function (test) {
          test.setNextResponse(resUnauthorized);
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Sign in failed!');
        });
      });
      itp('shows the right throttle error message', function () {
        return setup()
        .then(function (test) {
          test.setNextResponse(resThrottle);
          test.form.setUsername('testuser');
          test.form.setPassword('testpass');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage())
            .toBe('You exceeded the maximum number of requests. Try again in a while.');
        });
      });
      itp('shows an error if authClient returns with an error that is plain text', function () {
        return setup()
        .then(function (test) {
          test.setNextResponse(resNonJson, true);
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Sign in failed!');
        });
      });
      itp('shows an error if authClient returns with an error that is plain text and not a valid json', function () {
        return setup()
        .then(function (test) {
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.setNextResponse(resInvalidText, true);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('There was an unexpected internal error. Please try again.');
        });
      });
      itp('shows an error if authClient returns with LOCKED_OUT response and selfServiceUnlock is off', function () {
        return setup()
        .then(function (test) {
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resLockedOut);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage())
            .toBe('Your account is locked. Please contact your administrator.');
        });
      });
      itp('redirects to "unlock" if authClient returns with LOCKED_OUT response and selfServiceUnlock is on', function () {
        return setup({'features.selfServiceUnlock': true})
        .then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.setUsername('testuser');
          test.form.setPassword('pass');
          test.setNextResponse(resLockedOut);
          test.form.submit();
          return tick(test);
        })
        .then(function (test) {
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', {trigger: true});
        });
      });
      itp('calls globalErrorFn if authClient returns with a cors enabled error', function () {
        return setup()
        .then(function (test) {
          spyOn(test.router.settings, 'callGlobalError');
          test.setNextResponse({
            responseType: 'json',
            response: '',
            status: 0
          });
          test.form.setUsername('testuser');
          test.form.setPassword('invalidpass');
          test.form.submit();
          return tick(test);
        })
        .then(function (test) {
          var err = test.router.settings.callGlobalError.calls.mostRecent().args[0];
          expect(err instanceof Errors.UnsupportedBrowserError).toBe(true);
          expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
          expect(err.message).toEqual('There was an error sending the request - have you enabled CORS?');
        });
      });
    });

    Expect.describe('Social Auth', function () {
      itp('does not show the divider or buttons if no idps are passed in', function () {
        return setup().then(function (test) {
          expect(test.form.hasSocialAuthDivider()).toBe(false);
          expect(test.form.socialAuthButtons().length).toBe(0);
        });
      });
      itp('shows a divider and a button for each idp that is passed in', function () {
        var settings = {
          idps: [
            {
              type: 'FACEBOOK',
              id: '0oaidiw9udOSceD1234'
            },
            {
              type: 'GOOGLE',
              id: '0oaidiw9udOSceD5678'
            }
          ]
        };
        return setup(settings).then(function (test) {
          expect(test.form.hasSocialAuthDivider()).toBe(true);
          expect(test.form.socialAuthButtons().length).toBe(2);
          expect(test.form.facebookButton().length).toBe(1);
          expect(test.form.googleButton().length).toBe(1);
        });
      });
      itp('does not show idps that are not supported', function () {
        var settings = {
          idps: [
            {
              type: 'FACEBOOK',
              id: '0oaidiw9udOSceD1234'
            },
            {
              type: 'GOOGLE',
              id: '0oaidiw9udOSceD5678'
            },
            {
              type: 'LINKEDIN',
              id: '0oaidiw9udOSceD1111'
            },
            {
              type: 'MICROSOFT',
              id: '0oaidiw9udOSceD3333'
            },
            {
              type: 'TWEETER',
              id: '0oaidiw9udOSceD2222'
            }
          ]
        };
        return setup(settings).then(function (test) {
          expect(test.form.hasSocialAuthDivider()).toBe(true);
          expect(test.form.socialAuthButtons().length).toBe(4);
          expect(test.form.facebookButton().length).toBe(1);
          expect(test.form.googleButton().length).toBe(1);
          expect(test.form.microsoftButton().length).toBe(1);
          expect(test.form.linkedInButton().length).toBe(1);
        });
      });
      itp('shows idps in the order specified', function () {
        var settings = {
          idps: [
            {
              type: 'LINKEDIN',
              id: '0oaidiw9udOSceD1111'
            },
            {
              type: 'FACEBOOK',
              id: '0oaidiw9udOSceD1234'
            },
            {
              type: 'GOOGLE',
              id: '0oaidiw9udOSceD5678'
            },
            {
              type: 'MICROSOFT',
              id: '0oaidiw9udOSceD3333'
            }
          ]
        };
        return setup(settings).then(function (test) {
          var buttons = test.form.socialAuthButtons();
          expect(buttons.eq(0).hasClass('social-auth-linkedin-button')).toBe(true);
          expect(buttons.eq(1).hasClass('social-auth-facebook-button')).toBe(true);
          expect(buttons.eq(2).hasClass('social-auth-google-button')).toBe(true);
          expect(buttons.eq(3).hasClass('social-auth-microsoft-button')).toBe(true);
        });
      });
      itp('shows the buttons below the primary auth form by default', function () {
        var settings = {
          idps: [
            {
              type: 'FACEBOOK',
              id: '0oaidiw9udOSceD1234'
            },
            {
              type: 'LINKEDIN',
              id: '0oaidiw9udOSceD1111'
            },
            {
              type: 'GOOGLE',
              id: '0oaidiw9udOSceD5678'
            },
            {
              type: 'MICROSOFT',
              id: '0oaidiw9udOSceD3333'
            }
          ]
        };
        return setup(settings).then(function (test) {
          expect(test.form.primaryAuthForm().index()).toBe(0);
          expect(test.form.primaryAuthContainer().index()).toBe(1);
          expect(test.form.socialAuthButtons().length).toBe(4);
          expect(test.form.facebookButton().length).toBe(1);
          expect(test.form.googleButton().length).toBe(1);
          expect(test.form.linkedInButton().length).toBe(1);
          expect(test.form.microsoftButton().length).toBe(1);
        });
      });
      itp('shows the buttons above the primary auth form when "idpDisplay" is passed as "PRIMARY"', function () {
        var settings = {
          idpDisplay: 'PRIMARY',
          idps: [
            {
              type: 'LINKEDIN',
              id: '0oaidiw9udOSceD1234'
            },
            {
              type: 'GOOGLE',
              id: '0oaidiw9udOSceD5678'
            }
          ]
        };
        return setup(settings).then(function (test) {
          expect(test.form.primaryAuthContainer().index()).toBe(0);
          expect(test.form.primaryAuthForm().index()).toBe(1);
          expect(test.form.socialAuthButtons().length).toBe(2);
          expect(test.form.linkedInButton().length).toBe(1);
          expect(test.form.googleButton().length).toBe(1);
        });
      });
      itp('shows the buttons below the primary auth form when "idpDisplay" is passed as "SECONDARY"', function () {
        var settings = {
          idpDisplay: 'SECONDARY',
          idps: [
            {
              type: 'FACEBOOK',
              id: '0oaidiw9udOSceD1234'
            },
            {
              type: 'GOOGLE',
              id: '0oaidiw9udOSceD5678'
            }
          ]
        };
        return setup(settings).then(function (test) {
          expect(test.form.primaryAuthForm().index()).toBe(0);
          expect(test.form.primaryAuthContainer().index()).toBe(1);
          expect(test.form.socialAuthButtons().length).toBe(2);
          expect(test.form.facebookButton().length).toBe(1);
          expect(test.form.googleButton().length).toBe(1);
        });
      });
      itp('opens a popup with the correct url when an idp button is clicked', function () {
        return setupSocial().then(function (test) {
          test.form.facebookButton().click();
          expect(window.open.calls.count()).toBe(1);
          expect(window.open).toHaveBeenCalledWith(
            'https://foo.com/oauth2/v1/authorize?' +
            'client_id=someClientId&' +
            'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
            'response_type=id_token&' +
            'response_mode=okta_post_message&' +
            'state=' + OIDC_STATE +
            '&nonce=' + OIDC_NONCE +
            '&display=popup&' +
            'idp=0oaidiw9udOSceD1234&' +
            'scope=openid%20email%20profile',
            'External Identity Provider User Authentication',
            'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
          );
        });
      });
      itp('opens a popup with the correct url when an idp button is clicked and asking for an accessToken', function () {
        return setupSocial({ 'authParams.responseType': 'token' })
        .then(function (test) {
          test.form.facebookButton().click();
          expect(window.open.calls.count()).toBe(1);
          expect(window.open).toHaveBeenCalledWith(
            'https://foo.com/oauth2/v1/authorize?' +
            'client_id=someClientId&' +
            'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
            'response_type=token&' +
            'response_mode=okta_post_message&' +
            'state=' + OIDC_STATE +
            '&nonce=' + OIDC_NONCE +
            '&display=popup&' +
            'idp=0oaidiw9udOSceD1234&' +
            'scope=openid%20email%20profile',
            'External Identity Provider User Authentication',
            'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
          );
        });
      });
      itp('opens a popup with the correct url when an idp button is clicked and asking for an accessToken and idToken', function () {
        return setupSocial({ 'authParams.responseType': ['id_token', 'token']})
        .then(function (test) {
          test.form.facebookButton().click();
          expect(window.open.calls.count()).toBe(1);
          expect(window.open).toHaveBeenCalledWith(
            'https://foo.com/oauth2/v1/authorize?' +
            'client_id=someClientId&' +
            'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
            'response_type=id_token%20token&' +
            'response_mode=okta_post_message&' +
            'state=' + OIDC_STATE +
            '&nonce=' + OIDC_NONCE +
            '&display=popup&' +
            'idp=0oaidiw9udOSceD1234&' +
            'scope=openid%20email%20profile',
            'External Identity Provider User Authentication',
            'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
          );
        });
      });
      itp('calls the global success function with the idToken and user data when the popup sends a message with idToken', function () {
        spyOn(window, 'addEventListener');
        return setupSocial()
        .then(function (test) {
          test.form.facebookButton().click();
          return tick(test);
        })
        .then(function(test) {
          expect(window.addEventListener).toHaveBeenCalled();
          var args = window.addEventListener.calls.argsFor(0);
          var type = args[0];
          var callback = args[1];
          expect(type).toBe('message');
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE
            }
          });
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          expect(test.successSpy.calls.count()).toBe(1);
          var data = test.successSpy.calls.argsFor(0)[0];
          expect(data.status).toBe('SUCCESS');
          expect(data.idToken).toBe(VALID_ID_TOKEN);
          expect(data.claims).toEqual({
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
            ver: 1
          });
        });
      });
      itp('calls the global success function with the idToken and accessToken', function () {
        spyOn(window, 'addEventListener');
        return setupSocial({ 'authParams.responseType': ['id_token', 'token'] })
        .then(function (test) {
          test.form.facebookButton().click();
          expect(window.addEventListener).toHaveBeenCalled();
          var args = window.addEventListener.calls.argsFor(0);
          var type = args[0];
          var callback = args[1];
          expect(type).toBe('message');
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE,
              access_token: VALID_ACCESS_TOKEN,
              expires_in: 3600,
              scope: 'openid email profile',
              token_type: 'Bearer'
            }
          });
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          expect(test.successSpy.calls.count()).toBe(1);
          var data = test.successSpy.calls.argsFor(0)[0];
          expect(data.status).toBe('SUCCESS');
          expect(data[0].idToken).toBe(VALID_ID_TOKEN);

          expect(data[1].accessToken).toBe(VALID_ACCESS_TOKEN);
          expect(data[1].scopes).toEqual(['openid', 'email', 'profile']);
          expect(data[1].tokenType).toBe('Bearer');
        });
      });
      itp('calls the global error function if there is no valid id token returned', function () {
        var errorSpy = jasmine.createSpy('errorSpy');
        spyOn(window, 'addEventListener');
        return setupSocial({ globalErrorFn: errorSpy })
        .then(function (test) {
          test.form.facebookButton().click();
          var args = window.addEventListener.calls.argsFor(0);
          var callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              state: OIDC_STATE,
              error: 'OAuth Error',
              error_description: 'Message from server'
            }
          });
          return tick();
        })
        .then(function () {
          expect(errorSpy.calls.count()).toBe(1);
          var err = errorSpy.calls.argsFor(0)[0];
          expect(err instanceof Errors.OAuthError).toBe(true);
          expect(err.name).toBe('OAUTH_ERROR');
          expect(err.message).toEqual('Message from server');
        });
      });
      itp('ignores messages with the wrong origin', function () {
        var successSpy = jasmine.createSpy('successSpy'),
            errorSpy = jasmine.createSpy('errorSpy');
        spyOn(window, 'addEventListener');
        return setupSocial({ globalErrorFn: errorSpy, globalSuccessFn: successSpy })
        .then(function (test) {
          test.form.facebookButton().click();
          var args = window.addEventListener.calls.argsFor(0);
          var callback = args[1];
          callback.call(null, {
            origin: 'https://evil.com',
            data: {
              id_token: VALID_ID_TOKEN
            }
          });
          return tick();
        })
        .then(function () {
          expect(successSpy.calls.count()).toBe(0);
          expect(errorSpy.calls.count()).toBe(0);
        });
      });
      itp('closes the popup after receiving the idToken message', function () {
        var successSpy = jasmine.createSpy('successSpy');
        spyOn(window, 'addEventListener');
        return setupSocial({ globalSuccessFn: successSpy })
        .then(function (test) {
          test.form.facebookButton().click();
          var args = window.addEventListener.calls.argsFor(0);
          var callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE
            }
          });
          return tick(test);
        })
        .then(function (test) {
          expect(test.oidcWindow.close).toHaveBeenCalled();
        });
      });

      // Reminder: Think about how to mock this out in the future - currently
      // cannot mock it because we defer to AuthJs to do set window.location.
      // On the plus side, there is an e2e test that covers this.
      xit('redirects to the correct url in the social idp redirect flow');
    });

  });

  Expect.describe('Additional Auth Button', function () {
    itp('does not show the divider and buttons if settings.customButtons is not set', function () {
      return setup().then(function (test) {
        expect(test.form.authDivider().length).toBe(0);
        expect(test.form.additionalAuthButton().length).toBe(0);
      });
    });
    itp('show the divider and buttons if settings.customButtons is not empty', function () {
      return setupAdditionalAuthButton().then(function (test) {
        expect(test.form.authDivider().length).toBe(1);
        expect(test.form.additionalAuthButton().length).toBe(1);
      });
    });
    itp('sets text with property passed', function () {
      return setupAdditionalAuthButton().then(function(test){
        expect(test.form.additionalAuthButton().text()).toEqual('test text');
      });
    });
    itp('sets class with property passed', function () {
      return setupAdditionalAuthButton().then(function(test){
        expect(test.form.additionalAuthButton().hasClass('test-class')).toBe(true);
      });
    });
    itp('clickHandler is called when button is clicked', function () {
      return setupAdditionalAuthButton().then(function(test){
        expect(test.form.additionalAuthButton().hasClass('new-class')).toBe(false);
        test.form.additionalAuthButton().click();
        expect(test.form.additionalAuthButton().hasClass('new-class')).toBe(true);
      });
    });
    itp('displays social auth and custom buttons', function () {
      var settings = {
        customButtons: [
          {
            title: 'test text',
            className: 'test-class',
            click: function (e) {
              $(e.target).addClass('new-class');
            }
          }
        ],
        idps: [
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234'
          }
        ]
      };
      return setup(settings).then(function(test){
        expect(test.form.authDivider().length).toBe(1);
        expect(test.form.additionalAuthButton().length).toBe(1);
        expect(test.form.facebookButton().length).toBe(1);
      });
    });
    itp('does not display custom auth when it is undefined', function () {
      var settings = {
        customButtons: undefined,
        idps: [
          {
            type: 'FACEBOOK',
            id: '0oaidiw9udOSceD1234'
          }
        ]
      };
      return setup(settings).then(function(test){
        expect(test.form.authDivider().length).toBe(1);
        expect(test.form.additionalAuthButton().length).toBe(0);
        expect(test.form.facebookButton().length).toBe(1);
      });
    });
    itp('does not display social auth when it is undefined', function () {
      var settings = {
        customButtons: [
          {
            title: 'test text',
            className: 'test-class',
            click: function (e) {
              $(e.target).addClass('new-class');
            }
          }
        ],
        idps: undefined
      };
      return setup(settings).then(function(test){
        expect(test.form.authDivider().length).toBe(1);
        expect(test.form.additionalAuthButton().length).toBe(1);
        expect(test.form.facebookButton().length).toBe(0);
      });
    });
    itp('does not display any additional buttons when social auth and customButtons are undefined', function () {
      var settings = {
        customButtons: undefined,
        idps: undefined
      };
      return setup(settings).then(function(test){
        expect(test.form.authDivider().length).toBe(0);
        expect(test.form.additionalAuthButton().length).toBe(0);
        expect(test.form.facebookButton().length).toBe(0);
      });
    });
  });
});
