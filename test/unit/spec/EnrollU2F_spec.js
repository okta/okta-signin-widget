/*jshint maxparams:11 */
define([
  'okta',
  'jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/EnrollU2FForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_u2f'
],
function (Okta,
          $,
          OktaAuth,
          Util,
          Form,
          Beacon,
          Expect,
          $sandbox,
          Router,
          resAllFactors,
          resEnrollActivateU2F) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollSecurityKey(U2F)', function () {

    function setup(startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl});
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: function () {}
      });
      Util.mockRouterNavigate(router, startRouter);
      return tick()
      .then(function () {
        setNextResponse(resAllFactors);
        router.refreshAuthState('dummy-token');
        return tick();
      })
      .then(function () {
        router.enrollU2F();
        return tick();
      })
      .then(function () {
        return {
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse
        };
      });
    }

    function mocku2fSuccessRegistration() {
      window.u2f = {
        register: function (appId, registerRequests, registeredKeys, callback) {
          callback({
            registrationData: 'someRegistrationData',
            version: 'U2F_V2',
            challenge: 'NONCE',
            clientData: 'someClientData'
          });
        }
      };
      spyOn(window.u2f, 'register').and.callThrough();
    }

    function mocku2fFailedRegistration() {
      window.u2f = {
        register: function (appId, registerRequests, registeredKeys, callback) {
          callback({ errorCode: '2' });
        }
      };
      spyOn(window.u2f, 'register').and.callThrough();
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
      itp('shows instructions and a register button', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.enrollInstructions());
          Expect.isVisible(test.form.submitButton());
        });
      });

      itp('shows a waiting spinner and devices images after submitting the form', function () {
        return setup().then(function (test) {
          test.setNextResponse(resEnrollActivateU2F);
          test.form.submit();
          Expect.isVisible(test.form.enrollWaitingText());
          Expect.isVisible(test.form.enrollDeviceImages());
          Expect.isVisible(test.form.enrollSpinningIcon());
          Expect.isNotVisible(test.form.submitButton());
        });
      });

      itp('sends enroll request after submitting the form', function () {
        return setup().then(function (test) {
          test.setNextResponse(resEnrollActivateU2F);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              stateToken: 'testStateToken',
              factorType: 'u2f',
              provider: 'FIDO'
            }
          });
        });
      });

      itp('calls u2f.register and activates the factor', function () {
        mocku2fSuccessRegistration();
        return setup().then(function (test) {
          test.setNextResponse(resEnrollActivateU2F);
          test.form.submit();
          return tick(test);
        })
        .then(function () {
          expect(window.u2f.register).toHaveBeenCalled();
          expect($.ajax.calls.count()).toBe(3);
          Expect.isJsonPost($.ajax.calls.argsFor(2), {
            url: 'https://test.okta.com/api/v1/authn/factors/u2fFactorId/lifecycle/activate',
            data: {
              registrationData: 'someRegistrationData',
              version: 'U2F_V2',
              challenge: 'NONCE',
              clientData: 'someClientData',
              stateToken: 'testStateToken'
            }
          });
        });
      });

      itp('shows error if u2f.register fails', function () {
        mocku2fFailedRegistration();
        return setup().then(function (test) {
          test.setNextResponse(resEnrollActivateU2F);
          test.form.submit();
          return tick(test);
        })
        .then(function (test) {
          expect(window.u2f.register).toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
        });
      });
    });
  });

});
