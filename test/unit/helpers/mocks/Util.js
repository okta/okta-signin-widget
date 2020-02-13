/* eslint no-global-assign: 0, max-statements: 0 */
/* global Promise */
import 'jasmine-ajax';

define([
  'okta',
  'q',
  'duo',
  '../xhr/keys',
  '../xhr/well-known',
  '../xhr/well-known-shared-resource'
],
function (Okta, Q, Duo, keys, wellKnown, wellKnownSharedResource) {

  var { _, $, Backbone } = Okta;
  var { Cookie } = Okta.internal.util;

  var fn = {};
  var isAjaxMocked = false;
  afterEach(() => {
    if (isAjaxMocked) {
      fn.unmockAjax();
      isAjaxMocked = false;
    }
  });

  fn.LoremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Sed lacinia neque at ligula ornare accumsan. Nullam interdum pellentesque nisl, ' +
      'ut tempor eros gravida egestas. Curabitur tempus dignissim justo et pellentesque. ' +
      'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.';

  fn.mockGetCookie = function (name, value) {
    spyOn(Cookie, 'getCookie').and.callFake(function (nameGiven) {
      return name === nameGiven ? value : undefined;
    });
    return Cookie.getCookie;
  };

  fn.mockSetCookie = function () {
    spyOn(Cookie, 'setCookie');
    return Cookie.setCookie;
  };

  fn.mockSDKCookie = function (authClient, key, value) {
    key = key || 'oktaStateToken';
    value = value || 'testStateToken';
    spyOn(authClient.tx.exists, '_get').and.returnValue(value);
  };

  fn.mockRemoveCookie = function () {
    spyOn(Cookie, 'removeCookie');
    return Cookie.removeCookie;
  };

  fn.mockRouterNavigate = function (router, start) {
    spyOn(router, 'navigate').and.callFake(function (fragment) {
      Backbone.history.root = '/';
      Backbone.history.loadUrl(fragment);
    });

    if (start) {
      spyOn(window, 'addEventListener'); // tracking 'popstate' handler
      router.start();
    }
  };

  fn.mockDuo = function () {
    spyOn(Duo, 'init');
  };

  fn.mockAjax = function (responses) {
    jasmine.Ajax.install();
    isAjaxMocked = true;

    var allResponses = [];
    if (responses) {
      allResponses = allResponses.concat(responses);
    }

    jasmine.Ajax.stubRequest(
      /.*/
    ).andCallFunction(request => {
      if (!allResponses.length) {
        expect(`Received an unexpected AJAX request: ${request.url}`).toBe(false);
        return;
      }
      const xhr = allResponses.shift();
      request.respondWith({
        status: xhr.status,
        responseText: (typeof xhr.response === 'string') ? xhr.response : JSON.stringify(xhr.response),
      });
    });

    function setNextResponse (response, responseTextOnly) {
      expect(responseTextOnly).toBe(undefined);

      if (_.isArray(response)) {
        allResponses = response.concat(allResponses);
      } else {
        allResponses.unshift(response);
      }
    }

    return setNextResponse;
  };

  fn.numAjaxRequests = function () {
    return jasmine.Ajax.requests.count();
  };

  fn.resetAjaxRequests = function () {
    jasmine.Ajax.requests.reset();
  };

  fn.lastAjaxRequest = function () {
    return jasmine.Ajax.requests.mostRecent();
  };

  fn.getAjaxRequest = function (index) {
    return jasmine.Ajax.requests.at(index);
  };

  fn.unmockAjax = function () {
    jasmine.Ajax.uninstall();
  };

  fn.mockJSONP = function (responses) {
    let allResponses = [];
    if (responses) {
      allResponses = allResponses.concat(responses);
    }

    const origMethod = $.ajax;
    spyOn($, 'ajax').and.callFake(function (req) {
      // Only mock JSONP requests, pass others through
      if (req.dataType !== 'jsonp') {
        return origMethod(req);
      }
      const xhr = allResponses.shift();
      if (!xhr) {
        throw new Error(
          'We are making a request that we have not anticipated: ' +
          req.type.toUpperCase() + ' ' + req.url
        );
      }

      var deferred = $.Deferred();
      setTimeout(function () {
        if (xhr.status > 0 && xhr.status < 300) {
          // $.ajax send (data, textStatus, jqXHR) on success
          deferred.resolve(xhr.response, null, xhr);
        } else {
          // $.ajax send (jqXHR, textStatus, errorThrown) on failure
          const err = _.omit(xhr, 'response');
          err.responseText = JSON.stringify(xhr.response);
          deferred.reject(err, null, xhr.responseJSON);
        }
      }, xhr.delay || 0);
      return deferred;
    });

    function setNextJSONPResponse (response) {
      if (_.isArray(response)) {
        allResponses = response.concat(allResponses);
      } else {
        allResponses.unshift(response);
      }
    }

    return setNextJSONPResponse;
  };

  // Useful for overriding setting of security image (which tries to load
  // a file that does not exist in our tests)
  fn.mockJqueryCss = function () {
    var original = $.fn.css;
    spyOn($.fn, 'css').and.callFake(function () {
      var data = arguments[0];

      switch (data['background-image']) {
      case 'url(/img/security/unknown-device.png)':
      case 'url(/img/security/default.png)':
        return;
      }

      return original.apply(this, arguments);
    });
  };

  fn.mockQDelay = function () {
    var original = Q.delay;
    spyOn(Q, 'delay').and.callFake(function () {
      return original.call(this, 0);
    });
  };

  fn.mockRateLimiting = function () {
    var deferred = Q.defer();
    spyOn(Q, 'delay').and.callFake(function () {
      return deferred.promise;
    });
    return deferred;
  };

  fn.speedUpDelay = function () {
    var delay = _.delay;
    spyOn(_, 'delay').and.callFake(function (func, wait, args) {
      return delay(func, 0, args);
    });
  };

  // Random 'state' generator in Auth SDK for OIDC
  fn.mockOIDCStateGenerator = function () {
    spyOn(Math, 'random').and.returnValue(0.1);
  };

  fn.loadWellKnownAndKeysCache = function () {
    // add /.well-known/openid-configuration and /oauth2/v1/keys to cache
    // so we don't make unnecessary requests
    var expirationTime = 2449786329;
    localStorage.setItem('okta-cache-storage', JSON.stringify({
      'https://foo.com/.well-known/openid-configuration': {
        expiresAt: expirationTime,
        response: wellKnown.response
      },
      'https://foo.com/oauth2/v1/keys': {
        expiresAt: expirationTime,
        response: keys.response
      },
      'https://foo.com/oauth2/aus8aus76q8iphupD0h7/.well-known/openid-configuration': {
        expiresAt: expirationTime,
        response: wellKnownSharedResource.response
      },
      'https://foo.com/oauth2/aus8aus76q8iphupD0h7/v1/keys': {
        expiresAt: expirationTime,
        response: keys.response
      }
    }));
  };

  fn.stallEnrollFactorPoll = function (authClient, originalAjax) {
    // Needed in order to reset the mock. Jasmine spies don't have restore()
    if (authClient.options.httpRequestClient.calls) {
      authClient.options.httpRequestClient = originalAjax;
    }
    originalAjax = authClient.options.httpRequestClient;
    spyOn(authClient.options, 'httpRequestClient').and.callFake(function (method, uri) {
      var isPollFn = uri.indexOf('/lifecycle/activate') !== -1;
      if (isPollFn) {
        // return waiting xhr
        return Promise.resolve({
          status: 200,
          responseText: JSON.stringify({
            'stateToken': 'testStateToken',
            'factorResult': 'WAITING'
          })
        });
      }

      return originalAjax.apply(this, arguments);
    });

    return originalAjax;
  };

  fn.resumeEnrollFactorPoll = function (authClient, originalAjax, response) {
    if (authClient.options.httpRequestClient.calls) {
      authClient.options.httpRequestClient = originalAjax;
    }
    if (response.response && !response.responseText) {
      response.responseText = JSON.stringify(response.response);
    }
    originalAjax = authClient.options.httpRequestClient;
    spyOn(authClient.options, 'httpRequestClient').and.callFake(function (method, uri) {
      var isPollFn = uri.indexOf('/activate') !== -1;
      if (isPollFn) {
        authClient.options.httpRequestClient = originalAjax;
        return Promise.resolve(response);
      }
      return originalAjax.apply(this, arguments);
    });
    return originalAjax;
  };

  fn.stopRouter = function () {
    Backbone.history.stop();
  };

  // Needs to be preceded by a call to mockRouterNavigate() with startRouter as true.
  fn.triggerBrowserBackButton = function () {
    var args = window.addEventListener.calls.argsFor(0);
    expect(args[0]).toBe('popstate');
    var callback = args[1];
    callback.call(null, {
      preventDefault: function () {},
      stopImmediatePropagation: function () {}
    });
  };

  function isNative (fn) {
    return fn.toString().indexOf('[native code]') > 0;
  }

  /*
    We track timeouts and intervals so we can remove them between
    Jasmine tests. This ensures our tests are independent.

    ex: polling no longer makes requests that we don't expect
  */
  var timeouts = [];
  var originalSetTimeout;

  fn.mockSetTimeout = function () {
    if (isNative(setTimeout)) {
      originalSetTimeout = setTimeout;
      setTimeout = function (fn, delay) {
        const entry = {
          fn,
          delay
        };
        entry.id = originalSetTimeout(() => {
          timeouts.splice(timeouts.indexOf(entry), 1);
          fn();
        }, delay);
        timeouts.push(entry);
        return entry.id;
      };
    }
  };

  fn.clearAllTimeouts = function () {
    while (timeouts.length) {
      clearTimeout(timeouts.pop().id);
    }
  };

  fn.callAllTimeouts = function () {
    while (timeouts.length) {
      const entry = timeouts.pop();
      clearTimeout(entry.id);
      entry.fn();
    }
  };

  var intervals = [];
  var originalSetInterval;

  fn.mockSetInterval = function () {
    if (isNative(setInterval)) {
      originalSetInterval = setInterval;
      setInterval = function () {
        var id = originalSetInterval.apply(this, arguments);
        timeouts.push(id);
        return id;
      };
    }
  };

  fn.clearAllIntervals = function () {
    while (intervals.length) {
      clearTimeout(intervals.pop());
    }
  };

  var registeredRouters = [];

  // Call this method in each setup function so that we can do cleanup
  // after the test has run
  fn.registerRouter = function (router) {
    registeredRouters.push(router);
  };

  fn.cleanupRouter = function () {
    var current;
    while (registeredRouters.length) {
      current = registeredRouters.pop();
      if (current.controller) {
        current.stopListening(current.controller);
        current.stopListening(current.controller.state);
        current.controller.remove();
      }
    }
  };

  fn.deepCopy = function (res) {
    return JSON.parse(JSON.stringify(res));
  };

  fn.getAutoPushResponse = function (response, autoPushVal) {
    var responseCopy = fn.deepCopy(response);
    var embeddedResponse = responseCopy['response']['_embedded'];
    var factors = embeddedResponse['factors'];
    var factorId = _.findWhere(factors, {factorType: 'push', provider: 'OKTA'}).id;
    var policy = embeddedResponse['policy'];

    policy['factorsPolicyInfo'][factorId]['autoPushEnabled'] = autoPushVal;
    return responseCopy;
  };

  return fn;

});
