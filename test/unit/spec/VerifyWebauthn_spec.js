/* eslint max-params: [2, 16] */

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
  'helpers/xhr/MFA_CHALLENGE_webauthn',
  'helpers/xhr/SUCCESS'
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
          resChallengeWebauthn,
          resSuccess) {

  var { _, $ } = Okta;
  var itp = Expect.itp;

  function createRouter(baseUrl, authClient, successSpy, settings) {
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

  function setup() {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var successSpy = jasmine.createSpy('success');
    var router = createRouter(baseUrl, authClient, successSpy, { 'features.webauthn': true });
    setNextResponse(resAllFactors);
    router.refreshAuthState('dummy-token');
    return Expect.waitForMfaVerify()
      .then(function () {
        setNextResponse(resChallengeWebauthn);
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
          successSpy: successSpy
        };
      });
  }

  var testAuthData = 'c29tZS1yYW5kb20tYXR0ZXN0YXRpb24tb2JqZWN0';
  var testClientData = 'c29tZS1yYW5kb20tY2xpZW50LWRhdGE=';
  var testSignature = 'YWJjZGVmYXNkZmV3YWZrbm1hc2xqZWY=';
  var testCredentialId = 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw';
  var testChallenge = 'kygOUtSWURMv_t_Gj71Y';

  function mockWebauthn() {
    navigator.credentials = {
      get: function () {
      }
    };
  }

  function mockU2fSuccessVerify() {
    window.u2f = { sign: function () {} };

    spyOn(window.u2f, 'sign').and.callFake(function (appId, challenge, registeredKeys, callback) {
      callback({
        signatureData: testSignature,
        clientData: testClientData
      });
    });
  }

  function mockWebauthnSignFailure() {
    spyOn(navigator.credentials, 'get').and.callFake(function () {
      var deferred = Q.defer();
      deferred.reject({ message: 'something went wrong' });
      return deferred.promise;
    });
  }

  function mockWebauthnSignSuccess() {
    spyOn(navigator.credentials, 'get').and.callFake(function () {
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

  function mockWebauthnSignPending() {
    spyOn(navigator.credentials, 'get').and.returnValue(Q.defer().promise);
  }

  function setupWebauthnFactor(options) {
    options || (options = {});

    spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(options.u2fSupported === true);
    spyOn(webauthn, 'isNewApiAvailable').and.returnValue(options.webauthnSupported === true);

    mockWebauthn();
    if (options.signStatus === 'fail') {
      mockWebauthnSignFailure();
    } else if (options.signStatus === 'success') {
      mockWebauthnSignSuccess();
    } else {
      mockWebauthnSignPending();
    }

    return setup();
  }

  function expectHasRightBeaconImage(test, desiredClassName) {
    expect(test.beacon.isFactorBeacon()).toBe(true);
    expect(test.beacon.hasClass(desiredClassName)).toBe(true);
  }

  function expectTitleToBe(test, desiredTitle) {
    expect(test.form.titleText()).toBe(desiredTitle);
  }

  Expect.describe('Webauthn Factor', function () {
    itp('shows the right beacon and title for webauthn', function () {
      return setupWebauthnFactor({webauthnSupported: true, u2fSupported: true}).then(function (test) {
        expectHasRightBeaconImage(test, 'mfa-u2f');
        expectTitleToBe(test, 'Security Key (U2F)');
      });
    });

    itp('shows error if browser does not support webauthn', function () {
      return setupWebauthnFactor({webauthnSupported: false, u2fSupported: false}).then(function (test) {
        expect(test.form.el('o-form-error-html')).toHaveLength(1);
        expect(test.form.el('o-form-error-html').find('strong').html())
          .toEqual('Security Key (U2F) is not supported on this browser. ' +
          'Select another factor or contact your admin for assistance.');
      });
    });

    itp('does not show error if browser supports webauthn', function () {
      return setupWebauthnFactor({webauthnSupported: true, u2fSupported: true}).then(function (test) {
        expect(test.form.el('o-form-error-html')).toHaveLength(0);
      });
    });

    itp('shows a spinner while waiting for webauthn challenge', function () {
      return setupWebauthnFactor({webauthnSupported: true, u2fSupported: true}).then(function (test) {
        expect(test.form.el('u2f-waiting').length).toBe(1);
      });
    });

    itp('has remember device checkbox', function () {
      return setupWebauthnFactor({webauthnSupported: true, u2fSupported: true}).then(function (test) {
        Expect.isVisible(test.form.rememberDeviceCheckbox());
      });
    });

    itp('calls navigator.credentials.get and verifies factor', function () {
      return setupWebauthnFactor({
        webauthnSupported: true,
        u2fSupported: true,
        signStatus: 'success'
      }).then(function (test) {
        test.setNextResponse(resSuccess);
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
          }
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
      });
    });

    itp('shows an error if navigator.credentials.get fails', function () {
      Q.stopUnhandledRejectionTracking();
      return setupWebauthnFactor({
        webauthnSupported: true,
        u2fSupported: true,
        signStatus: 'fail'
      }).then(function (test) {
        return Expect.waitForFormError(test.form, test);
      }).then(function (test) {
        expect(navigator.credentials.get).toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox()).toHaveLength(1);
        expect(test.form.errorMessage()).toEqual('something went wrong');
      });
    });

    itp('calls u2f.verify and verifies factor for non-webauthn supported browsers', function () {
      mockU2fSuccessVerify();
      return setupWebauthnFactor({ webauthnSupported: false, u2fSupported: true }).then(function (test) {
        test.setNextResponse(resSuccess);
        return Expect.waitForSpyCall(test.successSpy);
      }).then(function () {
        expect(window.u2f.sign).toHaveBeenCalledWith(
          'https://foo.com',
          testChallenge,
          [{version: 'U2F_V2', keyHandle: testCredentialId}],
          jasmine.any(Function)
        );
        expect($.ajax.calls.count()).toBe(3);
        Expect.isJsonPost($.ajax.calls.argsFor(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthnFactorId/verify?rememberDevice=false',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            stateToken: 'testStateToken'
          }
        });
      });
    });
  });
});
