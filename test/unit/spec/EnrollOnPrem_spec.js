/*jshint maxparams:15 */
define([
  'vendor/lib/q',
  'underscore',
  'jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/EnrollTokenFactorForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_allFactors_OnPrem',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_OnPrem_error',
  'helpers/xhr/SUCCESS',
  'LoginRouter'
],
function (Q, _, $, OktaAuth, Util, Form, Beacon, Expect, $sandbox,
          resAllFactors, resAllFactorsOnPrem, resEnrollError, resSuccess, Router) {

  var itp = Expect.itp,
      itpa = Expect.itpa,
      tick = Expect.tick;

  Expect.describe('EnrollOnPrem', function () {

    function setup(includeOnPrem, startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl});
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: function () {}
      });
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
      .then(function () {
        var res = includeOnPrem ? resAllFactorsOnPrem : resAllFactors;
        setNextResponse(res);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        var test = {
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse
        };
        if (includeOnPrem) {
          router.enrollOnPrem();
          return Expect.waitForEnrollOnPrem(test);
        } else {
          router.enrollRsa();
          return Expect.waitForEnrollRsa(test);
        }
      });
    }

    var setupOnPrem = _.partial(setup, true);

    Expect.describe('RSA', function () {

      Expect.describe('Header & Footer', function () {
        itpa('displays the correct factorBeacon', function () {
          return setup().then(function (test) {
            expect(test.beacon.isFactorBeacon()).toBe(true);
            expect(test.beacon.hasClass('mfa-rsa')).toBe(true);
          });
        });
        itp('has a "back" link in the footer', function () {
          return setup().then(function (test) {
            Expect.isVisible(test.form.backLink());
          });
        });
        itp('does not allow autocomplete', function () {
          return setup().then(function (test) {
              expect(test.form.getCodeFieldAutocomplete()).toBe('off');
            });
        });
        itp('returns to factor list when browser\'s back button is clicked', function () {
          return setup(false, true).then(function (test) {
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
          .then(function (test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
        });
      });

      Expect.describe('Enroll factor', function () {
        itp('has a credentialId text field', function () {
          return setup().then(function (test) {
            Expect.isTextField(test.form.credentialIdField());
          });
        });
        itp('has passCode text field', function () {
          return setup().then(function (test) {
            Expect.isPasswordField(test.form.codeField());
          });
        });
        itp('has a verify button', function () {
          return setup().then(function (test) {
            Expect.isVisible(test.form.submitButton());
          });
        });
        itpa('does not send request and shows error if code is not entered', function () {
          return setup().then(function (test) {
            $.ajax.calls.reset();
            test.form.setCredentialId('Username');
            test.form.submit();
            expect(test.form.hasErrors()).toBe(true);
            expect($.ajax).not.toHaveBeenCalled();
          });
        });
        itpa('shows error in case of an error response', function () {
          return setup()
          .then(function (test) {
            test.setNextResponse(resEnrollError);
            test.form.setCredentialId('Username');
            test.form.setCode(123);
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            // Note: This will change when we get field specific error messages
            expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
          });
        });
        itp('calls activate with the right params', function () {
          return setup().then(function (test) {
            $.ajax.calls.reset();
            test.form.setCredentialId('Username');
            test.form.setCode(123456);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'token',
                provider: 'RSA',
                passCode: '123456',
                profile: {credentialId: 'Username'},
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });
    });

    Expect.describe('On Prem (custom)', function () {

      Expect.describe('Header & Footer', function () {
        itpa('displays the correct factorBeacon', function () {
          return setupOnPrem().then(function (test) {
            expect(test.beacon.isFactorBeacon()).toBe(true);
            expect(test.beacon.hasClass('mfa-onprem')).toBe(true);
          });
        });
        itp('has a "back" link in the footer', function () {
          return setupOnPrem().then(function (test) {
            Expect.isVisible(test.form.backLink());
          });
        });
        itp('does not allow autocomplete', function () {
          return setupOnPrem().then(function (test) {
            expect(test.form.getCodeFieldAutocomplete()).toBe('off');
          });
        });
        itp('returns to factor list when browser\'s back button is clicked', function () {
          return setupOnPrem(true).then(function (test) {
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
          .then(function (test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
        });
      });

      Expect.describe('Enroll factor', function () {
        itpa('has a credentialId text field', function () {
          return setupOnPrem().then(function (test) {
            Expect.isTextField(test.form.credentialIdField());
          });
        });
        itp('has passCode text field', function () {
          return setupOnPrem().then(function (test) {
            Expect.isPasswordField(test.form.codeField());
          });
        });
        itp('has a verify button', function () {
          return setupOnPrem().then(function (test) {
            Expect.isVisible(test.form.submitButton());
          });
        });
        itp('does not send request and shows error if code is not entered', function () {
          return setupOnPrem().then(function (test) {
            $.ajax.calls.reset();
            test.form.setCredentialId('Username');
            test.form.submit();
            expect(test.form.hasErrors()).toBe(true);
            expect($.ajax).not.toHaveBeenCalled();
          });
        });
        itpa('shows error in case of an error response', function () {
          return setupOnPrem()
          .then(function (test) {
            test.setNextResponse(resEnrollError);
            test.form.setCredentialId('Username');
            test.form.setCode(123);
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            // Note: This will change when we get field specific error messages
            expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
          });
        });
        itp('calls activate with the right params', function () {
          return setupOnPrem().then(function (test) {
            $.ajax.calls.reset();
            test.form.setCredentialId('Username');
            test.form.setCode(123456);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'token',
                provider: 'DEL_OATH',
                passCode: '123456',
                profile: {credentialId: 'Username'},
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });
    });

  });
});
