/* eslint max-params: [2, 17], max-statements:[2, 33] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/util/Expect',
  'helpers/dom/Beacon',
  'helpers/dom/RegistrationForm',
  'LoginRouter',
  'sandbox'
],
function (Q, _, $, OktaAuth, Util, Expect, Beacon, RegistrationForm, Router, $sandbox) {

  var itp = Expect.itp;

  function setup(settings) {
    settings || (settings = {});
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
    var form = new RegistrationForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    router.register();
    return Expect.waitForRegistration({
      router: router,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse
    });
  }

  Expect.describe('Registration', function () {

    Expect.describe('settings', function () {
      itp('uses default title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toEqual('Create Account');
        });
      });
      itp('uses default for submit', function () {
        return setup().then(function (test) {
          expect(test.form.submitButtonText()).toEqual('Register');
        });
      });
    });

    Expect.describe('elements', function () {
      itp('has a firstname field', function () {
        return setup().then(function (test) {
          var firstname = test.form.firstnameField();
          expect(firstname.length).toBe(1);
          expect(firstname.attr('type')).toEqual('text');
        });
      });
      itp('has a lastname field', function () {
        return setup().then(function (test) {
          var lastname = test.form.lastnameField();
          expect(lastname.length).toBe(1);
          expect(lastname.attr('type')).toEqual('text');
        });
      });
      itp('has a email field', function () {
        return setup().then(function (test) {
          var email = test.form.emailField();
          expect(email.length).toBe(1);
          expect(email.attr('type')).toEqual('text');
        });
      });
      itp('has a password field', function () {
        return setup().then(function (test) {
          var password = test.form.passwordField();
          expect(password.length).toBe(1);
          expect(password.attr('type')).toEqual('password');
        });
      });
    });

    Expect.describe('events', function () {
      itp('shows an error if email is empty and register', function () {
        return setup().then(function (test) {
          test.form.submit();
          expect(test.form.emailErrorField().length).toBe(1);
        });
      });
      itp('shows an error if firstname is too long', function () {
        return setup().then(function (test) {
          test.form.setFirstname(Util.LoremIpsum);
          test.form.submit();
          expect(test.form.firstnameErrorField().length).toBe(1);
        });
      });
    });

  });

});
