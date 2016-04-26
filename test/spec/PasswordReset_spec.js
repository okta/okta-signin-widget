/*jshint maxparams:15 */
define([
  'vendor/lib/q',
  'underscore',
  'jquery',
  'vendor/OktaAuth',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/PasswordResetForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/PASSWORD_RESET',
  'helpers/xhr/PASSWORD_RESET_error',
  'helpers/xhr/200',
  'helpers/xhr/SUCCESS'
],
function (Q, _, $, OktaAuth, LoginUtil, Util, PasswordResetForm, Beacon, Expect, Router,
          $sandbox, resPasswordReset, resError, res200, resSuccess) {

  var itp = Expect.itp;
  var tick = Expect.tick;
  var processCredsSpy = jasmine.createSpy();

  function setup(settings) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({uri: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: function () {},
      processCreds: processCredsSpy
    }, settings));
    var form = new PasswordResetForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(resPasswordReset);
    router.refreshAuthState('dummy-token');
    return tick().then(function () {
      return {
        router: router,
        form: form,
        beacon: beacon,
        ac: authClient,
        setNextResponse: setNextResponse
      };
    });
  }

  describe('PasswordReset', function () {
    beforeEach(function () {
      $.fx.off = true;
    });
    afterEach(function () {
      $.fx.off = false;
      $sandbox.empty();
    });
    itp('displays the security beacon if enabled', function () {
      return setup({ 'features.securityImage': true }).then(function (test) {
        expect(test.beacon.isSecurityBeacon()).toBe(true);
      });
    });
    itp('has a signout link which cancels the current stateToken and navigates to primaryAuth', function () {
      return setup()
      .then(function (test) {
        $.ajax.calls.reset();
        test.setNextResponse(res200);
        var $link = test.form.signoutLink();
        expect($link.length).toBe(1);
        $link.click();
        return tick(test);
      })
      .then(function (test) {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/cancel',
          data: {
            stateToken: 'testStateToken'
          }
        });
        expect(test.router.navigate.calls.mostRecent().args)
          .toEqual(['', { trigger: true }]);
      });
    });
    itp('has a password field to enter the new password', function () {
      return setup().then(function (test) {
        Expect.isPasswordField(test.form.newPasswordField());
      });
    });
    itp('has a password field to confirm the new password', function () {
      return setup().then(function (test) {
        Expect.isPasswordField(test.form.confirmPasswordField());
      });
    });
    itp('calls processCreds function before saving a model', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        processCredsSpy.calls.reset();
        test.setNextResponse(resSuccess);
        test.form.setNewPassword('newpwd');
        test.form.setConfirmPassword('newpwd');
        test.form.submit();
        expect(processCredsSpy.calls.count()).toBe(1);
        expect(processCredsSpy).toHaveBeenCalledWith({
          username: 'administrator1@clouditude.net',
          password: 'newpwd'
        });
        expect($.ajax.calls.count()).toBe(1);
      });
    });
    itp('makes the right auth request when form is submitted', function () {
      return setup()
      .then(function (test) {
        $.ajax.calls.reset();
        test.form.setNewPassword('imsorrymsjackson');
        test.form.setConfirmPassword('imsorrymsjackson');
        test.setNextResponse(resSuccess);
        test.form.submit();
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/credentials/reset_password',
          data: {
            newPassword: 'imsorrymsjackson',
            stateToken: 'testStateToken'
          }
        });
      });
    });
    itp('validates that the fields are not empty before submitting', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.submit();
        expect($.ajax).not.toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
        Expect.isEmptyFieldError(test.form.newPassFieldError());
        Expect.isEmptyFieldError(test.form.confirmPassFieldError());
      });
    });
    itp('validates that the passwords match before submitting', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.setNewPassword('a');
        test.form.setConfirmPassword('z');
        test.form.submit();
        expect($.ajax).not.toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
      });
    });
    itp('shows an error msg if there is an error submitting', function () {
      return setup()
      .then(function (test) {
        Q.stopUnhandledRejectionTracking();
        test.setNextResponse(resError);
        test.form.setNewPassword('a');
        test.form.setConfirmPassword('a');
        test.form.submit();
        return tick(test);
      })
      .then(function (test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe(
          'Passwords must have at least 8 characters, a lowercase letter, ' +
          'an uppercase letter, a number, no parts of your username'
        );
      });
    });
  });

});
