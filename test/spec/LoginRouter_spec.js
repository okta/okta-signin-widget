/*jshint maxparams:50, maxstatements:50, maxlen:180, camelcase:false */
define([
  'okta',
  'vendor/lib/q',
  'backbone',
  'xdomain',
  'shared/util/Util',
  'util/CryptoUtil',
  'util/CookieUtil',
  'vendor/OktaAuth',
  'helpers/mocks/Util',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/dom/PrimaryAuthForm',
  'helpers/dom/RecoveryQuestionForm',
  'helpers/dom/MfaVerifyForm',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/RECOVERY',
  'helpers/xhr/MFA_REQUIRED_allFactors',
  'helpers/xhr/MFA_REQUIRED_duo',
  'helpers/xhr/MFA_REQUIRED_oktaVerify',
  'helpers/xhr/MFA_CHALLENGE_duo',
  'helpers/xhr/MFA_CHALLENGE_push',
  'helpers/xhr/ERROR_invalid_token',
  'util/Errors',
  'util/BrowserFeatures'
],
function (Okta, Q, Backbone, xdomain, SharedUtil, CryptoUtil, CookieUtil, OktaAuth, Util, Expect, Router,
          $sandbox, PrimaryAuthForm, RecoveryForm, MfaVerifyForm, resSuccess, resRecovery,
          resMfa, resMfaRequiredDuo, resMfaRequiredOktaVerify, resMfaChallengeDuo, resMfaChallengePush,
          errorInvalidToken, Errors, BrowserFeatures) {

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
      router.on('pageRendered', eventSpy);
      return tick().then(function () {
        return {
          router: router,
          ac: authClient,
          setNextResponse: setNextResponse,
          eventSpy: eventSpy
        };
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
        return tick(test);
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
    itp('initializes xdomain if cors is limited', function () {
      spyOn(xdomain, 'slaves');
      spyOn(BrowserFeatures, 'corsIsLimited').and.returnValue(true);
      return setup().then(function () {
        expect(xdomain.slaves).toHaveBeenCalledWith({
          'https://foo.com': '/cors/proxy'
        });
      });
    });
    itp('manually sets $.support.cors = true if cors is limited', function () {
      spyOn(BrowserFeatures, 'corsIsLimited').and.returnValue(false);
      return setup().then(function () {
        expect($.support.cors).toBe(true);
      });
    });
    itp('does not initialize xdomain if cors is supported fully', function () {
      spyOn(xdomain, 'slaves');
      spyOn(BrowserFeatures, 'corsIsLimited').and.returnValue(false);
      return setup().then(function () {
        expect(xdomain.slaves).not.toHaveBeenCalled();
      });
    });

    itp('invokes success callback if SUCCESS auth status is returned', function () {
      var successSpy = jasmine.createSpy('successSpy');
      return setup({ globalSuccessFn: successSpy })
      .then(function (test) {
        test.setNextResponse(resSuccess);
        test.router.refreshAuthState('dummy-token');
        return tick().then(tick);
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
        return tick().then(tick);
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
    it('calls globalErrorFn on unrecoverable errors if it is defined', function () {
      var errorSpy = jasmine.createSpy('errorSpy');
      var fn = function () {
        setup({ globalErrorFn: errorSpy, foo: 'bar' });
      };
      expect(fn).toThrowError('field not allowed: foo');
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
      expect(fn).toThrowError('Unsupported browser - missing CORS support');
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
        return tick();
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
        return tick();
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
        return tick();
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
        return tick(test);
      })
      .then(function (test) {
        Q.stopUnhandledRejectionTracking();
        test.setNextResponse(errorInvalidToken);
        var form = new RecoveryForm($sandbox);
        form.setAnswer('4444');
        form.submit();
        return tick(test);
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
        return tick();
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
        return tick(test);
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
        // The extra tick is necessary to navigate between the two controllers
        // (RefreshAuthState and MfaVerify)
        return tick().then(function () {
          return tick(test);
        });
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
        return tick(test);
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
        return tick(test);
      }).then(function () {
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
            return tick(test);
          })
          .then(function (test) {
            var form = new PrimaryAuthForm($sandbox);
            expect(form.isPrimaryAuth()).toBe(true);
            test.setNextResponse(resMfaRequiredOktaVerify);
            form.setUsername('testuser');
            form.setPassword('pass');
            form.submit();
            return tick(test);
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
            return tick(test);
          })
          .then(function (test) {
            var form = new PrimaryAuthForm($sandbox);
            expect(form.isPrimaryAuth()).toBe(true);
            test.setNextResponse(resMfaRequiredOktaVerify);
            form.setUsername('testuser');
            form.setPassword('pass');
            form.submit();
            return tick(test);
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
      itp('creates an iframe with the correct url when authStatus is SUCCESS', function () {
        return setupOAuth2().then(function (test) {
          expect(test.iframeElem.src).toBe(
            'https://foo.com/oauth2/v1/authorize?' +
            'client_id=someClientId&' +
            'redirect_uri=https%3A%2F%2F0.0.0.0%3A9999&' +
            'response_type=id_token&' +
            'response_mode=okta_post_message&' +
            'state=' + OIDC_STATE +
            '&nonce=' + OIDC_NONCE +
            '&prompt=none&' +
            'sessionToken=THE_SESSION_TOKEN&' +
            'scope=openid%20email'
          );
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
          Q.stopUnhandledRejectionTracking();
          var args = window.addEventListener.calls.argsFor(0);
          var callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {}
          });
          return tick();
        })
        .fail(function () {
          expect(errorSpy.calls.count()).toBe(1);
          var err = errorSpy.calls.argsFor(0)[0];
          expect(err instanceof Errors.OAuthError).toBe(true);
          expect(err.name).toBe('OAUTH_ERROR');
          expect(err.message).toBe('There was a problem generating the id_token for the user. Please try again.');
        });
      });
    });

    Expect.describe('Events', function () {
      itp('triggers a pageRendered event when first controller is loaded', function() {
        return setup()
        .then(function (test) {
          test.router.primaryAuth();
          return tick(test);
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
            // Wait an extra tick for the animation success function to run
          return tick(test);
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

  });

});
