/*global JSON */
define([
  'okta',
  'vendor/lib/q',
  'helpers/mocks/Util',
  'sandbox'
], function (Okta, Q, Util, $sandbox) {

  var fn = {};
  var PRIMARY_AUTH = 'primary-auth';
  var ENROLL_CHOICES = 'enroll-choices';
  var $ = Okta.$;

  fn.describe = function(desc, fn) {
    return describe(desc, function() {

      beforeAll(function () {
        Util.mockSetTimeout();
        Util.mockSetInterval();
      });

      beforeEach(function () {
        $.fx.off = true;
      });

      afterEach(function () {
        Util.clearAllTimeouts();
        Util.clearAllIntervals();
        $.fx.off = false;
        $sandbox.empty();
      });

      fn();
    });
  };

  // Helper function to work with promises - when the return promise is
  // resolved, done is called
  fn.itp = function (desc, testFn) {
    it(desc, function (done) {
      testFn.call(this).then(function () {
        expect(Q.getUnhandledReasons()).toEqual([]);
        // Reset unhandled exceptions (which in the normal case come from the
        // error tests we're running) so that this array does not get
        // unreasonably large (and subsequently slow down our tests)
        // Also, if a test turns off unhandled exceptions (necessary in the
        // case of returning an api error response), this method will turn it
        // back on.
        Q.resetUnhandledRejections();
        // Wait a tick to make sure the tests clean up
        fn.tick().then(done);
      });
    });
  };

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
    expect($errorField.text()).toBe('The field cannot be left blank');
  };

  fn.isNotVisible = function ($input) {
    expect($input.length).toBe(1);
    expect($input.is(':visible')).toBe(false);
  };

  fn.isVisible = function ($input) {
    expect($input.length).toBe(1);
    expect($input.is(':visible')).toBe(true);
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

  fn.isPrimaryAuthController = function (controller) {
    expect(controller.className).toBe(PRIMARY_AUTH);
    fn.isVisible(controller.$el);
  };

  fn.isEnrollChoicesController = function (controller) {
    expect(controller.className).toBe(ENROLL_CHOICES);
    fn.isVisible(controller.$el);
  };

  return fn;

});
