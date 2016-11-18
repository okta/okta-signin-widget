/*global JSON */
/*jshint maxparams:50, maxstatements:50, maxlen:180, camelcase:false */
define([
  'okta',
  'vendor/lib/q',
  'backbone',
  'shared/util/Util',
  'util/CryptoUtil',
  'util/CookieUtil',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/dom/PrimaryAuthForm',
  'helpers/dom/RecoveryQuestionForm',
  'helpers/dom/MfaVerifyForm',
  'helpers/dom/EnrollCallForm',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/RECOVERY',
  'helpers/xhr/MFA_REQUIRED_allFactors',
  'helpers/xhr/MFA_REQUIRED_duo',
  'helpers/xhr/MFA_REQUIRED_oktaVerify',
  'helpers/xhr/MFA_CHALLENGE_duo',
  'helpers/xhr/MFA_CHALLENGE_push',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/ERROR_invalid_token',
  'util/Errors',
  'util/BrowserFeatures',
  'helpers/xhr/labels_login_ja',
  'helpers/xhr/labels_country_ja'
],
function (Okta, Q, Backbone, SharedUtil, CryptoUtil, CookieUtil, OktaAuth, Util, Expect, Router,
          $sandbox, PrimaryAuthForm, RecoveryForm, MfaVerifyForm, EnrollCallForm, resSuccess, resRecovery,
          resMfa, resMfaRequiredDuo, resMfaRequiredOktaVerify, resMfaChallengeDuo, resMfaChallengePush,
          resMfaEnroll, errorInvalidToken, Errors, BrowserFeatures, labelsLoginJa, labelsCountryJa) {

  var itp = Expect.itp,
      tick = Expect.tick,
      _ = Okta._,
      $ = Okta.$;

  var OIDC_IFRAME_ID = 'okta-oauth-helper-frame';
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

  Expect.describe('LoginRouter', function () {

    function setup(settings) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl});
      var eventSpy = jasmine.createSpy('eventSpy');
      var router = new Router(_.extend({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: function () {}
      }, settings));
      Util.registerRouter(router);
      router.on('pageRendered', eventSpy);
      spyOn(authClient.token, 'getWithoutPrompt').and.callThrough();
      spyOn(authClient.token.getWithRedirect, '_setLocation');
      return tick({
        router: router,
        ac: authClient,
        setNextResponse: setNextResponse,
        eventSpy: eventSpy
      });
    }

    function setupOAuth2(settings) {
      spyOn(window, 'addEventListener');
      Util.mockOIDCStateGenerator();
      return setup(_.extend({
        clientId: 'someClientId',
        redirectUri: 'https://0.0.0.0:9999'
      }, settings))
      .then(function (test) {
        // Start in MFA_REQUIRED, and then call success. This allows us to test
        // that we are registering our handler independent of the controller we
        // are on
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resMfaRequiredOktaVerify);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForMfaVerify(test);
      })
      .then(function (test) {
        var origAppend = document.appendChild;
        spyOn(document.body, 'appendChild').and.callFake(function (element) {
          if (element.tagName.toLowerCase() === ('iframe')) {
            // Don't want to actually append the original iframe since it loads
            // an external url. However, we will append one without the src so
            // that we can test that we remove it
            test.iframeElem = element;
            $sandbox.append('<iframe id=' + OIDC_IFRAME_ID + '></iframe>');
            // return the iframe dom element so that the element can be used in the later flows.
            return $sandbox.find('#' + OIDC_IFRAME_ID)[0];
          }
          return origAppend.apply(this, arguments);
        });

        var form = new MfaVerifyForm($sandbox);
        test.setNextResponse(resSuccess);
        form.setAnswer('wrong');
        form.submit();
        return tick(test);
      });
    }

    // { settings, userLanguages, supportedLanguages }
    function setupLanguage(options) {
      var loadingSpy = jasmine.createSpy('loading');
      var delay = options.delay || 0;
      spyOn(BrowserFeatures, 'getUserLanguages').and.returnValue(options.userLanguages || []);
      return setup(options.settings)
      .then(function (test) {
        test.router.appState.on('loading', loadingSpy);
        // Use the encrollCallAndSms controller because it uses both the login
        // and country bundles
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resMfaEnroll);
        if (options.mockLanguageRequest) {
          switch (options.mockLanguageRequest) {
          case 'ja':
            test.setNextResponse([
              _.extend({ delay: delay }, labelsLoginJa),
              _.extend({ delay: delay }, labelsCountryJa)
            ]);
            break;
          }
        }
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices(test);
      })
      .then(function (test) {
        test.router.appState.off('loading');
        test.router.enrollCall();
        return Expect.waitForEnrollCall(_.extend(test, {
          form: new EnrollCallForm($sandbox),
          loadingSpy: loadingSpy
        }));
      });
    }

    it('throws a ConfigError if unknown option is passed as a widget param', function () {
      var fn = function () { setup({ foo: 'bla' }); };
      expect(fn).toThrowError(Errors.ConfigError);
    });
    it('has the correct error message if unknown option is passed as a widget param', function () {
      var fn = function () { setup({ foo: 'bla' }); };
      expect(fn).toThrowError('field not allowed: foo');
    });
    it('throws a ConfigError if el is not passed as a widget param', function () {
      var fn = function () { setup({ el: undefined }); };
      expect(fn).toThrowError(Errors.ConfigError);
    });
    it('has the correct error message if el is not passed as a widget param', function () {
      var fn = function () { setup({ el: undefined }); };
      expect(fn).toThrowError('"el" is a required widget parameter');
    });
    it('throws a ConfigError if baseUrl is not passed as a widget param', function () {
      var fn = function () { setup({ baseUrl: undefined }); };
      expect(fn).toThrowError(Errors.ConfigError);
    });
    it('has the correct error message if baseUrl is not passed as a widget param', function () {
      var fn = function () { setup({ baseUrl: undefined }); };
      expect(fn).toThrowError('"baseUrl" is a required widget parameter');
    });
    it('throws a ConfigError if globalSuccessFn is not passed as a widget param', function () {
      var fn = function () { setup({ globalSuccessFn: undefined }); };
      expect(fn).toThrowError(Errors.ConfigError);
    });
    it('has the correct error message if globalSuccessFn is not passed as a widget param', function () {
      var fn = function () { setup({ globalSuccessFn: undefined }); };
      expect(fn).toThrowError('A success handler is required');
    });
    itp('set pushState true if pushState is supported', function () {
      spyOn(BrowserFeatures, 'supportsPushState').and.returnValue(true);
      spyOn(Okta.Router.prototype, 'start');
      return setup().then(function (test) {
        test.router.start();
        expect(Okta.Router.prototype.start).toHaveBeenCalledWith({ pushState: true });
      });
    });
    itp('set pushState false if pushState is not supported', function () {
      spyOn(BrowserFeatures, 'supportsPushState').and.returnValue(false);
      spyOn(Okta.Router.prototype, 'start');
      return setup().then(function (test) {
        test.router.start();
        expect(Okta.Router.prototype.start).toHaveBeenCalledWith({ pushState: false });
      });
    });

    itp('invokes success callback if SUCCESS auth status is returned', function () {
      var successSpy = jasmine.createSpy('successSpy');
      return setup({ globalSuccessFn: successSpy })
      .then(function (test) {
        test.setNextResponse(resSuccess);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForSpyCall(successSpy);
      })
      .then(function () {
        var res = successSpy.calls.mostRecent().args[0];
        expect(res.status).toBe('SUCCESS');
        expect(res.user).toEqual({
          id: '00ui0jgywTAHxYGMM0g3',
          profile: {
            login: 'administrator1@clouditude.net',
            firstName: 'Add-Min',
            lastName: 'O\'Cloudy Tud',
            locale: 'en_US',
            timeZone: 'America\/Los_Angeles'
          }
        });
        expect(res.session.token).toBe('THE_SESSION_TOKEN');
        expect(_.isFunction(res.session.setCookieAndRedirect)).toBe(true);
      });
    });
    itp('has a success callback which correctly implements the setCookieAndRedirect function', function () {
      spyOn(SharedUtil, 'redirect');
      var successSpy = jasmine.createSpy('successSpy');
      return setup({ globalSuccessFn: successSpy })
      .then(function (test) {
        test.setNextResponse(resSuccess);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForSpyCall(successSpy);
      })
      .then(function () {
        var setCookieAndRedirect = successSpy.calls.mostRecent().args[0].session.setCookieAndRedirect;
        setCookieAndRedirect('http://baz.com/foo');
        expect(SharedUtil.redirect).toHaveBeenCalledWith(
          'https://foo.com/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
          '&token=THE_SESSION_TOKEN&redirectUrl=http%3A%2F%2Fbaz.com%2Ffoo'
        );
      });
    });
    it('throws an error on unrecoverable errors if no globalErrorFn is defined', function () {
      var fn = function () {
        setup({ foo: 'bar' });
      };
      expect(fn).toThrowError('field not allowed: foo');
    });
    it('calls globalErrorFn on unrecoverable errors if it is defined', function () {
      var errorSpy = jasmine.createSpy('errorSpy');
      var fn = function () {
        setup({ globalErrorFn: errorSpy, foo: 'bar' });
      };
      expect(fn).not.toThrow();
      var err = errorSpy.calls.mostRecent().args[0];
      expect(err instanceof Errors.ConfigError).toBe(true);
      expect(err.name).toBe('CONFIG_ERROR');
      expect(err.message).toEqual('field not allowed: foo');
    });
    it('calls globalErrorFn if cors is not supported by the browser', function () {
      var errorSpy = jasmine.createSpy('errorSpy');
      spyOn(BrowserFeatures, 'corsIsNotSupported').and.returnValue(true);
      var fn = function () {
        setup({ globalErrorFn: errorSpy });
      };
      expect(fn).not.toThrow();
      var err = errorSpy.calls.mostRecent().args[0];
      expect(err instanceof Errors.UnsupportedBrowserError).toBe(true);
      expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
      expect(err.message).toEqual('Unsupported browser - missing CORS support');
    });
    itp('uses default router navigate if features.router param is true', function () {
      spyOn(Okta.Router.prototype, 'navigate');
      return setup({ 'features.router': true }).then(function (test) {
        test.router.navigate('signin/forgot-password', { trigger: true });
        expect(Okta.Router.prototype.navigate).toHaveBeenCalledWith('signin/forgot-password', { trigger: true });
      });
    });
    itp('uses history loadUrl if features.router param is false', function () {
      spyOn(Okta.Router.prototype, 'navigate');
      spyOn(Backbone.history, 'loadUrl');
      return setup({ 'features.router': false }).then(function (test) {
        test.router.navigate('signin/forgot-password', { trigger: true });
        expect(Okta.Router.prototype.navigate).not.toHaveBeenCalled();
        expect(Backbone.history.loadUrl).toHaveBeenCalledWith('signin/forgot-password');
      });
    });
    itp('navigates to PrimaryAuth if requesting a stateful url without a stateToken', function () {
      return setup()
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('signin/recovery-question');
        return Expect.waitForPrimaryAuth();
      })
      .then(function () {
        var form = new PrimaryAuthForm($sandbox);
        expect(form.isPrimaryAuth()).toBe(true);
      });
    });
    itp('refreshes auth state on stateful url if it needs a refresh', function () {
      return setup()
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        Util.mockSDKCookie(test.ac);
        test.setNextResponse(resRecovery);
        test.router.navigate('signin/recovery-question');
        return Expect.waitForRecoveryQuestion();
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            stateToken: 'testStateToken'
          }
        });
        var form = new RecoveryForm($sandbox);
        expect(form.isRecoveryQuestion()).toBe(true);
      });
    });
    itp('calls status and redirects if initialized with a stateToken', function () {
      return setup({ stateToken: 'aStateToken' })
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resRecovery);
        test.router.navigate('');
        return Expect.waitForRecoveryQuestion();
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            stateToken: 'aStateToken'
          }
        });
        var form = new RecoveryForm($sandbox);
        expect(form.isRecoveryQuestion()).toBe(true);
      });
    });
    itp('navigates to PrimaryAuth and shows a flash error if the stateToken expires', function () {
      return setup()
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resRecovery);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForRecoveryQuestion(test);
      })
      .then(function (test) {
        test.setNextResponse(errorInvalidToken);
        var form = new RecoveryForm($sandbox);
        form.setAnswer('4444');
        form.submit();
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function (test) {
        var form = new PrimaryAuthForm($sandbox);
        expect(form.isPrimaryAuth()).toBe(true);
        expect(form.hasErrors()).toBe(true);
        expect(form.errorMessage()).toBe('Your session has expired. Please try to log in again.');

        // Submit the form and verify that we no longer have the flash error message
        test.setNextResponse(resMfa);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForMfaVerify(test);
      })
      .then(function () {
        var form = new MfaVerifyForm($sandbox);
        expect(form.isSecurityQuestion()).toBe(true);
        expect(form.hasErrors()).toBe(false);
      });
    });
    itp('does not show two forms if the duo fetchInitialData request fails with an expired stateToken', function () {
      Util.mockDuo();
      return setup()
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        test.router.primaryAuth();
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function (test) {
        Q.stopUnhandledRejectionTracking();
        test.setNextResponse([resMfaRequiredDuo, errorInvalidToken]);
        var form = new PrimaryAuthForm($sandbox);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        // Wait an extra tick for the animation success function to run
        return tick().then(function () {
          return tick(test);
        });
      })
      .then(function () {
        // If we don't have our fix, there will be two PrimaryAuth forms
        var form = new PrimaryAuthForm($sandbox);
        expect(form.usernameField().length).toBe(1);
      });
    });
    itp('makes a call to previous if the page is refreshed in an MFA_CHALLENGE state', function () {
      return setup()
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        Util.mockSDKCookie(test.ac);
        test.setNextResponse([resMfaChallengeDuo, resMfa]);
        test.router.navigate('signin/verify/duo/web', { trigger: true });
        return Expect.waitForMfaVerify();
      })
      .then(function () {
        // Expect that we are on the MFA_CHALLENGE page (default is push for this
        // response)
        expect($.ajax.calls.count()).toBe(2);
        var form = new MfaVerifyForm($sandbox);
        expect(form.isSecurityQuestion()).toBe(true);
      });
    });
    itp('checks auto push by default for a returning user', function () {
      Util.mockCookie('auto_push_' + CryptoUtil.getStringHash('00uhn6dAGR4nUB4iY0g3'), 'true');
      return setup({'features.autoPush': true})
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('signin');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function (test) {
        var form = new PrimaryAuthForm($sandbox);
        expect(form.isPrimaryAuth()).toBe(true);
        // Respond with MFA_REQUIRED
        // Verify is immediately called, so respond with MFA_CHALLENGE
        test.setNextResponse([resMfaRequiredOktaVerify, resMfaChallengePush]);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForMfaVerify();
      })
      .then(function () {
        var form = new MfaVerifyForm($sandbox);
        expect(form.autoPushCheckbox().length).toBe(1);
        expect(form.isAutoPushChecked()).toBe(true);
        expect(form.isPushSent()).toBe(true);
        expect($.ajax.calls.count()).toBe(2);
        Expect.isJsonPost($.ajax.calls.argsFor(1), {
          url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify',
          data: {
            stateToken: 'testStateToken'
          }
        });
      });
    });
    itp('no auto push for a new user', function () {
      return setup({'features.autoPush': true})
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('signin');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function (test) {
        var form = new PrimaryAuthForm($sandbox);
        expect(form.isPrimaryAuth()).toBe(true);
        test.setNextResponse(resMfaRequiredOktaVerify);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForMfaVerify();
      })
      .then(function () {
        var form = new MfaVerifyForm($sandbox);
        expect(form.autoPushCheckbox().length).toBe(1);
        expect(form.isAutoPushChecked()).toBe(false);
        expect(form.isPushSent()).toBe(false);
      });
    });
    itp('auto push updates cookie on MFA success', function () {
      spyOn(CookieUtil, 'removeAutoPushCookie');
      return setup({'features.autoPush': true})
      .then(function (test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('signin');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function (test) {
        var form = new PrimaryAuthForm($sandbox);
        expect(form.isPrimaryAuth()).toBe(true);
        test.setNextResponse(resMfaRequiredOktaVerify);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForMfaVerify(test);
      })
      .then(function (test) {
        test.setNextResponse(resSuccess);
        var form = new MfaVerifyForm($sandbox);
        form.submit();
        return tick(test);
      })
      .then(function () {
        expect(CookieUtil.removeAutoPushCookie).toHaveBeenCalledWith('00ui0jgywTAHxYGMM0g3');
      });
    });

    Expect.describe('OIDC - okta is the idp and oauth2 is enabled', function () {

      function expectAuthorizeUrl(url, options) {
        var authorizeUrl = options.authorizeUrl || 'https://foo.com/oauth2/v1/authorize';
        var state = options.state || OIDC_STATE;
        var nonce = options.nonce || OIDC_NONCE;
        var expectedUrl = authorizeUrl + '?' +
          'client_id=someClientId&' +
          'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
          'response_type=' + options.responseType + '&' +
          'response_mode=' + options.responseMode + '&' +
          'state=' + state + '&' +
          'nonce=' + nonce + '&';
        if (options.display) {
          expectedUrl += 'display=' + options.display + '&';
        }
        if (options.prompt) {
          expectedUrl += 'prompt=' + options.prompt + '&';
        }
        expectedUrl += '' +
          'sessionToken=THE_SESSION_TOKEN&' +
          'scope=openid%20email';
        expect(url).toBe(expectedUrl);
      }

      function expectCodeRedirect(options) {
        return function (test) {
          var spy = test.ac.token.getWithRedirect._setLocation;
          expect(spy.calls.count()).toBe(1);
          expectAuthorizeUrl(spy.calls.argsFor(0)[0], options);
        };
      }

      itp('accepts the deprecated "authParams.scope" option, but converts it to "scopes"', function () {
        var options = {
          authParams: {
            scope: ['openid', 'testscope']
          }
        };
        return setupOAuth2(options)
        .then(function (test) {
          var spy = test.ac.token.getWithoutPrompt;
          expect(spy.calls.count()).toBe(1);
          expect(spy.calls.argsFor(0)[0].scopes).toEqual(['openid', 'testscope']);
          Expect.deprecated('Use "scopes" instead of "scope"');
       });
      });
      itp('redirects instead of using an iframe if the responseType is "code"', function () {
        return setupOAuth2({'authParams.responseType': 'code'})
        .then(expectCodeRedirect({responseMode: 'query', responseType:'code'}));
      });
      itp('redirects to alternate authorizeUrl if the responseType is "code"', function () {
        return setupOAuth2({
          'authParams.responseType': 'code',
          'authParams.authorizeUrl': 'https://altfoo.com/oauth2/v1/authorize'
        })
        .then(expectCodeRedirect({
          authorizeUrl: 'https://altfoo.com/oauth2/v1/authorize',
          responseMode: 'query',
          responseType:'code'
        }));
      });
      itp('redirects to alternate authorizeUrl if an alternate issuer is provided', function () {
        return setupOAuth2({
          'authParams.responseType': 'code',
          'authParams.issuer': 'https://altfoo.com'
        })
        .then(expectCodeRedirect({
          authorizeUrl: 'https://altfoo.com/oauth2/v1/authorize',
          responseMode: 'query',
          responseType:'code'
        }));
      });
      itp('redirects to alternate authorizeUrl if an alternate issuer and alternate authorizeUrl is provided', function () {
        return setupOAuth2({
          'authParams.responseType': 'code',
          'authParams.issuer': 'https://altfoo.com',
          'authParams.authorizeUrl': 'https://reallyaltfoo.com/oauth2/v1/authorize'
        })
        .then(expectCodeRedirect({
          authorizeUrl: 'https://reallyaltfoo.com/oauth2/v1/authorize',
          responseMode: 'query',
          responseType:'code'
        }));
      });
      itp('redirects with alternate state provided', function () {
        return setupOAuth2({
          'authParams.responseType': 'code',
          'authParams.state': 'myalternatestate'
        })
        .then(expectCodeRedirect({
          state: 'myalternatestate',
          responseMode: 'query',
          responseType:'code'
        }));
      });
      itp('redirects with alternate nonce provided', function () {
        return setupOAuth2({
          'authParams.responseType': 'code',
          'authParams.nonce': 'myalternatenonce'
        })
        .then(expectCodeRedirect({
          nonce: 'myalternatenonce',
          responseMode: 'query',
          responseType:'code'
        }));
      });
      itp('redirects with alternate state and nonce provided', function () {
        return setupOAuth2({
          'authParams.responseType': 'code',
          'authParams.state': 'myalternatestate',
          'authParams.nonce': 'myalternatenonce'
        })
        .then(expectCodeRedirect({
          state: 'myalternatestate',
          nonce: 'myalternatenonce',
          responseMode: 'query',
          responseType:'code'
        }));
      });
      itp('redirects if there are multiple responseTypes, and one is "code"', function () {
        return setupOAuth2({'authParams.responseType': ['id_token', 'code']})
        .then(expectCodeRedirect({responseMode: 'fragment', 'responseType': 'id_token%20code'}));
      });
      itp('redirects instead of using an iframe if display is "page"', function () {
        return setupOAuth2({'authParams.display': 'page'})
        .then(expectCodeRedirect({
          responseMode: 'fragment',
          responseType: 'id_token',
          display: 'page'
        }));
      });
      itp('creates an iframe with the correct url when authStatus is SUCCESS', function () {
        return setupOAuth2()
        .then(function (test) {
          expectAuthorizeUrl(test.iframeElem.src, {
            responseType: 'id_token',
            responseMode: 'okta_post_message',
            prompt: 'none'
          });
          Expect.isNotVisible($(test.iframeElem));
        });
      });
      itp('removes the iframe when it returns with the redirect data', function () {
        return setupOAuth2()
        .then(function () {
          expect(window.addEventListener).toHaveBeenCalled();
          var args = window.addEventListener.calls.argsFor(0);
          var type = args[0];
          var callback = args[1];
          expect(type).toBe('message');
          expect($sandbox.find('#' + OIDC_IFRAME_ID).length).toBe(1);
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE
            }
          });
          return tick();
        })
        .then(function () {
          expect($sandbox.find('#' + OIDC_IFRAME_ID).length).toBe(0);
        });
      });
      itp('invokes the success function with idToken and user data when the iframe returns with data', function () {
        var successSpy = jasmine.createSpy('successSpy');
        return setupOAuth2({ globalSuccessFn: successSpy })
        .then(function () {
          expect(window.addEventListener).toHaveBeenCalled();
          var args = window.addEventListener.calls.argsFor(0);
          var callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE
            }
          });
          return tick();
        })
        .then(function () {
          expect(successSpy.calls.count()).toBe(1);
          var data = successSpy.calls.argsFor(0)[0];
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
      itp('calls the global error function if an idToken is not returned', function () {
        var errorSpy = jasmine.createSpy('errorSpy');
        return setupOAuth2({ globalErrorFn: errorSpy })
        .then(function () {
          var args = window.addEventListener.calls.argsFor(0);
          var callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              state: OIDC_STATE,
              error: 'invalid_client',
              error_description: 'Invalid value for client_id parameter.'
            }
          });
          return tick();
        })
        .then(function () {
          expect(errorSpy.calls.count()).toBe(1);
          var err = errorSpy.calls.argsFor(0)[0];
          expect(err instanceof Errors.OAuthError).toBe(true);
          expect(err.name).toBe('OAUTH_ERROR');
          expect(err.message).toBe('Invalid value for client_id parameter.');
        });
      });
    });

    Expect.describe('Events', function () {
      itp('triggers a pageRendered event when first controller is loaded', function() {
        return setup()
        .then(function (test) {
          test.router.primaryAuth();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test){
          expect(test.eventSpy.calls.count()).toBe(1);
          expect(test.eventSpy).toHaveBeenCalledWith({ page: 'primary-auth'});
        });
      });
      itp('triggers a pageRendered event when navigating to a new controller', function() {
        return setup()
        .then(function (test) {
          // Test navigation from primary Auth to Forgot password page
          test.router.primaryAuth();
          Util.mockRouterNavigate(test.router);
          test.router.navigate('signin/forgot-password');
          return Expect.waitForForgotPassword(test);
        })
        .then(function (test) {
          // since the event is triggered from the success function of the animation
          // as well as after render, we expect two calls
          expect(test.eventSpy.calls.count()).toBe(2);
          expect(test.eventSpy.calls.allArgs()[0]).toEqual([{page: 'forgot-password'}]);
          expect(test.eventSpy.calls.allArgs()[1]).toEqual([{page: 'forgot-password'}]);
        });
      });
    });

   Expect.describe('Config: "i18n"', function () {
      itp('supports deprecated "labels" and "country" options', function () {
        return setupLanguage({
          settings: {
            labels: {
              'enroll.call.setup': 'test override title'
            },
            country: {
              'JP': 'Nihon'
            }
          }
        })
        .then(function (test) {
          test.form.selectCountry('JP');
          expect(test.form.titleText()).toBe('test override title');
          expect(test.form.selectedCountry()).toBe('Nihon');
          Expect.deprecated('Use "i18n" instead of "labels" and "country"');
        });
      });
      itp('overrides text in the login bundle', function () {
        return setupLanguage({
          settings: {
            i18n: {
              'en': {
                'enroll.call.setup': 'test override title'
              }
            }
          }
        })
        .then(function (test) {
          expect(test.form.titleText()).toBe('test override title');
        });
      });
      itp('uses "country.COUNTRY" to override text in the country bundle', function () {
        return setupLanguage({
          settings: {
            i18n: {
              'en': {
                'country.JP': 'Nihon'
              }
            }
          }
        })
        .then(function (test) {
          test.form.selectCountry('JP');
          expect(test.form.selectedCountry()).toBe('Nihon');
        });
      });
    });

    Expect.describe('Config: "assets"', function () {

      function expectBundles(baseUrl, login, country) {
        expect($.ajax.calls.count()).toBe(3);
        var loginCall = $.ajax.calls.argsFor(0)[0];
        var countryCall = $.ajax.calls.argsFor(1)[0];
        expect(loginCall).toEqual({
          cache: true,
          dataType: 'jsonp',
          jsonpCallback: 'jsonp_login',
          timeout: 5000,
          url: baseUrl + login
        });
        expect(countryCall).toEqual({
          cache: true,
          dataType: 'jsonp',
          jsonpCallback: 'jsonp_country',
          timeout: 5000,
          url: baseUrl + country
        });
      }

      var expectDefaultPaths = _.partial(
        expectBundles,
        _,
        '/labels/jsonp/login_ja.jsonp',
        '/labels/jsonp/country_ja.jsonp'
      );

      var expectDefaultCdn = _.partial(
        expectBundles,
        'https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/9.9.99'
      );

      itp('loads properties from the cdn if no baseUrl and path overrides are supplied', function () {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja'
          }
        })
        .then(function () {
          expectDefaultPaths('https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/9.9.99');
        });
      });
      itp('loads properties from the given baseUrl', function () {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
            assets: {
              baseUrl: 'http://foo.com'
            }
          }
        })
        .then(function () {
          expectDefaultPaths('http://foo.com');
        });
      });
      itp('will clean up any trailing slashes in baseUrl', function () {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
            assets: {
              baseUrl: 'http://foo.com/'
            }
          }
        })
        .then(function () {
          expectDefaultPaths('http://foo.com');
        });
      });
      itp('can override bundle paths with rewrite', function () {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
            assets: {
              rewrite: function (file) {
                return file.replace('.jsonp', '.sha.jsonp');
              }
            }
          }
        })
        .then(function () {
          expectDefaultCdn('/labels/jsonp/login_ja.sha.jsonp', '/labels/jsonp/country_ja.sha.jsonp');
        });
      });
      itp('can override bundles with both baseUrl and rewrite', function () {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
            assets: {
              baseUrl: 'http://foo.com',
              rewrite: function (file) {
                return file.replace('.jsonp', '.1.jsonp');
              }
            }
          }
        })
        .then(function () {
          expectBundles(
            'http://foo.com',
            '/labels/jsonp/login_ja.1.jsonp',
            '/labels/jsonp/country_ja.1.jsonp'
          );
        });
      });
    });

    Expect.describe('Config: "language"', function () {

      function expectLanguage(titleText, countryText, test) {
        test.form.selectCountry('JP');
        expect(test.form.selectedCountry()).toBe(countryText);
        expect(test.form.titleText()).toBe(titleText);
        return test;
      }

      var expectEn = _.partial(expectLanguage,'Follow phone call instructions to authenticate', 'Japan');
      var expectJa = _.partial(expectLanguage, 'JA: enroll.call.setup', 'JA: country.JP');
      var expectZz = _.partial(expectLanguage, 'ZZ: enroll.call.setup', 'ZZ: country.JP');

      Expect.describe('Choosing a language', function () {
        itp('defaults to english if "language" is not specified and there are no user languages detected', function () {
          return setupLanguage({
            userLanguages: []
          })
          .then(expectEn);
        });
        itp('uses the first match of user language and supported language if user languages detected', function () {
          return setupLanguage({
            userLanguages: ['ja', 'ko', 'en'],
            mockLanguageRequest: 'ja'
          })
          .then(expectJa);
        });
        itp('will ignore case differences when finding languages, i.e. for Safari', function () {
          return setupLanguage({
            userLanguages: ['pt-br', 'ja'],
            mockLanguageRequest: 'ja',
            settings: {
              assets: {
                baseUrl: '/assets'
              }
            }
          })
          .then(function () {
            var loginCall = $.ajax.calls.argsFor(0)[0];
            var countryCall = $.ajax.calls.argsFor(1)[0];
            expect(loginCall.url).toBe('/assets/labels/jsonp/login_pt_BR.jsonp');
            expect(countryCall.url).toBe('/assets/labels/jsonp/country_pt_BR.jsonp');
          });
        });
        itp('will use base languageCode even if region is not supported', function () {
          return setupLanguage({
            userLanguages: ['ja-ZZ', 'ko', 'en'],
            mockLanguageRequest: 'ja',
            settings: {
              assets: {
                baseUrl: '/assets'
              }
            }
          })
          .then(function (test) {
            expectJa(test);
            var loginCall = $.ajax.calls.argsFor(0)[0];
            var countryCall = $.ajax.calls.argsFor(1)[0];
            expect(loginCall.url).toBe('/assets/labels/jsonp/login_ja.jsonp');
            expect(countryCall.url).toBe('/assets/labels/jsonp/country_ja.jsonp');
          });
        });
        itp('will use base languageCode with region even if dialect is not supported', function () {
          return setupLanguage({
            userLanguages: ['pt-BR-zz', 'ko', 'en'],
            mockLanguageRequest: 'ja',
            settings: {
              assets: {
                baseUrl: '/assets'
              }
            }
          })
          .then(function (test) {
            expectJa(test);
            var loginCall = $.ajax.calls.argsFor(0)[0];
            var countryCall = $.ajax.calls.argsFor(1)[0];
            expect(loginCall.url).toBe('/assets/labels/jsonp/login_pt_BR.jsonp');
            expect(countryCall.url).toBe('/assets/labels/jsonp/country_pt_BR.jsonp');
          });
        });
        itp('accepts a language code string as "language"', function () {
          return setupLanguage({
            mockLanguageRequest: 'ja',
            settings: {
              language: 'ja'
            }
          })
          .then(expectJa);
        });
        itp('accepts a function that returns a language code', function () {
          return setupLanguage({
            mockLanguageRequest: 'ja',
            settings: {
              language: function () {
                return 'ja';
              }
            }
          })
          .then(expectJa);
        });
        itp('passes the list of supported languages and user languages to the function', function () {
          var spy = jasmine.createSpy('language').and.returnValue('en');
          return setupLanguage({
            settings: {
              language: spy
            },
            userLanguages: ['ja', 'ko', 'en']
          })
          .then(function () {
            expect(spy.calls.count()).toBe(1);
            var args = spy.calls.argsFor(0);
            var supported = args[0];
            var userLanguages = args[1];
            expect(userLanguages).toEqual(['ja', 'ko', 'en']);
            expect(supported).toEqual([
              'en', 'cs', 'da', 'de', 'es', 'fi', 'fr', 'hu', 'it', 'ja', 'ko',
              'nl-NL', 'pt-BR', 'ro', 'ru', 'sv', 'th', 'uk', 'zh-CN', 'zh-TW'
            ]);
          });
        });
        itp('allows the developer to pass in a new language and will add that to the list of supported languages', function () {
          var spy = jasmine.createSpy('language').and.returnValue('zz-ZZ');
          return setupLanguage({
            settings: {
              language: spy,
              i18n: {
                'zz-ZZ': {
                  'enroll.call.setup': 'ZZ: enroll.call.setup',
                  'country.JP': 'ZZ: country.JP'
                }
              }
            }
          })
          .then(function (test) {
            var supported = spy.calls.argsFor(0)[0];
            expect(supported).toContain('zz-ZZ');
            expectZz(test);
          });
        });
        itp('will default to detection if the "language" property does not return a supported language', function () {
          return setupLanguage({
            mockLanguageRequest: 'ja',
            userLanguages: ['ja'],
            settings: {
              language: 'yy-YY'
            }
          })
          .then(expectJa);
        });
      });

      Expect.describe('Behavior', function () {
        itp('shows a spinner until the language is loaded if it takes longer than 200ms (i.e. ajax request)', function () {
          return setupLanguage({
            delay: 300,
            mockLanguageRequest: 'ja',
            settings: {
              language: 'ja'
            }
          })
          .then(function (test) {
            // 2 for the initial refreshAuthState call, and 2 for our spinner
            expect(test.loadingSpy.calls.count()).toBe(4);
            expect(test.loadingSpy.calls.argsFor(2)[0]).toBe(true);
            expect(test.loadingSpy.calls.argsFor(3)[0]).toBe(false);
          });
        });
        itp('can load a new language dynamically by updating the appState', function () {
          return setupLanguage({
            settings: {
              i18n: {
                'zz-ZZ': {
                  'enroll.call.setup': 'ZZ: enroll.call.setup',
                  'country.JP': 'ZZ: country.JP'
                }
              }
            }
          })
          .then(expectEn)
          .then(function (test) {
            // The new language will be rendered on the next router render, but we need
            // navigate away from the page first for the wait to work.
            test.router.forgotPassword();
            return Expect.waitForForgotPassword(test);
          })
          .then(function (test) {
            test.router.appState.set('languageCode', 'zz-ZZ');
            test.router.enrollCall();
            return Expect.waitForEnrollCall(test);
          })
          .then(expectZz);
        });
        itp('caches the language after the initial fetch', function () {
          spyOn(localStorage, 'setItem').and.callThrough();
          return setupLanguage({
            mockLanguageRequest: 'ja',
            settings: {
              language: 'ja'
            }
          })
          .then(function () {
            expect(localStorage.setItem).toHaveBeenCalledWith('osw.languages', JSON.stringify({
              version: '9.9.99',
              ja: {
                login: {
                  'enroll.call.setup': 'JA: enroll.call.setup',
                  'security.disliked_food': 'JA: What is the food you least liked as a child?'
                },
                country: {
                  'JP': 'JA: country.JP'
                }
              }
            }));
          });
        });
        itp('fetches from the cache if it is available', function () {
          spyOn(localStorage, 'getItem').and.callFake(function (key) {
            if (key === 'osw.languages') {
              return JSON.stringify({
                version: '9.9.99',
                ja: {
                  login: {
                    'enroll.call.setup': 'JA: enroll.call.setup',
                    'security.disliked_food': 'JA: What is the food you least liked as a child?'
                  },
                  country: {
                    'JP': 'JA: country.JP'
                  }
                }
              });
            }
          });
          return setupLanguage({
            // Note: No mocked request because it should be pulled from localStorage
            settings: {
              language: 'ja'
            }
          })
          .then(expectJa);
        });
        itp('fetches language again (even if its cached) after the osw version is updated', function () {
          spyOn(localStorage, 'getItem').and.callFake(function (key) {
            if (key === 'osw.languages') {
              return JSON.stringify({
                version: '0.0.00',
                ja: {
                  login: {
                    'enroll.call.setup': 'JA: some different string'
                  },
                  country: {
                    'JP': 'JA: some other country value'
                  }
                }
              });
            }
          });
          return setupLanguage({
            mockLanguageRequest: 'ja',
            settings: {
              language: 'ja'
            }
          })
          .then(expectJa);
        });
        itp('will default i18n to english if properties do not exist in a given language', function () {
          return setupLanguage({
            settings: {
              i18n: {
                'zz-ZZ': {
                  'enroll.call.setup': 'ZZ: enroll.call.setup',
                  'country.JP': 'ZZ: country.JP'
                }
              }
            }
          })
          .then(function (test) {
            expect(test.form.submitButtonText()).toBe('Verify');
          });
        });
      });
    });

  });

});
