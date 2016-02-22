/*jshint maxcomplexity:20 */
/* globals JSON */
define([
  'jquery',
  'underscore',
  'backbone',
  'vendor/lib/q',
  'duo'
],
function ($, _, Backbone, Q, Duo) {

  var fn = {};

  // Can mock both set and get
  fn.mockCookie = function (name, value) {
    spyOn($, 'cookie').and.callFake(function (nameGiven) {
      return name === nameGiven ? value : undefined;
    });
    return $.cookie;
  };

  fn.mockSDKCookie = function (authClient, key, value) {
    key = key || 'oktaStateToken';
    value = value || 'testStateToken';
    spyOn(authClient.transactionExists, '_getCookie').and.returnValue(value);
  };

  fn.mockRemoveCookie = function () {
    spyOn($, 'removeCookie');
    return $.removeCookie;
  };

  fn.mockRouterNavigate = function (router, start) {
    spyOn(router, 'navigate').and.callFake(function (fragment) {
      Backbone.history.root = '/';
      Backbone.history.loadUrl(fragment);
    });

    if (start) {
      spyOn(window, 'addEventListener');
      router.start();
    }
  };

  fn.mockDuo = function () {
    spyOn(Duo, 'init');
  };

  fn.mockAjax = function (responses) {

    var allResponses = [];
    var textOnly = false;

    if (responses) {
      allResponses = allResponses.concat(responses);
    }

    spyOn($, 'post').and.callFake(function(url, data) {
      return $.ajax({
        url: url,
        type: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
      });
    });

    spyOn($, 'ajax').and.callFake(function() {

      var xhr = allResponses.shift();
      if (!xhr) {
        throw new Error('We are making a request that we have not anticipated.');
      }

      // Place response into responseText (AuthClient SDK depends on this)
      if (textOnly) {
        xhr.responseText = xhr.response;
      } else {
        xhr.responseText = JSON.stringify(xhr.response);
      }

      var deferred = $.Deferred();
      if (xhr.status > 0 && xhr.status < 300) {
        // $.ajax send (data, textStatus, jqXHR) on success
        _.defer(function () { deferred.resolve(xhr.response, null, xhr); });
      } else {
        // $.ajax send (jqXHR, textStatus, errorThrown) on failure
        if (!textOnly) {
          xhr.responseJSON = xhr.response;
        }
        deferred.reject(xhr, null, xhr.response);
      }
      textOnly = false;
      return deferred;
    });

    function setNextResponse(response, responseTextOnly) {
      if (_.isArray(response)) {
        allResponses = response.concat(allResponses);
      } else {
        allResponses.unshift(response);
      }
      textOnly = responseTextOnly;
    }

    return setNextResponse;
  };

  // Useful for overriding setting of security image (which tries to load
  // a file that does not exist in our tests)
  fn.mockJqueryCss = function () {
    var original = $.fn.css;
    spyOn($.fn, 'css').and.callFake(function() {
      var data = arguments[0];

      switch (data['background-image']) {
        case 'url(/img/security/unknown-device.png)':
        case 'url(/img/security/default.png)':
        case 'url(/some/img)':
          return;
      }

      return original.apply(this, arguments);
    });
  };

  fn.speedUpPolling = function () {
    var original = Q.delay;
    spyOn(Q, 'delay').and.callFake(function() {
      return original.call(this, 0);
    });
  };

  // Random 'state' generator in Auth SDK for OIDC
  fn.mockOIDCStateGenerator = function () {
    spyOn(Math, 'random').and.returnValue(0.1);
  };

  // A crazy hack to stop polling without an exposed isPolling property
  var maxdepth = 10;
  function findPollFnParent(caller, count) {
    count = count || 1;
    if (caller) {
      if (caller.name === 'pollFn') {
        return caller;
      } else if (count < maxdepth) {
        count++;
        return findPollFnParent(caller.caller, count);
      }
    }
  }

  // Needed in order to reset the mock. Jasmine spies don't have restore()
  var originalPost;
  fn.disableEnrollFactorPoll = function (authClient) {
    originalPost = authClient.post;
    spyOn(authClient, 'post').and.callFake(function () {
      var caller = arguments.callee.caller; /* jshint ignore: line */
      var pollFn = findPollFnParent(caller);
      if (pollFn) {
        pollFn.__ref.isPolling = false;
        // return waiting xhr
        return Q.resolve({
          'stateToken': 'testStateToken',
          'factorResult': 'WAITING'
        });
      }

      return originalPost.apply(this, arguments);
    });
  };

  fn.stallEnrollFactorPoll = function (authClient) {
    if (authClient.post.calls) {
      authClient.post = originalPost;
    }
    originalPost = authClient.post;
    spyOn(authClient, 'post').and.callFake(function () {
      var caller = arguments.callee.caller; /* jshint ignore: line */
      var pollFn = findPollFnParent(caller);
      if (pollFn) {
        // return waiting xhr
        return Q.resolve({
          'stateToken': 'testStateToken',
          'factorResult': 'WAITING'
        });
      }

      return originalPost.apply(this, arguments);
    });
  };

  fn.resumeEnrollFactorPoll = function (authClient, response) {
    if (authClient.post.calls) {
      authClient.post = originalPost;
    }
    originalPost = authClient.post;
    spyOn(authClient, 'post').and.callFake(function () {
      var caller = arguments.callee.caller; /* jshint ignore: line */
      var pollFn = findPollFnParent(caller);
      if (pollFn) {
        authClient.post = originalPost;
        return Q.resolve(response);
      }
      return originalPost.apply(this, arguments);
    });
  };

  fn.stopRouter = function () {
    Backbone.history.stop();
  };

  // Needs to be preceded by a call to mockRouterNavigate() with startRouter as true.
  fn.triggerBrowserBackButton = function () {
    var args = window.addEventListener.calls.argsFor(0);
    var callback = args[1];
    callback.call(null, {
      preventDefault: function () {},
      stopImmediatePropagation: function () {}
    });
  };

  return fn;

});
