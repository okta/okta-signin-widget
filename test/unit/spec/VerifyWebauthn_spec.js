/* eslint max-params: [2, 19] */

define([
  'okta',
  'q',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'util/CryptoUtil',
  'helpers/mocks/Util',
  'helpers/dom/MfaVerifyForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'util/webauthn',
  'helpers/xhr/MFA_REQUIRED_allFactors',
  'helpers/xhr/MFA_REQUIRED_multipleWebauthn_question',
  'helpers/xhr/MFA_REQUIRED_multipleWebauthn',
  'helpers/xhr/MFA_CHALLENGE_webauthn',
  'helpers/xhr/MFA_CHALLENGE_multipleWebauthn',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/CANCEL'
],
function (Okta,
  Q,
  OktaAuth,
  LoginUtil,
  CryptoUtil,
  Util,
  MfaVerifyForm,
  Beacon,
  Expect,
  Router,
  $sandbox,
  webauthn,
  resAllFactors,
  resMultipleWebauthnWithQuestion,
  resMultipleWebauthn,
  resChallengeWebauthn,
  resChallengeMultipleWebauthn,
  resSuccess,
  resCancel) {

  var { _, $ } = Okta;
  var itp = Expect.itp;

  function createRouter (baseUrl, authClient, successSpy, settings) {
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    return router;
  }
  
  var Factors = {
    'WEBAUTHN' : 0,
    'QUESTION' : 1,
  };

  function clickFactorInDropdown (test, factorName) {
    test.beacon.getOptionsLinks().eq(Factors[factorName]).click();
  }

  function setup (options) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var successSpy = jasmine.createSpy('success');
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var router = createRouter(baseUrl, authClient, successSpy, { 'features.webauthn': true });
    router.on('afterError', afterErrorHandler);
    setNextResponse(options.multipleWebauthn ? [resMultipleWebauthnWithQuestion] : [resAllFactors]);
    return Util.mockIntrospectResponse(router, resAllFactors).then(function () {
      router.refreshAuthState('dummy-token');
      return Expect.waitForMfaVerify()
        .then(function () {
          var responses = options.multipleWebauthn ? [resChallengeMultipleWebauthn] : [resChallengeWebauthn];
          if (options.signStatus === 'success') {
            responses.push(resSuccess);
          }
          setNextResponse(responses);
          router.verifyWebauthn();
          return Expect.waitForVerifyWebauthn();
        })
        .then(function () {
          var $forms = $sandbox.find('.o-form');
          var forms = _.map($forms, function (form) {
            return new MfaVerifyForm($(form));
          });
          if (forms.length === 1) {
            forms = forms[0];
          }
          var beacon = new Beacon($sandbox);
          return {
            router: router,
            form: forms,
            beacon: beacon,
            ac: authClient,
            setNextResponse: setNextResponse,
            successSpy: successSpy,
            afterErrorHandler: afterErrorHandler
          };
        });
    });
  }

  var testAuthData = 'c29tZS1yYW5kb20tYXR0ZXN0YXRpb24tb2JqZWN0';
  var testClientData = 'c29tZS1yYW5kb20tY2xpZW50LWRhdGE=';
  var testSignature = 'YWJjZGVmYXNkZmV3YWZrbm1hc2xqZWY=';
  var testCredentialId = 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw';
  var testChallenge = 'kygOUtSWURMv_t_Gj71Y';

  function mockWebauthn (options) {
    if (options.webauthnSupported) {
      navigator.credentials = {
        get: jasmine.createSpy('webauthn-spy')
      };
      if (options.signStatus === 'fail') {
        mockWebauthnSignFailure();
      } else if (options.signStatus === 'success') {
        mockWebauthnSignSuccess(options.rememberDevice);
      } else {
        mockWebauthnSignPending();
      }
    }
    else {
      delete navigator.credentials;
    }
  }

  function mockWebauthnSignFailure () {
    spyOn(navigator.credentials, 'get').and.callFake(function () {
      var deferred = Q.defer();
      deferred.reject({ message: 'something went wrong' });
      return deferred.promise;
    });
  }

  function mockWebauthnSignSuccess (rememberDevice) {
    spyOn(navigator.credentials, 'get').and.callFake(function () {
      if(rememberDevice) {
        $('[name=rememberDevice]').prop('checked', true);
        $('[name=rememberDevice]').trigger('change');
      }
      var deferred = Q.defer();
      deferred.resolve({
        response: {
          signature: CryptoUtil.strToBin(testSignature),
          clientDataJSON: CryptoUtil.strToBin(testClientData),
          authenticatorData: CryptoUtil.strToBin(testAuthData)
        }
      });
      return deferred.promise;
    });
  }

  function mockWebauthnSignPending () {
    spyOn(navigator.credentials, 'get').and.returnValue(Q.defer().promise);
  }

  function setupWebauthnFactor (options) {
    options || (options = {});
    spyOn(webauthn, 'isNewApiAvailable').and.returnValue(options.webauthnSupported === true);

    mockWebauthn(options);
    return setup(options);
  }

  function setupMultipleWebauthnOnly (options) {
    options || (options = {});
    options.multipleWebauthn = true;
    spyOn(webauthn, 'isNewApiAvailable').and.returnValue(options.webauthnSupported === true);

    mockWebauthn(options);
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var successSpy = jasmine.createSpy('success');
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var router = createRouter(baseUrl, authClient, successSpy, { 'features.webauthn': true });
    router.on('afterError', afterErrorHandler);
    var responses = [resMultipleWebauthn, resChallengeMultipleWebauthn];
    if (options.signStatus === 'success') {
      responses.push(resSuccess);
    }
    setNextResponse(responses);
    return Util.mockIntrospectResponse(router, responses).then(function () {
      router.refreshAuthState('dummy-token');
      return Expect.waitForVerifyWebauthn().then(function () {
        var $forms = $sandbox.find('.o-form');
        var forms = _.map($forms, function (form) {
          return new MfaVerifyForm($(form));
        });
        if (forms.length === 1) {
          forms = forms[0];
        }
        var beacon = new Beacon($sandbox);
        return {
          router: router,
          form: forms,
          beacon: beacon,
          ac: authClient,
          setNextResponse: setNextResponse,
          successSpy: successSpy,
          afterErrorHandler: afterErrorHandler
        };
      });
    });
  }

  function setupMultipleWebauthn (options) {
    options || (options = {});
    options.multipleWebauthn = true;
    return setupWebauthnFactor(options);
  }

  function expectHasRightBeaconImage (test, desiredClassName) {
    expect(test.beacon.isFactorBeacon()).toBe(true);
    expect(test.beacon.hasClass(desiredClassName)).toBe(true);
  }

  function expectTitleToBe (test, desiredTitle) {
    expect(test.form.titleText()).toBe(desiredTitle);
  }

  function testWebauthnFactor (setupFn, webauthnOnly) {
    itp('shows the right beacon and title for webauthn', function () {
      return setupFn({webauthnSupported: true}).then(function (test) {
        expectHasRightBeaconImage(test, 'mfa-webauthn');
        expectTitleToBe(test, 'Security Key or Biometric Authenticator');
      });
    });

    itp('shows error if browser does not support webauthn', function () {
      return setupFn({webauthnSupported: false}).then(function (test) {
        expect(test.form.el('o-form-error-html')).toHaveLength(1);
        var errorMessage = webauthnOnly ?
          'Security key or biometric authenticator is not supported on this browser. ' +
          'Contact your admin for assistance.' :
          'Security key or biometric authenticator is not supported on this browser. ' +
          'Select another factor or contact your admin for assistance.';
        expect(test.form.el('o-form-error-html').find('strong').html())
          .toEqual(errorMessage);
      });
    });

    itp('does not show error if browser supports webauthn', function () {
      return setupFn({webauthnSupported: true}).then(function (test) {
        expect(test.form.el('o-form-error-html')).toHaveLength(0);
      });
    });

    itp('shows a spinner while waiting for webauthn challenge', function () {
      return setupFn({webauthnSupported: true}).then(function (test) {
        expect(test.form.el('webauthn-waiting').length).toBe(1);
      });
    });

    itp('has remember device checkbox', function () {
      return setupFn({webauthnSupported: true}).then(function (test) {
        Expect.isVisible(test.form.rememberDeviceCheckbox());
      });
    });
  }

  function testMultipleWebauthnFactor (setupFn) {
    itp('calls navigator.credentials.get and verifies factor', function () {
      return setupFn({
        webauthnSupported: true,
        signStatus: 'success'
      }).then(function (test) {
        return Expect.waitForSpyCall(test.successSpy);
      }).then(function () {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [{
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            },
            {
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            },
            {
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            }],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com'
            }
          },
          signal: jasmine.any(Object)
        });
        expect($.ajax.calls.count()).toBe(3);
        Expect.isJsonPost($.ajax.calls.argsFor(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthn/verify?rememberDevice=false',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken'
          }
        });
      });
    });

    itp('calls navigator.credentials.get and verifies factor when rememberDevice set to true', function () {
      return setupFn({
        webauthnSupported: true,
        signStatus: 'success',
        rememberDevice: true
      }).then(function (test) {
        return Expect.waitForSpyCall(test.successSpy);
      }).then(function () {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [{
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            },
            {
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            },
            {
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            }],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com'
            }
          },
          signal: jasmine.any(Object)
        });
        expect($.ajax.calls.count()).toBe(3);
        Expect.isJsonPost($.ajax.calls.argsFor(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthn/verify?rememberDevice=true',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken'
          }
        });
      });
    });

    itp('shows an error if navigator.credentials.get fails', function () {
      Q.stopUnhandledRejectionTracking();
      return setupFn({
        webauthnSupported: true,
        signStatus: 'fail'
      }).then(function (test) {
        return Expect.waitForFormError(test.form, test);
      }).then(function (test) {
        expect(navigator.credentials.get).toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox()).toHaveLength(1);
        expect(test.form.errorMessage()).toEqual('something went wrong');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'mfa-verify verify-webauthn'
          },
          {
            name: 'WEB_AUTHN_ERROR',
            message: 'something went wrong',
            xhr: {
              responseJSON: {
                errorSummary: 'something went wrong'
              }
            }
          }
        ]);
      });
    });
  }

  Expect.describe('Webauthn Factor', function () {
    testWebauthnFactor(setupWebauthnFactor);

    itp('calls navigator.credentials.get and verifies factor', function () {
      return setupWebauthnFactor({
        webauthnSupported: true,
        signStatus: 'success'
      }).then(function (test) {
        return Expect.waitForSpyCall(test.successSpy, test);
      }).then(function (test) {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [{
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            }],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com'
            }
          },
          signal: jasmine.any(Object)
        });
        expect($.ajax.calls.count()).toBe(3);
        Expect.isJsonPost($.ajax.calls.argsFor(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthnFactorId/verify?rememberDevice=false',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken'
          }
        });
        expect(test.router.controller.model.webauthnAbortController).toBe(null);
      });
    });

    itp('calls navigator.credentials.get and verifies factor when rememberDevice set to true', function () {
      return setupWebauthnFactor({
        webauthnSupported: true,
        signStatus: 'success',
        rememberDevice: true
      }).then(function (test) {
        return Expect.waitForSpyCall(test.successSpy);
      }).then(function () {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [{
              type: 'public-key',
              id: CryptoUtil.strToBin(testCredentialId)
            }],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com'
            }
          },
          signal: jasmine.any(Object)
        });
        expect($.ajax.calls.count()).toBe(3);
        Expect.isJsonPost($.ajax.calls.argsFor(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthnFactorId/verify?rememberDevice=true',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken'
          }
        });
      });
    });

    itp('shows an error if navigator.credentials.get fails', function () {
      Q.stopUnhandledRejectionTracking();
      return setupWebauthnFactor({
        webauthnSupported: true,
        signStatus: 'fail'
      }).then(function (test) {
        return Expect.waitForFormError(test.form, test);
      }).then(function (test) {
        expect(navigator.credentials.get).toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox()).toHaveLength(1);
        expect(test.form.errorMessage()).toEqual('something went wrong');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.router.controller.model.webauthnAbortController).toBe(null);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'mfa-verify verify-webauthn'
          },
          {
            name: 'WEB_AUTHN_ERROR',
            message: 'something went wrong',
            xhr: {
              responseJSON: {
                errorSummary: 'something went wrong'
              }
            }
          }
        ]);
      });
    });
  });

  Expect.describe('Only multiple Webauthn is setup', function () {
    testWebauthnFactor(setupMultipleWebauthnOnly, true);
    testMultipleWebauthnFactor(setupMultipleWebauthnOnly);
  });

  Expect.describe('Multiple Webauthn and one or more factors are setup', function () {
    testWebauthnFactor(setupMultipleWebauthn);
    testMultipleWebauthnFactor(setupMultipleWebauthn);

    itp('switching to another factor after initiating webauthn verify calls abort', function () {
      return setupMultipleWebauthn({webauthnSupported: true}).then(function (test) {
        return Expect.waitForSpyCall(navigator.credentials.get, test);
      }).then(function (test) {
        expect(test.form.el('webauthn-waiting').length).toBe(1);
        var webauthnAbortController = test.router.controller.model.webauthnAbortController;
        expect(webauthnAbortController).toBeDefined();
        spyOn(webauthnAbortController, 'abort').and.callThrough();
        clickFactorInDropdown(test, 'QUESTION');
        expect(test.router.navigate).toHaveBeenCalledWith('signin/verify/okta/question', { trigger: true });
        expect(test.router.controller.model.webauthnAbortController).not.toBeDefined();
        expect(webauthnAbortController.abort).toHaveBeenCalled();
      });
    });

    itp('SignOut after initiating webauthn verify calls abort', function () {
      return setupMultipleWebauthn({webauthnSupported: true}).then(function (test) {
        return Expect.waitForSpyCall(navigator.credentials.get, test);
      }).then(function (test) {
        expect(test.form.el('webauthn-waiting').length).toBe(1);
        test.webauthnAbortController = test.router.controller.model.webauthnAbortController;
        expect(test.webauthnAbortController).toBeDefined();
        spyOn(test.webauthnAbortController, 'abort').and.callThrough();
        test.setNextResponse([resCancel]);
        test.form.signoutLink(test.router.el).click();
        return Expect.waitForPrimaryAuth(test);
      }).then(function (test) {
        expect(test.router.controller.model.webauthnAbortController).not.toBeDefined();
        expect(test.webauthnAbortController.abort).toHaveBeenCalled();
      });
    });
  });
});
