/*jshint maxparams:17, newcap:false */
define([
  'okta',
  'vendor/lib/q',
  'underscore',
  'jquery',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/EnrollWindowsHelloForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'util/webauthn',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_Webauthn',
  'helpers/xhr/SUCCESS'
],
function (Okta,
          Q,
          _,
          $,
          OktaAuth,
          LoginUtil,
          Util,
          Form,
          Beacon,
          Expect,
          $sandbox,
          webauthn,
          Router,
          responseMfaEnrollAll,
          responseMfaEnrollActivateWebauthn,
          responseSuccess) {

  var itp = Expect.itp,
      itpa = Expect.itpa,
      tick = Expect.tick;

  Expect.describe('EnrollWindowsHello', function () {

    function setup() {
      var setNextResponse = Util.mockAjax([responseMfaEnrollAll, responseMfaEnrollActivateWebauthn]);
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var successSpy = jasmine.createSpy('success');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      });
      Util.registerRouter(router);
      Util.mockRouterNavigate(router);
      return tick()
      .then(function () {
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        router.enrollWindowsHello();
        return Expect.waitForEnrollWindowsHello({
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse,
          successSpy: successSpy
        });
      });
    }

    function emulateNotWindows() {
      spyOn(webauthn, 'isAvailable').and.returnValue(false);
      spyOn(webauthn, 'makeCredential');
      spyOn(webauthn, 'getAssertion');
      return Q();
    }

    function emulateWindows(errorType) {
      spyOn(webauthn, 'isAvailable').and.returnValue(true);

      spyOn(webauthn, 'makeCredential').and.callFake(function () {
        var deferred = Q.defer();

        switch (errorType) {
        case 'AbortError':
          deferred.reject({
            message: 'AbortError'
          });
          break;

        case 'NotSupportedError':
          deferred.reject({
            message: 'NotSupportedError'
          });
          break;

        default:
          deferred.resolve({
            credential: {id: 'credentialId'},
            publicKey: 'publicKey'
          });
        }

        return tick(deferred.promise);
      });

      return tick();
    }

    Expect.describe('Header & Footer', function () {
      itpa('displays the correct factorBeacon', function () {
        return emulateNotWindows()
        .then(setup)
        .then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-windows-hello')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function () {
        return emulateNotWindows()
        .then(setup)
        .then(function (test) {
          Expect.isVisible(test.form.backLink());
        });
      });
    });

    Expect.describe('Enroll factor', function () {
      itp('displays error if not Windows', function () {
        return emulateNotWindows()
        .then(setup)
        .then(function (test) {
          expect(test.form.hasErrorWindowsHello()).toBe(true);
          expect(test.form.submitButton().length).toBe(0);
        });
      });

      itpa('does not display error if Windows', function () {
        return emulateWindows()
        .then(setup)
        .then(function (test) {
          expect(test.form.hasErrorWindowsHello()).toBe(false);
          expect(test.form.submitButton().length).toBe(1);
        });
      });

      itp('subtitle changes after submitting the form', function () {
        return emulateWindows()
        .then(setup)
        .then(function (test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.subtitleText())
            .toBe('Click below to enroll Windows Hello as a second form of authentication');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);

          test.form.submit();
          expect(test.form.subtitleText())
            .toBe('Please wait while Windows Hello is loading...');
          expect(test.form.buttonBar().hasClass('hide')).toBe(true);
        });
      });

      itpa('sends enroll request after submitting the form', function () {
        return emulateWindows()
        .then(setup)
        .then(function (test) {
          test.setNextResponse(responseSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'webauthn',
              provider: 'FIDO',
              stateToken: 'testStateToken'
            }
          });
        });
      });

      itp('calls webauthn.makeCredential and activates the factor', function () {
        return emulateWindows()
        .then(setup)
        .then(function (test) {
          test.setNextResponse([responseMfaEnrollActivateWebauthn, responseSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect(webauthn.makeCredential).toHaveBeenCalled();
          expect($.ajax.calls.count()).toBe(3);
          Expect.isJsonPost($.ajax.calls.argsFor(2), {
            url: 'https://foo.com/api/v1/authn/factors/factorId1234/lifecycle/activate',
            data: {
              credentialId: 'credentialId',
              publicKey: 'publicKey',
              stateToken: 'testStateToken',
              attestation: null
            }
          });
        });
      });

      itpa('does not show error if webauthn.makeCredential fails with AbortError', function () {
        return emulateWindows('AbortError')
        .then(setup)
        .then(function (test) {
          test.setNextResponse([responseMfaEnrollActivateWebauthn, responseSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(webauthn.makeCredential, test);
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(2);
          expect(test.form.hasErrorWindowsHello()).toBe(false);
        });
      });

      itp('shows error if webauthn.makeCredential fails with NotSupportedError', function () {
        return emulateWindows('NotSupportedError')
        .then(setup)
        .then(function (test) {
          test.setNextResponse([responseMfaEnrollActivateWebauthn, responseSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(webauthn.makeCredential, test);
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(2);
          expect(test.form.hasErrorWindowsHello()).toBe(true);
        });
      });
    });
  });

});
