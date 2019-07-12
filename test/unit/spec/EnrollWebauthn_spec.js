/* eslint max-params: [2, 16] */
define([
  'okta',
  'q',
  '@okta/okta-auth-js/jquery',
  'util/CryptoUtil',
  'util/webauthn',
  'util/BrowserFeatures',
  'helpers/mocks/Util',
  'helpers/dom/EnrollWebauthnForm',
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
  BrowserFeatures,
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

    function setup (startRouter, onlyWebauthn) {
      var settings = {};
      settings['features.webauthn'] = true;

      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl});
      var successSpy = jasmine.createSpy('success');
      var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
      var router = new Router(_.extend({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      }, settings));
      router.on('afterError', afterErrorHandler);
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
        .then(function () {
          setNextResponse(onlyWebauthn ? resWebauthn : resAllFactors);
          return Util.mockIntrospectResponse(router, onlyWebauthn ? resWebauthn : resAllFactors);
        })
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
            successSpy: successSpy,
            afterErrorHandler: afterErrorHandler
          });
        });
    }

    function mockWebauthn (){
      navigator.credentials = { create: function () {} };
    }

    function mockWebauthnSuccessRegistration () {
      mockWebauthn();
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
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

    function mockWebauthnFailureRegistration () {
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
          expect(test.beacon.hasClass('mfa-webauthn')).toBe(true);
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
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(false);

        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(1);
          expect(test.form.errorHtml().html()).toEqual('Security key or built-in authenticator is not supported on this browser.' +
            ' Select another factor or contact your admin for assistance.');
        });
      });

      itp('shows error if browser does not support webauthn and only one factor', function () {
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(false);

        return setup(false, true).then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(1);
          expect(test.form.errorHtml().html()).toEqual('Security key or built-in authenticator is not supported on this browser.' +
            ' Contact your admin for assistance.');
        });
      });

      itp('does not show error if browser supports webauthn', function () {
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(0);
        });
      });

      itp('shows instructions and a register button', function () {
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
        return setup().then(function (test) {
          Expect.isVisible(test.form.enrollInstructions());
          Expect.isVisible(test.form.submitButton());
        });
      });

      itp('shows correct instructions for Edge browser', function () {
        spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
        spyOn(BrowserFeatures, 'isEdge').and.returnValue(true);
        return setup().then(function (test) {
          Expect.isVisible(test.form.enrollInstructions());
          Expect.isVisible(test.form.enrollEdgeInstructions());
          expect(test.form.enrollEdgeInstructions().text()).toEqual('Note: If you are enrolling a security key and' +
          ' Windows Hello or PIN is enabled, you will need to select \'Cancel\' before continuing.');
          Expect.isVisible(test.form.submitButton());
        });
      });

      itp('shows a waiting spinner after submitting the form', function () {
        mockWebauthnSuccessRegistration();
        return setup().then(function (test) {
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
          .then(function (test) {
            Expect.isVisible(test.form.enrollInstructions());
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
                },
                excludeCredentials: [{
                  type: 'public-key',
                  id: CryptoUtil.strToBin('vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt')
                }]
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

      itp('shows error when navigator.credentials.create failed', function () {
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
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'enroll-webauthn'
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
  });
});
