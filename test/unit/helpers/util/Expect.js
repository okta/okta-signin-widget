import { $, _ } from '@okta/courage';
import config from 'config/config.json';
import Util from 'helpers/mocks/Util';
import 'jasmine-ajax';
import $sandbox from 'sandbox';
import Bundles from 'util/Bundles';
import Logger from 'util/Logger';
import { createDeferred } from 'util/createDeferred';
import Dom from '../dom/Dom';

const fn = {};
const WAIT_MAX_TIME = 2000;
const WAIT_INTERVAL = 20;

// Native replacement for Q's global unhandled-rejection tracking. jsdom
// dispatches 'unhandledrejection' / 'rejectionhandled' on window; we collect
// the reasons here so runTest() can assert a test left no rejection unhandled.
let trackUnhandledRejections = true;
let unhandledReasons = [];

const onUnhandledRejection = function(event) {
  // Always suppress the default handling so a stray rejection is never
  // reported by the test runner itself (matching Q, which tracked rejections
  // internally rather than letting them surface). Failures are surfaced via
  // the assertion in runTest() - but only when tracking is enabled, so tests
  // that intentionally leave a rejection (via stopUnhandledRejectionTracking)
  // stay green.
  if (event.preventDefault) {
    event.preventDefault();
  }
  if (trackUnhandledRejections) {
    unhandledReasons.push(event.reason);
  }
};

const onRejectionHandled = function(event) {
  // A previously-unhandled rejection that later gained a handler is no longer
  // a failure - drop it from the collected reasons.
  const idx = unhandledReasons.indexOf(event.reason);
  if (idx !== -1) {
    unhandledReasons.splice(idx, 1);
  }
};

window.addEventListener('unhandledrejection', onUnhandledRejection);
window.addEventListener('rejectionhandled', onRejectionHandled);

// Clear collected reasons and (re)enable tracking. Called after every test;
// also restores tracking for a test that turned it off (necessary in the case
// of returning an api error response).
fn.resetUnhandledRejections = function() {
  unhandledReasons = [];
  trackUnhandledRejections = true;
};

// Turn off unhandled-rejection tracking for tests that intentionally leave a
// rejected promise (e.g. asserting an API error response).
fn.stopUnhandledRejectionTracking = function() {
  trackUnhandledRejections = false;
  unhandledReasons = [];
};

function runTest(jasmineFn, desc, testFn) {
  jasmineFn(desc, function() {
    const errListener = function(err) {
      // We've thrown an unexpected error in the test - setup a fake
      // expectation to expose it to the developer
      expect('Unexpected error thrown').toEqual(err.message);
    };

    window.addEventListener('error', errListener);

    return testFn.call(this).then(function() {
      if (unhandledReasons.length) {
        // eslint-disable-next-line no-console
        console.error('Unhandled promise rejections: ', unhandledReasons);
      }
      expect(unhandledReasons).toEqual([]);
      fn.resetUnhandledRejections();
      window.removeEventListener('error', errListener);
    });
  });
}

/**
 * @deprecated
 */
fn.allowUnhandledPromiseRejection = function() {
  throw new Error(
    'Expect.allowUnhandledPromiseRejection is DEPRECATED. ' +
    'Add .catch() blocks to handle promise rejections.'
  );
};

function wrapDescribe(_describe, desc, fn) {
  return _describe(desc, function() {
    beforeAll(function() {
      Util.mockSetTimeout();
      Util.mockSetInterval();
    });

    beforeEach(function() {
      this._origDeprecate = Logger.deprecate;
      Logger.deprecate = jasmine.createSpy('deprecate');

      this._origVersion = config.version;
      config.version = '9.9.99';

      $.fx.off = true;
      localStorage.clear();
    });

    afterEach(function() {
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
fn.tick = function(returnVal) {
  const deferred = createDeferred();

  // Using four setTimeouts to remove flakiness (some tests need an extra
  // cycle when transitioning/setting up, and the new tick in OktaAuth makes
  // for three)
  setTimeout(function() {
    setTimeout(function() {
      setTimeout(function() {
        setTimeout(function() {
          deferred.resolve(returnVal);
        });
      });
    });
  });
  return deferred.promise;
};

fn.waitForController = function(pageClass, resolveValue) {
  const condition = function() {
    const pages = $('.auth-content-inner', $sandbox).children();

    return pages.length === 1 && pages.eq(0).hasClass(pageClass);
  };

  return fn.wait(condition, resolveValue);
};

fn.waitForVerifyView = function(verifyClass, resolveValue) {
  const condition = function() {
    const pages = $('.auth-content-inner', $sandbox).children();
    const txSettled = pages.length === 1 && pages.eq(0).hasClass('mfa-verify');

    return txSettled && $('form.' + verifyClass, $sandbox).length === 1;
  };

  return fn.wait(condition, resolveValue);
};

fn.waitForCss = function(css, resolveValue) {
  const condition = function() {
    return $(css, $sandbox).length > 0;
  };

  return fn.wait(condition, resolveValue);
};

fn.waitForSpyCall = function(spy, resolveValue) {
  const condition = function() {
    return spy.calls.count() > 0;
  };

  return fn.wait(condition, resolveValue);
};

fn.waitForAjaxRequest = function(resolveValue) {
  const condition = function() {
    return jasmine.Ajax.requests.count() > 0;
  };

  return fn.wait(condition, resolveValue);
};

fn.waitForAjaxRequests = function(numRequests, resolveValue, timeout) {
  const condition = function() {
    return jasmine.Ajax.requests.count() === numRequests;
  };

  return fn.wait(condition, resolveValue, timeout);
};

/**
 * Use this function to wait for an error view which has top level class '.okta-form-infobox-error'.
 */
fn.waitForFormError = function(form, resolveValue) {
  const condition = function() {
    return form.hasErrors();
  };

  return fn.wait(condition, resolveValue);
};

/**
 * Use this function to wait for an error view which has top level class '.okta-infobox-error'.
 */
fn.waitForFormErrorBox = function(form, resolveValue) {
  const condition = function() {
    return form.errorBox().length > 0;
  };

  return fn.wait(condition, resolveValue);
};

/**
 * Wait for a window event handler to be added
 */
fn.waitForWindowListener = function(eventName, resolveValue) {
  const condition = function() {
    const calls = window.addEventListener.calls;
    const count = calls.count();
    if (count) {
      const args = calls.argsFor(count - 1);
      if (args[0] === eventName) {
        return true;
      }
    }
  };

  return fn.wait(condition, resolveValue);
};

fn.waitForSecurityImageTooltip = function(expectToBeVisible, resolveValue) {
  return fn.wait(() => {
    const isVisible = $('.okta-security-image-tooltip').is(':visible');
    return isVisible === expectToBeVisible;
  }, resolveValue);
};

fn.wait = function(condition, resolveValue, timeout) {
  function check(success, fail, triesLeft) {
    if (condition()) {
      // Resolve on a macrotask (not the immediate microtask) so any work the
      // caller kicked off just before waiting - e.g. async XHRs - has a tick to
      // run first. This matches the previous Q.Promise-based scheduling and
      // keeps timing-sensitive tests stable.
      setTimeout(function() {
        success(resolveValue);
      }, 0);
    } else if (triesLeft <= 0) {
      setTimeout(function() {
        fail(new Error('Wait condition not met'));
      }, 0);
    } else {
      setTimeout(check.bind(null, success, fail, triesLeft - 1), WAIT_INTERVAL);
    }
  }
  return new Promise(function(resolve, reject) {
    const numTries = (timeout || WAIT_MAX_TIME) / WAIT_INTERVAL;

    check(resolve, reject, numTries);
  });
};

fn.isTextField = function($input) {
  expect($input.length).toBe(1);
  expect($input.attr('type')).toEqual('text');
};

fn.isPasswordField = function($input) {
  expect($input.length).toBe(1);
  expect($input.attr('type')).toEqual('password');
};

fn.isLink = function($el) {
  expect($el.length).toBe(1);
  expect($el.is('a')).toBe(true);
};

fn.isEmptyFieldError = function($errorField) {
  expect($errorField.length).toBe(1);
  expect($errorField.text()).toBe('This field cannot be left blank');
};

fn.isNotVisible = function($input) {
  expect($input.length).toBe(1);
  expect(Dom.isVisible($input)).toBe(false);
};

fn.isVisible = function($input) {
  expect($input.length).toBe(1);
  expect(Dom.isVisible($input)).toBe(true);
};

fn.isController = function(className, controller) {
  expect(controller.className).toBe(className);
  fn.isVisible(controller.$el);
};

fn.deprecated = function(msg) {
  expect(Logger.deprecate).toHaveBeenCalledWith(msg);
};

// Convenience function to test a json response - pass in url and data, and it
// will test the rest. Note: We JSON.stringify data here so you don't have to
// JSON posts are done using fetch
fn.isJsonResponse = function(args, method, expected) {
  // Jasmine times out if args doesn't exist when we try to retrieve
  // its properties. This makes it fail faster.
  if (!args) {
    expect(args).not.toBeUndefined();
    return;
  }
  expect(args.url).toBe(expected.url);
  expect(args.method).toBe(method);
  expect(args.requestHeaders).toEqual(
    jasmine.objectContaining({
      accept: 'application/json',
      'content-type': 'application/json',
    })
  );
  const data = args.data();
  if (expected.data) {
    expect(data).toEqual(expected.data);
  }
};

fn.isJsonGet = function(args, expected) {
  fn.isJsonResponse(args, 'GET', expected);
};

fn.isJsonPost = function(args, expected) {
  fn.isJsonResponse(args, 'POST', expected);
};

fn.isJsonDelete = function(args, expected) {
  fn.isJsonResponse(args, 'DELETE', expected);
};

// Form post is done using $.post
fn.isFormPost = function(args, expected) {
  if (!args) {
    expect(args).not.toBeUndefined();
    return;
  }
  expect(args.url).toBe(expected.url);
  expect(args.method).toBe('POST');
  expect(args.requestHeaders).toEqual(
    jasmine.objectContaining({
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    })
  );
  const data = args.data();
  expect(data).toEqual(expected.data);
};

// For JSON assets such as language files
fn.isJsonAssetRequest = function(args, expected) {
  // Jasmine times out if args doesn't exist when we try to retrieve
  // its properties. This makes it fail faster.
  if (!args) {
    expect(args).not.toBeUndefined();
    return;
  }
  expect(args.url).toBe(expected.url);
  expect(args.method).toBe('GET');
  expect(args.requestHeaders).toEqual(
    jasmine.objectContaining({
      accept: 'application/json',
    })
  );
};

// --------------------------------------------------------------------------
// Controller specific helper functions

const controllerClasses = {
  AccountUnlocked: 'account-unlocked',
  ActivateTotp: 'activate-totp',
  BarcodePush: 'barcode-push',
  BarcodeTotp: 'barcode-totp',
  ConsentRequired: 'consent-required',
  GranularConsent: 'granular-consent',
  AdminConsentRequired: 'admin-consent-required',
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
  Poll: 'poll',
  ErrorState: 'error-state',
  DeviceCodeActivate: 'device-code-activate',
  DeviceCodeTerminal: 'device-code-terminal'
};

_.each(controllerClasses, function(className, controller) {
  fn['waitFor' + controller] = _.partial(fn.waitForController, className);
  fn['is' + controller] = _.partial(fn.isController, className);
});

// --------------------------------------------------------------------------
// Verify specific helper functions
// Note: These are the verify views that are initialized by the MfaVerify
// controller.

const verifyClasses = {
  VerifyEmail: 'mfa-verify-email',
  VerifyQuestion: 'mfa-verify-question',
  VerifyPassCode: 'mfa-verify-passcode',
  VerifyTotp: 'mfa-verify-totp',
  VerifyYubikey: 'mfa-verify-yubikey',
  VerifyPush: 'mfa-verify-push',
};

_.each(verifyClasses, function(className, verifyView) {
  fn['waitFor' + verifyView] = _.partial(fn.waitForVerifyView, className);
});

export default fn;
