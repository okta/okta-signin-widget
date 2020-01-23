define([
  'okta',
  'q',
  'helpers/mocks/Util',
  'util/Logger',
  'util/Bundles',
  'config/config.json',
  'sandbox'
], function (Okta, Q, Util, Logger, Bundles, config, $sandbox) {

  var fn = {};
  var $ = Okta.$;
  var _ = Okta._;

  var WAIT_MAX_TIME = 2000;
  var WAIT_INTERVAL = 20;

  function runTest (jasmineFn, desc, testFn) {
    jasmineFn(desc, function (done) {
      var errListener = function (err) {
        // We've thrown an unexpected error in the test - setup a fake
        // expectation to expose it to the developer
        expect('Unexpected error thrown').toEqual(err.message);
      };
      window.addEventListener('error', errListener);
      testFn.call(this)
        .then(function () {
          expect(Q.getUnhandledReasons()).toEqual([]);
          // Reset unhandled exceptions (which in the normal case come from the
          // error tests we're running) so that this array does not get
          // unreasonably large (and subsequently slow down our tests)
          // Also, if a test turns off unhandled exceptions (necessary in the
          // case of returning an api error response), this method will turn it
          // back on.
          Q.resetUnhandledRejections();
          window.removeEventListener('error', errListener);
          done();
        })
        .done();
    });
  }

  function wrapDescribe (_describe, desc, fn) {
    return _describe(desc, function () {

      beforeAll(function () {
        Util.mockSetTimeout();
        Util.mockSetInterval();
      });

      beforeEach(function () {
        this._origDeprecate = Logger.deprecate;
        Logger.deprecate = jasmine.createSpy('deprecate');

        this._origVersion = config.version;
        config.version = '9.9.99';

        $.fx.off = true;
        localStorage.clear();
      });

      afterEach(function () {
        Logger.deprecate = this._origDeprecate;
        config.version = this._origVersion;
        Util.clearAllTimeouts();
        Util.clearAllIntervals();
        Util.cleanupRouter();
        $.fx.off = false;
        $sandbox.empty();
        $('.qtip').remove();
        Bundles.currentLanguage = null;
      });

      fn();
    });
  }

  fn.describe = wrapDescribe.bind(null, describe);
  fn.fdescribe = wrapDescribe.bind(null, fdescribe);

  // Helper function to work with promises - when the return promise is
  // resolved, done is called
  fn.itp = runTest.bind({}, it);

  fn.fitp = runTest.bind({}, fit);

  /**
   * @deprecated This function is non deterministic and can affect the output of the tests
   *             Instead use any of the Expect.wait* functions.
   */
  fn.tick = function (returnVal) {
    var deferred = Q.defer();
    // Using four setTimeouts to remove flakiness (some tests need an extra
    // cycle when transitioning/setting up, and the new tick in OktaAuth makes
    // for three)
    setTimeout(function () {
      setTimeout(function () {
        setTimeout(function () {
          setTimeout(function () {
            deferred.resolve(returnVal);
          });
        });
      });
    });
    return deferred.promise;
  };

  fn.waitForController = function (pageClass, resolveValue) {
    var condition = function () {
      var pages = $('.auth-content-inner', $sandbox).children();
      return pages.length === 1 && pages.eq(0).hasClass(pageClass);
    };
    return fn.wait(condition, resolveValue);
  };

  fn.waitForVerifyView = function (verifyClass, resolveValue) {
    var condition = function () {
      var pages = $('.auth-content-inner', $sandbox).children(),
          txSettled = pages.length === 1 && pages.eq(0).hasClass('mfa-verify');
      return txSettled && $('form.' + verifyClass, $sandbox).length === 1;
    };
    return fn.wait(condition, resolveValue);
  };

  fn.waitForCss = function (css, resolveValue) {
    var condition = function () {
      return $(css, $sandbox).length > 0;
    };
    return fn.wait(condition, resolveValue);
  };

  fn.waitForSpyCall = function (spy, resolveValue) {
    var condition = function () {
      return spy.calls.count() > 0;
    };
    return fn.wait(condition, resolveValue);
  };

  /**
   * Use this function to wait for an error view which has top level class '.okta-form-infobox-error'.
   */
  fn.waitForFormError = function (form, resolveValue) {
    var condition = function () {
      return form.hasErrors();
    };
    return fn.wait(condition, resolveValue);
  };

  /**
   * Use this function to wait for an error view which has top level class '.okta-infobox-error'.
   */
  fn.waitForFormErrorBox = function (form, resolveValue) {
    var condition = function () {
      return form.errorBox().length > 0;
    };
    return fn.wait(condition, resolveValue);
  };

  fn.wait = function (condition, resolveValue, timeout) {
    function check (success, fail, triesLeft) {
      if (condition()) {
        success(resolveValue);
      }
      else if (triesLeft <= 0) {
        fail('Wait condition not met');
      }
      else {
        setTimeout(check.bind(null, success, fail, triesLeft - 1), WAIT_INTERVAL);
      }
    }
    return Q.Promise(function (resolve, reject) {
      var numTries = (timeout || WAIT_MAX_TIME) / WAIT_INTERVAL;
      check(resolve, reject, numTries);
    });
  };

  fn.isTextField = function ($input) {
    expect($input.length).toBe(1);
    expect($input.attr('type')).toEqual('text');
  };

  fn.isPasswordField = function ($input) {
    expect($input.length).toBe(1);
    expect($input.attr('type')).toEqual('password');
  };

  fn.isLink = function ($el) {
    expect($el.length).toBe(1);
    expect($el.is('a')).toBe(true);
  };

  fn.isEmptyFieldError = function ($errorField) {
    expect($errorField.length).toBe(1);
    expect($errorField.text()).toBe('This field cannot be left blank');
  };

  fn.isNotVisible = function ($input) {
    expect($input.length).toBe(1);
    expect($input.is(':visible')).toBe(false);
  };

  fn.isVisible = function ($input) {
    expect($input.length).toBe(1);
    expect($input.is(':visible')).toBe(true);
  };

  fn.isController = function (className, controller) {
    expect(controller.className).toBe(className);
    fn.isVisible(controller.$el);
  };

  fn.deprecated = function (msg) {
    expect(Logger.deprecate).toHaveBeenCalledWith(msg);
  };

  // Convenience function to test a json post - pass in url and data, and it
  // will test the rest. Note: We JSON.stringify data here so you don't have to
  fn.isJsonPost = function (ajaxArgs, expected) {
    var args = ajaxArgs[0];

    // Jasmine times out if args doesn't exist when we try to retrieve
    // its properties. This makes it fail faster.
    if (!args) {
      expect(args).not.toBeUndefined();
      return;
    }
    expect(args.url).toBe(expected.url);
    expect(args.type).toBe('POST');
    expect(args.headers).toEqual(jasmine.objectContaining({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }));
    expect(JSON.parse(args.data)).toEqual(expected.data);
  };

  // --------------------------------------------------------------------------
  // Controller specific helper functions

  var controllerClasses = {
    AccountUnlocked: 'account-unlocked',
    ActivateTotp: 'activate-totp',
    BarcodePush: 'barcode-push',
    BarcodeTotp: 'barcode-totp',
    ConsentRequired: 'consent-required',
    EnrollCall: 'enroll-call',
    EnrollChoices: 'enroll-choices',
    EnrollDuo: 'enroll-duo',
    EnrollmentLinkSent: 'enroll-activation-link-sent',
    EnrollOnPrem: 'enroll-onprem',
    EnrollQuestion: 'enroll-question',
    EnrollPassword: 'enroll-password',
    EnrollRsa: 'enroll-rsa',
    EnrollSms: 'enroll-sms',
    EnrollEmail: 'enroll-email',
    EnrollActivateEmail: 'enroll-activate-email',
    EnrollSymantecVip: 'enroll-symantec',
    EnrollTotp: 'enroll-totp',
    EnrollHotp: 'enroll-hotp',
    EnrollU2F: 'enroll-u2f',
    EnrollWebauthn: 'enroll-webauthn',
    EnrollWindowsHello: 'enroll-windows-hello',
    EnrollYubikey: 'enroll-yubikey',
    EnrollCustomFactor: 'enroll-custom-factor',
    EnterPasscodePushFlow: 'activate-push',
    ForgotPassword: 'forgot-password',
    IDPDiscovery: 'idp-discovery',
    ManualSetupPush: 'enroll-manual-push',
    ManualSetupTotp: 'enroll-manual-totp',
    MfaVerify: 'mfa-verify',
    PasswordExpired: 'password-expired',
    CustomPasswordExpired: 'custom-password-expired',
    PasswordReset: 'password-reset',
    PrimaryAuth: 'primary-auth',
    PwdResetEmailSent: 'password-reset-email-sent',
    RecoveryChallenge: 'recovery-challenge',
    RecoveryLoading: 'recovery-loading',
    RecoveryQuestion: 'recovery-question',
    RefreshAuthState: 'refresh-auth-state',
    Registration: 'registration',
    RegistrationComplete: 'registration-complete',
    UnlockAccount: 'account-unlock',
    UnlockEmailSent: 'account-unlock-email-sent',
    VerifyDuo: 'mfa-verify-duo',
    VerifyU2F: 'verify-u2f',
    VerifyWebauthn: 'verify-webauthn',
    VerifyWindowsHello: 'verify-windows-hello',
    VerifyCustomFactor: 'verify-custom-factor',
    EnrollUser: 'enroll-user',
    VerifyPIV: 'piv-cac-card',
  };

  _.each(controllerClasses, function (className, controller) {
    fn['waitFor' + controller] = _.partial(fn.waitForController, className);
    fn['is' + controller] = _.partial(fn.isController, className);
  });

  // --------------------------------------------------------------------------
  // Verify specific helper functions
  // Note: These are the verify views that are initialized by the MfaVerify
  // controller.

  var verifyClasses = {
    VerifyQuestion: 'mfa-verify-question',
    VerifyPassCode: 'mfa-verify-passcode',
    VerifyTotp: 'mfa-verify-totp',
    VerifyYubikey: 'mfa-verify-yubikey',
    VerifyPush: 'mfa-verify-push'
  };

  _.each(verifyClasses, function (className, verifyView) {
    fn['waitFor' + verifyView] = _.partial(fn.waitForVerifyView, className);
  });

  return fn;

});
