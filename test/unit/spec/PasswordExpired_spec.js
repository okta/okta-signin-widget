/* eslint max-params: [2, 19], max-statements: [2, 22] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
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
  'helpers/xhr/CUSTOM_PASSWORD_WARN',
  'helpers/xhr/CUSTOM_PASSWORD_EXPIRED',
  'helpers/xhr/SUCCESS'
],
function (Okta, OktaAuth, LoginUtil, Util, PasswordExpiredForm, Beacon, Expect, Router,
          $sandbox, resPassWarn, resPassExpired, resErrorComplexity,
          resErrorOldPass, resCustomPassWarn, resCustomPassExpired, resSuccess) {

  var { _, $ } = Okta;
  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;
  var tick = Expect.tick;

  function deepClone(res) {
    return JSON.parse(JSON.stringify(res));
  }

  function setup(settings, res, custom) {
    settings || (settings = {});
    var successSpy = jasmine.createSpy('successSpy');
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      features: { securityImage: true, customExpiredPassword: custom },
      authClient: authClient,
      globalSuccessFn: successSpy,
      processCreds: settings.processCreds
    }, settings));
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(res || resPassExpired);
    router.refreshAuthState('dummy-token');
    settings = {
      router: router,
      successSpy: successSpy,
      beacon: new Beacon($sandbox),
      form: new PasswordExpiredForm($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse
    };
    if(custom) {
      return Expect.waitForCustomPasswordExpired(settings);
    }
    return Expect.waitForPasswordExpired(settings);
  }

  function setupWarn(numDays) {
    resPassWarn.response._embedded.policy.expiration.passwordExpireDays = numDays;
    return setup(undefined, resPassWarn);
  }

  function setupCustomExpiredPassword(res) {
    return setup(undefined, res || resCustomPassExpired, true);
  }

  function setupCustomExpiredPasswordWarn(numDays) {
    resCustomPassWarn.response._embedded.policy.expiration.passwordExpireDays = numDays;
    return setupCustomExpiredPassword(resCustomPassWarn);
  }

  function submitNewPass(test, oldPass, newPass, confirmPass) {
    test.form.setOldPass(oldPass);
    test.form.setNewPass(newPass);
    test.form.setConfirmPass(confirmPass);
    test.form.submit();
  }

  function setupExcludeAttributes(excludeAttributesArray) {
    var passwordExpiredResponse = deepClone(resPassExpired);
    var policyComplexity = passwordExpiredResponse.response._embedded.policy.complexity;
    policyComplexity.excludeAttributes = excludeAttributesArray;
    return setup(undefined, passwordExpiredResponse);
  }

  Expect.describe('PasswordExpiration', function () {

    Expect.describe('PasswordExpired', function () {

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
      itp('has a valid subtitle', function () {
        return setup().then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your first name, does not include your last name.');
        });
      });
      itp('has a valid subtitle if only excludeAttributes["firstName"] is defined', function () {
        return setupExcludeAttributes(['firstName']).then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your first name.');
        });
      });
      itp('has a valid subtitle if only excludeAttributes["lastName"] is defined', function () {
        return setupExcludeAttributes(['lastName']).then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your last name.');
        });
      });
      itp('has a valid subtitle if only excludeAttributes[] is defined', function () {
        return setupExcludeAttributes([]).then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username.');
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
      itp('has a signout link which cancels the current stateToken and navigates to primaryAuth', function () {
        return setup().then(function (test) {
          spyOn(SharedUtil, 'redirect');
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.signout();
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
          Expect.isPrimaryAuth(test.router.controller);
        });
      });
      itp('has a signout link which cancels the current stateToken and redirects to the provided signout url',
      function () {
        return setup({ signOutLink: 'http://www.goodbye.com' }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.signout();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/cancel',
            data: {
              stateToken: 'testStateToken'
            }
          });
          expect(SharedUtil.redirect).toHaveBeenCalledWith('http://www.goodbye.com');
        });
      });
      itp('calls processCreds function before saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCredsSpy');
        return setup({ processCreds: processCredsSpy })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          submitNewPass(test, 'oldpwd', 'newpwd', 'newpwd');
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'inca@clouditude.net',
            password: 'newpwd'
          });
          expect($.ajax.calls.count()).toBe(1);
        });
      });
      itp('calls async processCreds function before saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCredsSpy');
        return setup({
          processCreds: function (creds, callback) {
            processCredsSpy(creds, callback);
            callback();
          }
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          submitNewPass(test, 'oldpwd', 'newpwd', 'newpwd');
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'inca@clouditude.net',
            password: 'newpwd'
          }, jasmine.any(Function));
          expect($.ajax.calls.count()).toBe(1);
        });
      });
      itp('calls async processCreds function and can prevent saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCredsSpy');
        return setup({
          processCreds: function (creds, callback) {
            processCredsSpy(creds, callback);
          }
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          submitNewPass(test, 'oldpwd', 'newpwd', 'newpwd');
          return tick();
        })
        .then(function() {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'inca@clouditude.net',
            password: 'newpwd'
          }, jasmine.any(Function));
          expect($.ajax.calls.count()).toBe(0);
        });
      });
      itp('saves the new password successfully', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          submitNewPass(test, 'oldpassyo', 'boopity', 'boopity');
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
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
          test.setNextResponse(resErrorOldPass);
          submitNewPass(test, 'wrongoldpass', 'boo', 'boo');
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe(
            'Old password is not correct'
          );
        });
      });
      itp('shows an error if the server returns a complexity error', function () {
        return setup()
        .then(function (test) {
          test.setNextResponse(resErrorComplexity);
          submitNewPass(test, 'oldpassyo', 'badpass', 'badpass');
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe(
            'Password requirements were not met. Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, no parts of your username,' +
            ' does not include your first name, does not include your last name.'
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

    Expect.describe('CustomPasswordExpired', function () {

      itp('shows security beacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('has the correct title', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.titleText()).toBe('Your Okta password has expired');
        });
      });
      itp('has a valid subtitle', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.subtitleText()).toEqual('This password is set on another website. ' +
              'Click the button below to go there and set a new password.');
        });
      });
      itp('has a custom change password button', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.customButton().length).toBe(1);
        });
      });
      itp('has a valid custom button text', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.customButtonText()).toEqual('Go to Twitter');
        });
      });
      itp('has a sign out link', function () {
        return setupCustomExpiredPassword().then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('does not have a skip link', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.skipLink().length).toBe(0);
        });
      });
      itp('redirect is called with the correct arg on custom button click', function () {
        spyOn(SharedUtil, 'redirect');
        return setupCustomExpiredPassword().then(function (test) {
          test.form.clickCustomButton();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://www.twitter.com');
        });
      });

    });

    Expect.describe('PasswordAboutToExpire', function () {

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
      itp('has the correct title if numDays is null', function () {
        return setupWarn(null).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
        });
      });
      itp('has the correct title if numDays is undefined', function () {
        return setupWarn(undefined).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
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

    Expect.describe('CustomPasswordAboutToExpire', function () {

      itp('shows security beacon', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('has the correct title if expiring in > 0 days', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire in 4 days');
        });
      });
      itp('has the correct title if expiring in 0 days', function () {
        return setupCustomExpiredPasswordWarn(0).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire later today');
        });
      });
      itp('has the correct title if numDays is null', function () {
        return setupCustomExpiredPasswordWarn(null).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
        });
      });
      itp('has the correct title if numDays is undefined', function () {
        return setupCustomExpiredPasswordWarn(undefined).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
        });
      });
      itp('has a valid subtitle', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.subtitleText()).toEqual('When password expires you may be locked out of ' +
              'Okta Mobile, mobile email, and other services. ' +
              'This password is set on another website. ' +
              'Click the button below to go there and set a new password.');
        });
      });
      itp('has a custom change password button', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.customButton().length).toBe(1);
        });
      });
      itp('has a valid custom button text', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.customButtonText()).toEqual('Go to Google');
        });
      });
      itp('has a sign out link', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('has a skip link', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          Expect.isVisible(test.form.skipLink());
        });
      });
      itp('redirect is called with the correct arg on custom button click', function () {
        spyOn(SharedUtil, 'redirect');
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          test.form.clickCustomButton();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://www.google.com');
        });
      });

    });

  });
});
