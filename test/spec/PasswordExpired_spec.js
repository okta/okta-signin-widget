/* eslint max-params: [2, 25] */
define([
  'vendor/lib/q',
  'underscore',
  'jquery',
  'vendor/OktaAuth',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/PasswordExpiredForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/PASSWORD_WARN',
  'helpers/xhr/PASSWORD_EXPIRED',
  'helpers/xhr/PASSWORD_EXPIRED_error_complexity',
  'helpers/xhr/PASSWORD_EXPIRED_error_oldpass',
  'helpers/xhr/SUCCESS'
],
function (Q, _, $, OktaAuth, LoginUtil, Util, PasswordExpiredForm, Beacon, Expect, Router,
          $sandbox, resPassWarn, resPassExpired, resErrorComplexity,
          resErrorOldPass, resSuccess) {

  var itp = Expect.itp;
  var tick = Expect.tick;
  var processCredsSpy = jasmine.createSpy('processCredsSpy');

  function setup(res) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({uri: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      features: { securityImage: true },
      authClient: authClient,
      globalSuccessFn: function () {},
      processCreds: processCredsSpy
    });
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(res || resPassExpired);
    router.refreshAuthState('dummy-token');
    return tick().then(function () {
      return {
        router: router,
        beacon: new Beacon($sandbox),
        form: new PasswordExpiredForm($sandbox),
        ac: authClient,
        setNextResponse: setNextResponse
      };
    });
  }

  function setupWarn(numDays) {
    resPassWarn.response._embedded.policy.expiration.passwordExpireDays = numDays;
    return setup(resPassWarn);
  }

  function submitNewPass(test, oldPass, newPass, confirmPass) {
    test.form.setOldPass(oldPass);
    test.form.setNewPass(newPass);
    test.form.setConfirmPass(confirmPass);
    test.form.submit();
  }

  describe('PasswordExpiration', function () {

    beforeEach(function () {
      $.fx.off = true;
    });
    afterEach(function () {
      $.fx.off = false;
      $sandbox.empty();
    });

    describe('PasswordExpired', function () {

      itp('shows security beacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('has the correct title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toBe('Your Okta password has expired');
        });
      });
      itp('does not have a subtitle', function () {
        return setup().then(function (test) {
          expect(test.form.subtitle().length).toBe(0);
        });
      });
      itp('has an old password field', function () {
        return setup().then(function (test) {
          Expect.isPasswordField(test.form.oldPassField());
        });
      });
      itp('has a new password field', function () {
        return setup().then(function (test) {
          Expect.isPasswordField(test.form.newPassField());
        });
      });
      itp('has a confirm password field', function () {
        return setup().then(function (test) {
          Expect.isPasswordField(test.form.confirmPassField());
        });
      });
      itp('has a change password button', function () {
        return setup().then(function (test) {
          expect(test.form.submitButton().length).toBe(1);
        });
      });
      itp('has a sign out link', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('does not have a skip link', function () {
        return setup().then(function (test) {
          expect(test.form.skipLink().length).toBe(0);
        });
      });
      itp('calls processCreds function before saving a model', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          processCredsSpy.calls.reset();
          test.setNextResponse(resSuccess);
          submitNewPass(test, 'oldpwd', 'newpwd', 'newpwd');
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'inca@clouditude.net',
            password: 'newpwd'
          });
          expect($.ajax.calls.count()).toBe(1);
        });
      });
      itp('saves the new password successfully', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          submitNewPass(test, 'oldpassyo', 'boopity', 'boopity');
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/credentials/change_password',
            data: {
              oldPassword: 'oldpassyo',
              newPassword: 'boopity',
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('shows an error if the server returns a wrong old pass error', function () {
        return setup()
        .then(function (test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resErrorOldPass);
          submitNewPass(test, 'wrongoldpass', 'boo', 'boo');
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe(
            'We found some errors. Please review the form and make corrections.'
          );
        });
      });
      itp('shows an error if the server returns a complexity error', function () {
        return setup()
        .then(function (test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resErrorComplexity);
          submitNewPass(test, 'oldpassyo', 'badpass', 'badpass');
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
      itp('validates that fields are not empty', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.submit();
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
          Expect.isEmptyFieldError(test.form.oldPassFieldError());
          Expect.isEmptyFieldError(test.form.newPassFieldError());
          Expect.isEmptyFieldError(test.form.confirmPassFieldError());
        });
      });

      itp('validates that new password is equal to confirm password', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          submitNewPass(test, 'newpass', 'differentnewpass');
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.confirmPassFieldError().text())
            .toBe('New passwords must match');
        });
      });

    });

    describe('PasswordAboutToExpire', function () {

      itp('has the correct title if expiring in > 0 days', function () {
        return setupWarn(4).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire in 4 days');
        });
      });
      itp('has the correct title if expiring in 0 days', function () {
        return setupWarn(0).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire later today');
        });
      });
      itp('has the correct subtitle', function () {
        return setupWarn(4).then(function (test) {
          expect(test.form.subtitleText()).toBe('When password expires you may be ' +
            'locked out of Okta Mobile, mobile email, and other services.');
        });
      });
      itp('has a sign out link', function () {
        return setupWarn(4).then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('has a skip link', function () {
        return setupWarn(4).then(function (test) {
          Expect.isVisible(test.form.skipLink());
        });
      });
      itp('goToLink is called with the correct args on skip', function () {
        return setupWarn(4).then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.skip();
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/skip',
            data: {
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('goToLink is called with the correct args on sign out', function () {
        return setupWarn(4).then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.signout();
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/cancel',
            data: {
              stateToken: 'testStateToken'
            }
          });
        });
      });

    });

  });
});
