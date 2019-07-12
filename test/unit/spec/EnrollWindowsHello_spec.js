/* eslint max-params:[2, 16] */
define([
  'okta',
  'q',
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
  'helpers/xhr/MFA_ENROLL_ACTIVATE_windows_hello',
  'helpers/xhr/SUCCESS'
],
function (Okta,
  Q,
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
  responseMfaEnrollActivateWindowsHello,
  responseSuccess) {

  var { $ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollWindowsHello', function () {

    function setup () {
      var setNextResponse = Util.mockAjax([responseMfaEnrollAll, responseMfaEnrollActivateWindowsHello]);
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
          setNextResponse(responseMfaEnrollAll);
          return Util.mockIntrospectResponse(router, responseMfaEnrollAll);
        })
        .then(function () {
          router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          router.enrollWebauthn();
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

    function emulateNotWindows () {
      spyOn(webauthn, 'isAvailable').and.returnValue(false);
      spyOn(webauthn, 'makeCredential');
      spyOn(webauthn, 'getAssertion');
      return Q();
    }

    function emulateWindows (errorType) {
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

        return deferred.promise;
      });

      return Q();
    }

    describe('Header & Footer', function () {
      itp('displays the correct factorBeacon', function () {
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

    describe('Enroll factor', function () {
      itp('displays error if not Windows', function () {
        return emulateNotWindows()
          .then(setup)
          .then(function (test) {
            expect(test.form.hasErrorHtml()).toBe(true);
            expect(test.form.submitButton().length).toBe(0);
          });
      });

      itp('does not display error if Windows', function () {
        return emulateWindows()
          .then(setup)
          .then(function (test) {
            expect(test.form.hasErrorHtml()).toBe(false);
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

      itp('sends enroll request after submitting the form', function () {
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
            test.setNextResponse([responseMfaEnrollActivateWindowsHello, responseSuccess]);
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

      itp('does not show error if webauthn.makeCredential fails with AbortError', function () {
        return emulateWindows('AbortError')
          .then(setup)
          .then(function (test) {
            test.setNextResponse([responseMfaEnrollActivateWindowsHello, responseSuccess]);
            test.form.submit();
            expect(test.form.subtitleText()).toBe('Please wait while Windows Hello is loading...');
            return Expect.wait(function () {
              return test.form.$('.o-form-button-bar').hasClass('hide') === false;
            }, test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(2);
            expect(test.form.subtitleText()).toBe('Click below to enroll Windows Hello as a second form of authentication');
            expect(test.form.hasErrorHtml()).toBe(false);
          });
      });

      itp('shows error if webauthn.makeCredential fails with NotSupportedError', function () {
        return emulateWindows('NotSupportedError')
          .then(setup)
          .then(function (test) {
            test.setNextResponse([responseMfaEnrollActivateWindowsHello, responseSuccess]);
            test.form.submit();
            expect(test.form.subtitleText()).toBe('Please wait while Windows Hello is loading...');
            return Expect.wait(function () {
              return test.form.$('.o-form-button-bar').hasClass('hide') === false;
            }, test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(2);
            expect(test.form.subtitleText()).toBe('Click below to enroll Windows Hello as a second form of authentication');
            expect(test.form.hasErrorHtml()).toBe(true);
          });
      });
    });
  });

});
