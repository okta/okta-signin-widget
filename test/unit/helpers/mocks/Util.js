/* eslint no-global-assign: 0, max-statements: 0 */
import { _, $, Backbone, internal } from 'okta';
import Duo from 'duo';
import 'jasmine-ajax';
import Q from 'q';
import Bundles from 'util/Bundles';
import keys from '../xhr/keys';
import wellKnown from '../xhr/well-known';
import wellKnownSharedResource from '../xhr/well-known-shared-resource';
let { Cookie } = internal.util;
const fn = {};
let globalFetch;
let isAjaxMocked = false;

afterEach(() => {
  if (isAjaxMocked) {
    fn.unmockAjax();
    isAjaxMocked = false;
  }
});

fn.mockBundles = function() {
  spyOn(Bundles, 'isLoaded').and.returnValue(true);
};

fn.LoremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed lacinia neque at ligula ornare accumsan. Nullam interdum pellentesque nisl, ' +
  'ut tempor eros gravida egestas. Curabitur tempus dignissim justo et pellentesque. ' +
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.';

fn.mockGetCookie = function(name, value) {
  spyOn(Cookie, 'getCookie').and.callFake(function(nameGiven) {
    return name === nameGiven ? value : undefined;
  });
  return Cookie.getCookie;
};

fn.mockSetCookie = function() {
  spyOn(Cookie, 'setCookie');
  return Cookie.setCookie;
};

fn.mockSDKCookie = function(authClient, key, value) {
  key = key || 'oktaStateToken';
  value = value || 'testStateToken';
  spyOn(authClient.options.storageUtil.storage, 'get').and.callFake((requestedKey) => {
    if (requestedKey !== key) {
      throw new Error(`Unexpected request for cookie: "${requestedKey}`);
    }
    return value;
  });
};

fn.mockRemoveCookie = function() {
  spyOn(Cookie, 'removeCookie');
  return Cookie.removeCookie;
};

fn.mockRouterNavigate = function(router, start) {
  spyOn(router, 'navigate').and.callFake(function(fragment) {
    Backbone.history.root = '/';
    Backbone.history.loadUrl(fragment);
  });

  if (start) {
    spyOn(window, 'addEventListener'); // tracking 'popstate' handler
    router.start();
  }
};

fn.mockDuo = function() {
  spyOn(Duo, 'init');
};

fn.mockAjax = function(responses) {
  globalFetch = window.fetch;
  window.fetch = null;
  jasmine.Ajax.install();
  isAjaxMocked = true;

  let allResponses = [];

  if (responses) {
    allResponses = allResponses.concat(responses);
  }

  function respond(request, xhr) {
    request.respondWith({
      status: xhr.status,
      responseText: typeof xhr.response === 'string' ? xhr.response : JSON.stringify(xhr.response),
    });
  }

  jasmine.Ajax.stubRequest(/.*/).andCallFunction(request => {
    if (!allResponses.length) {
      expect(`Received an unexpected AJAX request: ${request.url}`).toBe(false);
      return;
    }
    let xhr = allResponses.shift();
    if (typeof xhr === 'function') {
      xhr = xhr();
    }
    if (xhr.delay) {
      // TODO: remove delay from tests
      setTimeout(respond.bind(null, request, xhr), xhr.delay);
      return;
    }
    respond(request, xhr);
  });

  function setNextResponse(response, responseTextOnly) {
    expect(responseTextOnly).toBe(undefined);

    if (_.isArray(response)) {
      allResponses = response.concat(allResponses);
    } else {
      allResponses.unshift(response);
    }
  }

  return setNextResponse;
};

fn.numAjaxRequests = function() {
  return jasmine.Ajax.requests.count();
};

fn.resetAjaxRequests = function() {
  jasmine.Ajax.requests.reset();
};

fn.lastAjaxRequest = function() {
  return jasmine.Ajax.requests.mostRecent();
};

fn.getAjaxRequest = function(index) {
  return jasmine.Ajax.requests.at(index);
};

fn.unmockAjax = function() {
  window.fetch = globalFetch;
  jasmine.Ajax.uninstall();
};

// Useful for overriding setting of security image (which tries to load
// a file that does not exist in our tests)
fn.mockJqueryCss = function() {
  const original = $.fn.css;

  spyOn($.fn, 'css').and.callFake(function() {
    const data = arguments[0];

    switch (data['background-image']) {
    case 'url(/img/security/unknown-device.png)':
    case 'url(/img/security/default.png)':
      return;
    }

    return original.apply(this, arguments);
  });
};

fn.mockQDelay = function() {
  const original = Q.delay;

  spyOn(Q, 'delay').and.callFake(function() {
    return original.call(this, 0);
  });
};

fn.mockRateLimiting = function() {
  const deferred = Q.defer();

  spyOn(Q, 'delay').and.callFake(function() {
    return deferred.promise;
  });
  return deferred;
};

fn.speedUpDelay = function() {
  const delay = _.delay;

  spyOn(_, 'delay').and.callFake(function(func, wait, args) {
    return delay(func, 0, args);
  });
};

// Random 'state' generator in Auth SDK for OIDC
fn.mockOIDCStateGenerator = function() {
  spyOn(Math, 'random').and.returnValue(0.1);
};

fn.loadWellKnownAndKeysCache = function() {
  const expirationTime = 2449786329;
  // add /.well-known/openid-configuration and /oauth2/v1/keys to cache
  // so we don't make unnecessary requests

  localStorage.setItem(
    'okta-cache-storage',
    JSON.stringify({
      'https://foo.com/.well-known/openid-configuration': {
        expiresAt: expirationTime,
        response: wellKnown.response,
      },
      'https://foo.com/oauth2/v1/keys': {
        expiresAt: expirationTime,
        response: keys.response,
      },
      'https://foo.com/oauth2/aus8aus76q8iphupD0h7/.well-known/openid-configuration': {
        expiresAt: expirationTime,
        response: wellKnownSharedResource.response,
      },
      'https://foo.com/oauth2/aus8aus76q8iphupD0h7/v1/keys': {
        expiresAt: expirationTime,
        response: keys.response,
      },
    })
  );
};

fn.stallEnrollFactorPoll = function(authClient, originalAjax) {
  // Needed in order to reset the mock. Jasmine spies don't have restore()
  if (authClient.options.httpRequestClient.calls) {
    authClient.options.httpRequestClient = originalAjax;
  }
  originalAjax = authClient.options.httpRequestClient;
  spyOn(authClient.options, 'httpRequestClient').and.callFake(function(method, uri) {
    const isPollFn = uri.indexOf('/lifecycle/activate') !== -1;

    if (isPollFn) {
      // return waiting xhr
      return Promise.resolve({
        status: 200,
        responseText: JSON.stringify({
          stateToken: 'testStateToken',
          factorResult: 'WAITING',
        }),
      });
    }

    return originalAjax.apply(this, arguments);
  });

  return originalAjax;
};

fn.resumeEnrollFactorPoll = function(authClient, originalAjax, response) {
  if (authClient.options.httpRequestClient.calls) {
    authClient.options.httpRequestClient = originalAjax;
  }
  if (response.response && !response.responseText) {
    response.responseText = JSON.stringify(response.response);
  }
  originalAjax = authClient.options.httpRequestClient;
  spyOn(authClient.options, 'httpRequestClient').and.callFake(function(method, uri) {
    const isPollFn = uri.indexOf('/activate') !== -1;

    if (isPollFn) {
      authClient.options.httpRequestClient = originalAjax;
      return Promise.resolve(response);
    }
    return originalAjax.apply(this, arguments);
  });
  return originalAjax;
};

fn.stopRouter = function() {
  Backbone.history.stop();
};

// Needs to be preceded by a call to mockRouterNavigate() with startRouter as true.
fn.triggerBrowserBackButton = function() {
  const args = window.addEventListener.calls.argsFor(0);

  expect(args[0]).toBe('popstate');
  const callback = args[1];

  callback.call(null, {
    preventDefault: function() {},
    stopImmediatePropagation: function() {},
  });
};

function isMock(fn) {
  return fn._isMock;
}

function createMock(fn) {
  fn._isMock = true;
  return fn;
}

/*
  We track timeouts and intervals so we can remove them between
  Jasmine tests. This ensures our tests are independent.
   ex: polling no longer makes requests that we don't expect
*/
const timeouts = [];
let originalSetTimeout;

fn.mockSetTimeout = function() {
  if (setTimeout !== window.setTimeout) {
    // eslint-disable-next-line no-console
    console.error('setTimeout !== window.setTimeout. Tests will probably fail. This may be caused by babel polyfill.');
  }
  if (!isMock(window.setTimeout)) {
    originalSetTimeout = window.setTimeout;
    window.setTimeout = createMock(function(fn, delay) {
      const entry = {
        fn,
        delay,
      };
      entry.id = originalSetTimeout(() => {
        timeouts.splice(timeouts.indexOf(entry), 1);
        fn();
      }, delay);
      timeouts.push(entry);
      return entry.id;
    });
  }
};

fn.clearAllTimeouts = function() {
  while (timeouts.length) {
    clearTimeout(timeouts.pop().id);
  }
};

fn.callAllTimeouts = function() {
  while (timeouts.length) {
    const entry = timeouts.pop();
    clearTimeout(entry.id);
    entry.fn();
  }
};

const intervals = [];
let originalSetInterval;

fn.mockSetInterval = function() {
  if (!isMock(window.setInterval)) {
    originalSetInterval = window.setInterval;
    window.setInterval = createMock(function() {
      const id = originalSetInterval.apply(this, arguments);
      intervals.push(id);
      return id;
    });
  }
};

fn.clearAllIntervals = function() {
  while (intervals.length) {
    clearTimeout(intervals.pop());
  }
};

const registeredRouters = [];

// Call this method in each setup function so that we can do cleanup
// after the test has run
fn.registerRouter = function(router) {
  registeredRouters.push(router);
};

fn.cleanupRouter = function() {
  let current;

  while (registeredRouters.length) {
    current = registeredRouters.pop();
    if (current.controller) {
      current.stopListening(current.controller);
      current.stopListening(current.controller.state);
      current.controller.remove();
    }
  }
};

fn.deepCopy = function(res) {
  return JSON.parse(JSON.stringify(res));
};

fn.getAutoPushResponse = function(response, autoPushVal) {
  const responseCopy = fn.deepCopy(response);
  const embeddedResponse = responseCopy['response']['_embedded'];
  const factors = embeddedResponse['factors'];

  const factorId = _.findWhere(factors, { factorType: 'push', provider: 'OKTA' }).id;

  const policy = embeddedResponse['policy'];

  policy['factorsPolicyInfo'][factorId]['autoPushEnabled'] = autoPushVal;
  return responseCopy;
};

export default fn;
