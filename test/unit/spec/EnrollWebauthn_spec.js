/* eslint max-params: [2, 16] */
define([
  'okta',
  'q',
  '@okta/okta-auth-js/jquery',
  'util/CryptoUtil',
  'util/webauthn',
  'helpers/mocks/Util',
  'helpers/dom/EnrollU2FForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_webauthn',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_webauthn',
  'helpers/xhr/SUCCESS'
],
function (Okta,
          Q,
          OktaAuth,
          CryptoUtil,
          webauthn,
          Util,
          Form,
          Beacon,
          Expect,
          $sandbox,
          Router,
          resAllFactors,
          resWebauthn,
          resEnrollActivateWebauthn,
          resSuccess) {

  var { _, $ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;
  var testAttestationObject = 'c29tZS1yYW5kb20tYXR0ZXN0YXRpb24tb2JqZWN0';
  var testClientData = 'c29tZS1yYW5kb20tY2xpZW50LWRhdGE=';

  Expect.describe('EnrollWebauthn', function () {

    function setup(startRouter, onlyWebauthn) {
      var settings = {};
      settings['features.webauthn'] = true;

      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl});
      var successSpy = jasmine.createSpy('success');
      var router = new Router(_.extend({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      }, settings));
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
      .then(function () {
        setNextResponse(onlyWebauthn ? resWebauthn : resAllFactors);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        router.enrollWebauthn();
        return Expect.waitForEnrollWebauthn({
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse,
          successSpy: successSpy
        });
      });
    }

    function mockWebauthn(){
      navigator.credentials = { create: function () {} };
    }

    function mockWebauthnSuccessRegistration() {
      mockWebauthn();
      spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(true);
      spyOn(navigator.credentials, 'create').and.callFake(function () {
        var deferred = Q.defer();
        deferred.resolve({
          response: {
            attestationObject: CryptoUtil.strToBin(testAttestationObject),
            clientDataJSON: CryptoUtil.strToBin(testClientData)
          }
        });
        return deferred.promise;
      });
    }

    function mockU2fSuccessRegistration() {
      window.u2f = { register: function () {} };

      spyOn(window.u2f, 'register').and.callFake(function (appId, registerRequests, registeredKeys, callback) {
        callback({
          registrationData: testAttestationObject,
          version: 'U2F_V2',
          challenge: 'G7bIvwrJJ33WCEp6GGSH',
          clientData: testClientData
        });
      });
    }

    function mockWebauthnFailureRegistration() {
      Q.stopUnhandledRejectionTracking();
      mockWebauthn();
      spyOn(navigator.credentials, 'create').and.callFake(function () {
        var deferred = Q.defer();
        deferred.reject({ message: 'something went wrong' });
        return deferred.promise;
      });
    }

    Expect.describe('Header & Footer', function () {
      itp('displays the correct factorBeacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-u2f')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.backLink());
        });
      });
    });

    Expect.describe('Enroll factor', function () {
      itp('shows error if browser does not support webauthn', function () {
        spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(false);

        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(1);
          expect(test.form.errorHtml().html()).toEqual('Security Key (U2F) is not supported on this browser.' +
            ' Select another factor or contact your admin for assistance.');
        });
      });

      itp('shows error if browser does not support webauthn and only one factor', function () {
        spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(false);

        return setup(false, true).then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(1);
          expect(test.form.errorHtml().html()).toEqual('Security Key (U2F) is not supported on this browser.' +
            ' Contact your admin for assistance.');
        });
      });

      itp('does not show error if browser supports webauthn', function () {
        spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(true);
        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(0);
        });
      });

      itp('shows instructions and a register button', function () {
        spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(true);
        return setup().then(function (test) {
          Expect.isVisible(test.form.enrollInstructions());
          Expect.isVisible(test.form.submitButton());
        });
      });

      itp('shows a waiting spinner and devices images after submitting the form', function () {
        mockWebauthnSuccessRegistration();
        return setup().then(function (test) {
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          Expect.isVisible(test.form.enrollWaitingText());
          Expect.isVisible(test.form.enrollDeviceImages());
          Expect.isVisible(test.form.enrollSpinningIcon());
          Expect.isNotVisible(test.form.submitButton());
        });
      });

      itp('sends enroll request after submitting the form', function () {
        mockWebauthnSuccessRegistration();
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              stateToken: 'testStateToken',
              factorType: 'webauthn',
              provider: 'FIDO'
            }
          });
        });
      });

      itp('calls navigator.credentials.create and activates the factor', function () {
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);

        mockWebauthnSuccessRegistration();
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect(navigator.credentials.create).toHaveBeenCalledWith({
            publicKey: {
              rp: {
                name: 'acme'
              },
              user: {
                id: CryptoUtil.strToBin('00u1212qZXXap6Cts0g4'),
                name: 'yuming.cao@okta.com',
                displayName: 'Test User'
              },
              pubKeyCredParams: [{
                type: 'public-key',
                alg: -7
              }],
              challenge: CryptoUtil.strToBin('G7bIvwrJJ33WCEp6GGSH'),
              authenticatorSelection: {
                authenticatorAttachment: 'cross-platform',
                requireResidentKey: false,
                userVerification: 'preferred'
              },
              u2fParams: {
                appid: 'https://test.okta.com'
              }
            }
          });
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate',
            data: {
              attestation: testAttestationObject,
              clientData: testClientData,
              stateToken: 'testStateToken'
            }
          });
        });
      });

      itp('calls u2f.register and activates the factor for non-webauthn supported browsers', function () {
        spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(true);
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(false);

        mockU2fSuccessRegistration();
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect(window.u2f.register).toHaveBeenCalledWith('https://test.okta.com', [{
            version: 'U2F_V2',
            challenge: 'G7bIvwrJJ33WCEp6GGSH'
          }], [], jasmine.any(Function));
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate',
            data: {
              attestation: testAttestationObject,
              clientData: testClientData,
              stateToken: 'testStateToken'
            }
          });
        });
      });

      itp('shows error when navigator.credentials.create failed', function () {
        spyOn(webauthn, 'isWebauthnOrU2fAvailable').and.returnValue(true);
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);

        mockWebauthnFailureRegistration();
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(navigator.credentials.create, test);
        })
        .then(function (test) {
          expect(navigator.credentials.create).toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox()).toHaveLength(1);
          expect(test.form.errorMessage()).toEqual('something went wrong');
        });
      });
    });
  });
});
