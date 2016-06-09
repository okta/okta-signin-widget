/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define(["jquery","vendor/lib/q"], function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_10__) { return /******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};

/******/  // The require function
/******/  function __webpack_require__(moduleId) {

/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;

/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      exports: {},
/******/      id: moduleId,
/******/      loaded: false
/******/    };

/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/    // Flag the module as loaded
/******/    module.loaded = true;

/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }


/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;

/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;

/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";

/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  var jqueryRequest = __webpack_require__(1);
  module.exports = __webpack_require__(3)(jqueryRequest);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  var $ = __webpack_require__(2);

  function jqueryRequest(method, url, args) {
    var deferred = $.Deferred();
    $.ajax({
      type: method,
      url: url,
      headers: args.headers,
      data: JSON.stringify(args.data),
      xhrFields: {
        withCredentials: true
      }
    })
    .then(function(data, textStatus, jqXHR) {
      delete jqXHR.then;
      deferred.resolve(jqXHR);
    }, function(jqXHR) {
      delete jqXHR.then;
      deferred.reject(jqXHR);
    });
    return deferred;
  }

  module.exports = jqueryRequest;


/***/ },
/* 2 */
/***/ function(module, exports) {

  module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  __webpack_require__(4);

  var util              = __webpack_require__(6);
  var tx                = __webpack_require__(7);
  var session           = __webpack_require__(14);
  var cookies           = __webpack_require__(9);
  var token             = __webpack_require__(15);
  var AuthSdkError      = __webpack_require__(12);

  function OktaAuthBuilder(args) {
    var sdk = this;

    if (!args) {
      throw new AuthSdkError('No arguments passed to constructor. ' +
        'Required usage: new OktaAuth(args)');
    }

    if (!args.url) {
      throw new AuthSdkError('No url passed to constructor. ' +
        'Required usage: new OktaAuth({url: "https://sample.okta.com"})');
    }

    this.options = {
      url: args.url,
      clientId: args.clientId,
      redirectUri: args.redirectUri,
      ajaxRequest: args.ajaxRequest,
      transformErrorXHR: args.transformErrorXHR,
      headers: args.headers
    };

    // Remove trailing forward slash from url
    if (this.options.url.slice(-1) === '/') {
      this.options.url = this.options.url.slice(0, -1);
    }

    sdk.session = {
      close: util.bind(session.closeSession, sdk, sdk),
      exists: util.bind(session.sessionExists, sdk, sdk),
      get: util.bind(session.getSession, sdk, sdk),
      refresh: util.bind(session.refreshSession, sdk, sdk),
      setCookieAndRedirect: util.bind(session.setCookieAndRedirect, sdk, sdk)
    };

    sdk.tx = {
      status: util.bind(tx.transactionStatus, sdk, sdk),
      resume: util.bind(tx.resumeTransaction, sdk, sdk),
      exists: util.bind(tx.transactionExists, sdk, sdk)
    };

    // This is exposed so we can mock document.cookie in our tests
    sdk.tx.exists._getCookie = function(name) {
      return cookies.getCookie(name);
    };

    sdk.idToken = {
      authorize: util.bind(token.getIdToken, sdk, sdk),
      verify: util.bind(token.verifyIdToken, sdk, sdk),
      refresh: util.bind(token.refreshIdToken, sdk, sdk),
      decode: util.bind(token.decodeIdToken, sdk)
    };

    // This is exposed so we can mock window.location.href in our tests
    sdk.idToken.authorize._getLocationHref = function() {
      return window.location.href;
    };
  }

  var proto = OktaAuthBuilder.prototype;

  proto.features = {};

  proto.features.isPopupPostMessageSupported = function() {
    var isIE8or9 = document.documentMode && document.documentMode < 10;
    if (window.postMessage && !isIE8or9) {
      return true;
    }
    return false;
  };

  proto.features.isTokenVerifySupported = function() {
    return typeof crypto !== 'undefined' && crypto.subtle && typeof Uint8Array !== 'undefined';
  };

  // { username, password, (relayState), (context) }
  proto.signIn = function (opts) {
    return tx.postToTransaction(this, '/api/v1/authn', opts);
  };

  proto.signOut = function () {
    return this.session.close();
  };

  // { username, (relayState) }
  proto.forgotPassword = function (opts) {
    return tx.postToTransaction(this, '/api/v1/authn/recovery/password', opts);
  };

  // { username, (relayState) }
  proto.unlockAccount = function (opts) {
    return tx.postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
  };

  // { recoveryToken }
  proto.verifyRecoveryToken = function (opts) {
    return tx.postToTransaction(this, '/api/v1/authn/recovery/token', opts);
  };

  module.exports = function(ajaxRequest) {
    function OktaAuth(args) {
      if (!(this instanceof OktaAuth)) {
        return new OktaAuth(args);
      }
      
      if (args && !args.ajaxRequest) {
        args.ajaxRequest = ajaxRequest;
      }
      util.bind(OktaAuthBuilder, this)(args);
    }
    OktaAuth.prototype = OktaAuthBuilder.prototype;
    OktaAuth.prototype.constructor = OktaAuth;

    return OktaAuth;
  };


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  __webpack_require__(5);

  // Production steps of ECMA-262, Edition 5, 15.4.4.14
  // Reference: http://es5.github.io/#x15.4.4.14
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {

      var k;

      // 1. Let o be the result of calling ToObject passing
      //    the this value as the argument.
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let lenValue be the result of calling the Get
      //    internal method of o with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = o.length >>> 0;

      // 4. If len is 0, return -1.
      if (len === 0) {
        return -1;
      }

      // 5. If argument fromIndex was passed let n be
      //    ToInteger(fromIndex); else let n be 0.
      var n = +fromIndex || 0;

      if (Math.abs(n) === Infinity) {
        n = 0;
      }

      // 6. If n >= len, return -1.
      if (n >= len) {
        return -1;
      }

      // 7. If n >= 0, then Let k be n.
      // 8. Else, n<0, Let k be len - abs(n).
      //    If k is less than 0, then let k be 0.
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 9. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the
        //    HasProperty internal method of o with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        //    i.  Let elementK be the result of calling the Get
        //        internal method of o with the argument ToString(k).
        //   ii.  Let same be the result of applying the
        //        Strict Equality Comparison Algorithm to
        //        searchElement and elementK.
        //  iii.  If same is true, return k.
        if (k in o && o[k] === searchElement) {
          return k;
        }
        k++;
      }
      return -1;
    };
  }

  if (!Array.isArray) {
    Array.isArray = function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

  ;(function () {

    var object =  true ? exports : this; // #8: web workers
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
      this.message = message;
    }
    InvalidCharacterError.prototype = new Error;
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    // encoder
    // [https://gist.github.com/999166] by [https://github.com/nignag]
    object.btoa || (
    object.btoa = function (input) {
      var str = String(input);
      for (
        // initialize result and counter
        var block, charCode, idx = 0, map = chars, output = '';
        // if the next str index does not exist:
        //   change the mapping table to "="
        //   check if d has no fractional digits
        str.charAt(idx | 0) || (map = '=', idx % 1);
        // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)
      ) {
        charCode = str.charCodeAt(idx += 3/4);
        if (charCode > 0xFF) {
          throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
      }
      return output;
    });

    // decoder
    // [https://gist.github.com/1020396] by [https://github.com/atk]
    object.atob || (
    object.atob = function (input) {
      var str = String(input).replace(/=+$/, '');
      if (str.length % 4 == 1) {
        throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
      }
      for (
        // initialize result and counters
        var bc = 0, bs, buffer, idx = 0, output = '';
        // get next character
        buffer = str.charAt(idx++);
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
          // and if not first of each 4 characters,
          // convert the first 8 bits to one ascii character
          bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
      ) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
      }
      return output;
    });

  }());


/***/ },
/* 6 */
/***/ function(module, exports) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */
  /* eslint-env es6 */
  function base64UrlToBase64(b64u) {
    return b64u.replace(/\-/g, '+').replace(/_/g, '/');
  }

  function base64UrlToString(b64u) {
    var b64 = base64UrlToBase64(b64u);
    switch (b64.length % 4) {
      case 0:
        break;
      case 2:
        b64 += '==';
        break;
      case 3:
        b64 += '=';
        break;
      default:
        throw 'Not a valid Base64Url';
    }
    var utf8 = atob(b64);
    try {
      return decodeURIComponent(escape(utf8));
    } catch (e) {
      return utf8;
    }
  }

  function stringToBuffer(str) {
    var buffer = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
      buffer[i] = str.charCodeAt(i);
    }
    return buffer;
  }

  function base64UrlDecode(str) {
    return atob(base64UrlToBase64(str));
  }


  function bind(fn, ctx) {
    var additionalArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var args = Array.prototype.slice.call(arguments);
      args = additionalArgs.concat(args);
      return fn.apply(ctx, args);
    };
  }

  function isAbsoluteUrl(url) {
    return /^(?:[a-z]+:)?\/\//i.test(url);
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  function isoToUTCString(str) {
    var parts = str.match(/\d+/g),
        isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]),
        isoDate = new Date(isoTime);

    return isoDate.toUTCString();
  }

  function toQueryParams(obj) {
    var str = [];
    if (obj !== null) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key) &&
            obj[key] !== undefined &&
            obj[key] !== null) {
          str.push(key + '=' + encodeURIComponent(obj[key]));
        }
      }
    }
    if (str.length) {
      return '?' + str.join('&');
    } else {
      return '';
    }
  }

  function genRandomString(length) {
    var randomCharset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var random = '';
    for (var c = 0, cl = randomCharset.length; c < length; ++c) {
      random += randomCharset[Math.floor(Math.random() * cl)];
    }
    return random;
  }

  function extend(obj1, obj2) {
    for (var prop in obj2) {
      if (obj2.hasOwnProperty(prop)) {
        obj1[prop] = obj2[prop];
      }
    }
  }

  function removeNils(obj) {
    var cleaned = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        var value = obj[prop];
        if (value !== null && value !== undefined) {
          cleaned[prop] = value;
        }
      }
    }
    return cleaned;
  }

  function clone(obj) {
    if (obj) {
      var str = JSON.stringify(obj);
      if (str) {
        return JSON.parse(str);
      }
    }
    return obj;
  }

  // Analogous to _.omit
  function omit(obj) {
    var props = Array.prototype.slice.call(arguments, 1);
    var newobj = {};
    for (var p in obj) {
      if (obj.hasOwnProperty(p) && props.indexOf(p) == -1) {
        newobj[p] = obj[p];
      }
    }
    return clone(newobj);
  }

  function find(collection, searchParams) {
    var c = collection.length;
    while (c--) {
      var item = collection[c];
      var found = true;
      for (var prop in searchParams) {
        if (!searchParams.hasOwnProperty(prop)) {
          continue;
        }
        if (item[prop] !== searchParams[prop]) {
          found = false;
          break;
        }
      }
      if (found) {
        return item;
      }
    }
  }

  function getLink(obj, linkName, altName) {
    if (!obj || !obj._links) {
      return;
    }
    
    var link = clone(obj._links[linkName]);

    // If a link has a name and we have an altName, return if they match
    if (link && link.name && altName) {
      if (link.name === altName) {
        return link;
      }
    } else {
      return link;
    }
  }

  module.exports = {
    base64UrlToBase64: base64UrlToBase64,
    base64UrlToString: base64UrlToString,
    stringToBuffer: stringToBuffer,
    base64UrlDecode: base64UrlDecode,
    bind: bind,
    isAbsoluteUrl: isAbsoluteUrl,
    isString: isString,
    isObject: isObject,
    isoToUTCString: isoToUTCString,
    toQueryParams: toQueryParams,
    genRandomString: genRandomString,
    extend: extend,
    removeNils: removeNils,
    clone: clone,
    omit: omit,
    find: find,
    getLink: getLink
  };


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

  /* globals STATE_TOKEN_COOKIE_NAME, DEFAULT_POLLING_DELAY */
  /* eslint-disable complexity */
  var http              = __webpack_require__(8);
  var util              = __webpack_require__(6);
  var Q                 = __webpack_require__(10);
  var AuthSdkError      = __webpack_require__(12);
  var AuthPollStopError = __webpack_require__(13);

  function addStateToken(res, options) {
    var builtArgs = util.clone(options) || {};

    // Add the stateToken if one isn't passed and we have one
    if (!builtArgs.stateToken && res.stateToken) {
      builtArgs.stateToken = res.stateToken;
    }

    return builtArgs;
  }

  function getStateToken(res) {
    return addStateToken(res);
  }

  function transactionStatus(sdk, args) {
    args = addStateToken(sdk, args);
    return http.post(sdk, sdk.options.url + '/api/v1/authn', args);
  }

  function resumeTransaction(sdk, args) {
    if (!args || !args.stateToken) {
      var stateToken = sdk.tx.exists._getCookie(("oktaStateToken"));
      if (stateToken) {
        args = {
          stateToken: stateToken
        };
      } else {
        return Q.reject(new AuthSdkError('No transaction to resume'));
      }
    }
    return sdk.tx.status(args)
      .then(function(res) {
        return new AuthTransaction(sdk, res);
      });
  }

  function transactionExists(sdk) {
    // We have a cookie state token
    return !!sdk.tx.exists._getCookie(("oktaStateToken"));
  }

  function postToTransaction(sdk, url, options) {
    return http.post(sdk, url, options)
      .then(function(res) {
        return new AuthTransaction(sdk, res);
      });
  }

  function getPollFn(sdk, res, ref) {
    return function (delay) {
      if (!delay && delay !== 0) {
        delay = (500);
      }

      // Get the poll function
      var pollLink = util.getLink(res, 'next', 'poll');
      function pollFn() {
        return http.post(sdk, pollLink.href, getStateToken(res), true, true);
      }

      ref.isPolling = true;

      var retryCount = 0;
      var recursivePoll = function () {

        // If the poll was manually stopped during the delay
        if (!ref.isPolling) {
          return Q.reject(new AuthPollStopError());
        }

        return pollFn()
          .then(function (pollRes) {
            // Reset our retry counter on success
            retryCount = 0;

            // If we're still waiting
            if (pollRes.factorResult && pollRes.factorResult === 'WAITING') {

              // If the poll was manually stopped while the pollFn was called
              if (!ref.isPolling) {
                throw new AuthPollStopError();
              }

              // Continue poll
              return Q.delay(delay)
                .then(recursivePoll);

            } else {
              // Any non-waiting result, even if polling was stopped
              // during a request, will return
              ref.isPolling = false;
              return new AuthTransaction(sdk, pollRes);
            }
          })
          .fail(function(err) {
            // Exponential backoff, up to 16 seconds
            if (err.xhr &&
                (err.xhr.status === 0 || err.xhr.status === 429) &&
                retryCount <= 4) {
              var delayLength = Math.pow(2, retryCount) * 1000;
              retryCount++;
              return Q.delay(delayLength)
                .then(recursivePoll);
            }
            throw err;
          });
      };
      return recursivePoll()
        .fail(function(err) {
          ref.isPolling = false;
          throw err;
        });
    };
  }

  function link2fn(sdk, res, obj, link, ref) {
    if (Array.isArray(link)) {
      return function(name, opts) {
        if (!name) {
          throw new AuthSdkError('Must provide a link name');
        }

        var lk = util.find(link, {name: name});
        if (!lk) {
          throw new AuthSdkError('No link found for that name');
        }

        return link2fn(sdk, res, obj, lk, ref)(opts);
      };

    } else if (link.hints &&
        link.hints.allow &&
        link.hints.allow.length === 1) {
      var method = link.hints.allow[0];
      switch (method) {

        case 'GET':
          return function() {
            return http.get(sdk, link.href);
          };

        case 'POST':
          return function(opts) {
            if (ref && ref.isPolling) {
              ref.isPolling = false;
            }

            var data = addStateToken(res, opts);

            if (res.status === 'MFA_ENROLL') {
              // Add factorType and provider
              util.extend(data, {
                factorType: obj.factorType,
                provider: obj.provider
              });
            }

            var href = link.href;
            if (data.rememberDevice !== undefined) {
              if (data.rememberDevice) {
                href += '?rememberDevice=true';
              }
              data = util.omit(data, 'rememberDevice');

            } else if (data.profile &&
                      data.profile.updatePhone !== undefined) {
              if (data.profile.updatePhone) {
                href += '?updatePhone=true';
              }
              data.profile = util.omit(data.profile, 'updatePhone');
            }

            return postToTransaction(sdk, href, data);
          };
      }
    }
  }

  function links2fns(sdk, res, obj, ref) {
    var fns = {};
    for (var linkName in obj._links) {
      if (!obj._links.hasOwnProperty(linkName)) {
        continue;
      }

      var link = obj._links[linkName];
      
      if (linkName === 'next') {
        linkName = link.name;
      }

      if (link.type) {
        fns[linkName] = link;
        continue;
      }

      switch (linkName) {
        // poll is only found at the transaction
        // level, so we don't need to pass the link
        case 'poll':
          fns.poll = getPollFn(sdk, res, ref);
          break;

        default:
          var fn = link2fn(sdk, res, obj, link, ref);
          if (fn) {
            fns[linkName] = fn;
          }
      }
    }
    return fns;
  }

  function flattenEmbedded(sdk, res, obj, ref) {
    obj = obj || res;
    obj = util.clone(obj);

    if (Array.isArray(obj)) {
      var objArr = [];
      for (var o = 0, ol = obj.length; o < ol; o++) {
        objArr.push(flattenEmbedded(sdk, res, obj[o], ref));
      }
      return objArr;
    }

    var embedded = obj._embedded || {};

    for (var key in embedded) {
      if (!embedded.hasOwnProperty(key)) {
        continue;
      }

      // Flatten any nested _embedded objects
      if (util.isObject(embedded[key]) || Array.isArray(embedded[key])) {
        embedded[key] = flattenEmbedded(sdk, res, embedded[key], ref);
      }
    }

    // Convert any links on the embedded object
    var fns = links2fns(sdk, res, obj, ref);
    util.extend(embedded, fns);

    obj = util.omit(obj, '_embedded', '_links');
    util.extend(obj, embedded);
    return obj;
  }

  function AuthTransaction(sdk, res) {
    if (res) {
      this.data = res;
      util.extend(this, flattenEmbedded(sdk, res, res, {}));
      delete this.stateToken;

      // RECOVERY_CHALLENGE has some responses without _links.
      // Without _links, we emulate cancel to make it intuitive
      // to return to the starting state. We may remove this
      // when OKTA-75434 is resolved
      if (res.status === 'RECOVERY_CHALLENGE' && !res._links) {
        this.cancel = function() {
          return new Q(new AuthTransaction(sdk));
        };
      }
    }
  }

  module.exports = {
    transactionStatus: transactionStatus,
    resumeTransaction: resumeTransaction,
    transactionExists: transactionExists,
    postToTransaction: postToTransaction
  };


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

  /* globals SDK_VERSION, STATE_TOKEN_COOKIE_NAME */
  /* eslint-disable complexity */
  var util = __webpack_require__(6);
  var cookies = __webpack_require__(9);
  var Q = __webpack_require__(10);
  var AuthApiError = __webpack_require__(11);

  function httpRequest(sdk, url, method, args, dontSaveResponse) {
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Okta-SDK': 'okta-auth-js-' + ("1.0.2")
    };
    util.extend(headers, sdk.options.headers || {});

    var options = {
      headers: headers,
      data: args || undefined
    };

    var err, res;
    return new Q(sdk.options.ajaxRequest(method, url, options))
      .then(function(resp) {
        res = resp.responseText;
        if (res && util.isString(res)) {
          res = JSON.parse(res);
        }

        if (!dontSaveResponse) {
          if (!res.stateToken) {
            cookies.deleteCookie(("oktaStateToken"));
          }
        }

        if (res && res.stateToken && res.expiresAt) {
          cookies.setCookie(("oktaStateToken"), res.stateToken, res.expiresAt);
        }

        return res;
      })
      .fail(function(resp) { 
        var serverErr = resp.responseText || {};
        if (util.isString(serverErr)) {
          try {
            serverErr = JSON.parse(serverErr);
          } catch (e) {
            serverErr = {
              errorSummary: 'Unknown error'
            };
          }
        }

        if (resp.status >= 500) {
          serverErr.errorSummary = 'Unknown error';
        }

        if (sdk.options.transformErrorXHR) {
          resp = sdk.options.transformErrorXHR(util.clone(resp));
        }

        err = new AuthApiError(serverErr, resp);

        if (err.errorCode === 'E0000011') {
          cookies.deleteCookie(("oktaStateToken"));
        }

        throw err;
      });
  }

  function get(sdk, url, saveResponse) {
    url = util.isAbsoluteUrl(url) ? url : sdk.options.url + url;
    return httpRequest(sdk, url, 'GET', undefined, !saveResponse);
  }

  function post(sdk, url, args, dontSaveResponse) {
    url = util.isAbsoluteUrl(url) ? url : sdk.options.url + url;
    return httpRequest(sdk, url, 'POST', args, dontSaveResponse);
  }

  module.exports = {
    get: get,
    post: post,
    httpRequest: httpRequest
  };


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

  var util = __webpack_require__(6);

  function setCookie(name, value, expiresAt) {
    var expiresText = '';
    if (expiresAt) {
      expiresText = ' expires=' + util.isoToUTCString(expiresAt) + ';';
    }

    var cookieText = name + '=' + value + ';' + expiresText;
    document.cookie = cookieText;

    return cookieText;
  }

  function getCookie(name) {
    var pattern = new RegExp(name + '=([^;]*)'),
        matched = document.cookie.match(pattern);

    if (matched) {
      var cookie = matched[1];
      return cookie;
    }
  }

  function deleteCookie(name) {
    setCookie(name, '', '1970-01-01T00:00:00Z');
  }

  module.exports = {
    setCookie: setCookie,
    getCookie: getCookie,
    deleteCookie: deleteCookie
  };


/***/ },
/* 10 */
/***/ function(module, exports) {

  module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ },
/* 11 */
/***/ function(module, exports) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  function AuthApiError(err, xhr) {
    this.name = 'AuthApiError';
    this.message = err.errorSummary;
    this.errorSummary = err.errorSummary;
    this.errorCode = err.errorCode;
    this.errorLink = err.errorLink;
    this.errorId = err.errorId;
    this.errorCauses = err.errorCauses;

    if (xhr) {
      this.xhr = xhr;
    }
  }
  AuthApiError.prototype = new Error();

  module.exports = AuthApiError;


/***/ },
/* 12 */
/***/ function(module, exports) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  function AuthSdkError(msg, xhr) {
    this.name = 'AuthSdkError';
    this.message = msg;

    this.errorCode = 'INTERNAL';
    this.errorSummary = msg;
    this.errorLink = 'INTERNAL';
    this.errorId = 'INTERNAL';
    this.errorCauses = [];
    if (xhr) {
      this.xhr = xhr;
    }
  }
  AuthSdkError.prototype = new Error();

  module.exports = AuthSdkError;


/***/ },
/* 13 */
/***/ function(module, exports) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  function AuthPollStopError() {
    this.name = 'AuthPollStopError';
    this.message = 'The poll was stopped by the sdk';
  }
  AuthPollStopError.prototype = new Error();

  module.exports = AuthPollStopError;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

  var util = __webpack_require__(6);
  var http = __webpack_require__(8);

  function sessionExists(sdk) {
    return sdk.session.get()
      .then(function(res) {
        if (res.status === 'ACTIVE') {
          return true;
        }
        return false;
      })
      .fail(function() {
        return false;
      });
  }

  function getSession(sdk) { 
    return http.get(sdk, '/api/v1/sessions/me')
    .then(function(session) {
      var res = util.omit(session, '_links');

      res.refresh = function() {
        return http.post(sdk, util.getLink(session, 'refresh').href);
      };

      res.user = function() {
        return http.get(sdk, util.getLink(session, 'user').href);
      };

      return res;
    })
    .fail(function() {
      // Return INACTIVE status on failure
      return {status: 'INACTIVE'};
    });
  }

  function closeSession(sdk) {
    return http.httpRequest(sdk, sdk.options.url + '/api/v1/sessions/me', 'DELETE', undefined, true);
  }

  function refreshSession(sdk) {
    return http.post(sdk, '/api/v1/sessions/me/lifecycle/refresh');
  }

  function setCookieAndRedirect(sdk, sessionToken, redirectUrl) {
    redirectUrl = redirectUrl || window.location.href;
    window.location = sdk.options.url + '/login/sessionCookieRedirect' +
      util.toQueryParams({
        checkAccountSetupComplete: true,
        token: sessionToken,
        redirectUrl: redirectUrl
      });
  }

  module.exports = {
    sessionExists: sessionExists,
    getSession: getSession,
    closeSession: closeSession,
    refreshSession: refreshSession,
    setCookieAndRedirect: setCookieAndRedirect
  };


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

  /* globals FRAME_ID */
  /* eslint-disable complexity, max-statements */
  var http          = __webpack_require__(8);
  var util          = __webpack_require__(6);
  var Q             = __webpack_require__(10);
  var sdkCrypto     = __webpack_require__(16);
  var AuthSdkError  = __webpack_require__(12);
  var OAuthError    = __webpack_require__(17);

  function getWellKnown(sdk) {
    return http.get(sdk, sdk.options.url + '/.well-known/openid-configuration');
  }

  function validateClaims(claims, iss, aud) {
    if (!claims || !iss || !aud) {
      throw new AuthSdkError('The jwt, iss, and aud arguments are all required');
    }

    var now = Math.floor(new Date().getTime()/1000);

    if (claims.iss !== iss) {
      throw new AuthSdkError('The issuer [' + claims.iss + '] ' +
        'does not match [' + iss + ']');
    }

    if (claims.aud !== aud) {
      throw new AuthSdkError('The audience [' + claims.aud + '] ' +
        'does not match [' + aud + ']');
    }

    if (claims.iat > claims.exp) {
      throw new AuthSdkError('The JWT expired before it was issued');
    }

    if (now > claims.exp) {
      throw new AuthSdkError('The JWT expired and is no longer valid');
    }

    if (claims.iat > now) {
      throw new AuthSdkError('The JWT was issued in the future');
    }
  }

  function decodeIdToken(idToken) {
    var jwt = idToken.split('.');
    var decodedToken;

    try {
      decodedToken = {
        header: JSON.parse(util.base64UrlToString(jwt[0])),
        payload: JSON.parse(util.base64UrlToString(jwt[1])),
        signature: jwt[2]
      };
    } catch(e) {
      throw new AuthSdkError('Malformed idToken');
    }

    return decodedToken;
  }

  function verifyIdToken(sdk, idToken, options) {
    options = options || {};

    if (!sdk.features.isTokenVerifySupported()) {
      return Q.reject(new AuthSdkError('This browser doesn\'t support crypto.subtle'));
    }

    function isExpired(jwtExp) {
      var expirationTime;
      if (options.expirationTime || options.expirationTime === 0) {
        expirationTime = options.expirationTime;
      } else {
        expirationTime = Math.floor(Date.now()/1000);
      }
      if (jwtExp &&
          jwtExp > expirationTime) {
        return true;
      }
    }

    function hasAudience(jwtAudience) {
      if (!options.audience) {
        return true;
      }
      var audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
      var jwtAudiences = Array.isArray(jwtAudience) ? jwtAudience : [jwtAudience];
      var ai = audiences.length;
      while (ai--) {
        var aud = audiences[ai];
        if (jwtAudiences.indexOf(aud) !== -1) {
          return true;
        }
      }
    }

    return getWellKnown(sdk)
      .then(function(res) {
        return http.get(sdk, res['jwks_uri']);
      })
      .then(function(res) {
        var key = res.keys[0];
        return sdkCrypto.verifyToken(idToken, key);
      })
      .then(function(res) {
        if (!res) {
          return false;
        }
        var jwt = sdk.idToken.decode(idToken);

        if (isExpired(jwt.payload.exp)) {
          return false;
        }

        if (!hasAudience(jwt.payload.aud)) {
          return false;
        }

        if (options.issuer &&
            options.issuer !== jwt.payload.iss) {
          return false;
        }

        return true;
      });
  }

  function refreshIdToken(sdk, opts) {
    opts = opts || {};
    opts.display = null;
    opts.prompt = 'none';
    return getIdToken(sdk, opts);
  }

  function loadFrame(src, iframeId) {
    if (typeof iframeId === 'undefined') {
      return;
    }

    var iframe = document.getElementById(iframeId);
    if (iframe) {
      return iframe;
    }
    
    iframe = document.createElement('iframe');
    iframe.setAttribute('id', iframeId);
    iframe.style.display = 'none';
    iframe.src = src;

    return document.body.appendChild(iframe);
  }

  function loadPopup(src, options) {
    var title = options.popupTitle || 'External Identity Provider User Authentication';
    var appearance = 'toolbar=no, scrollbars=yes, resizable=yes, ' +
      'top=100, left=500, width=600, height=600';
    return window.open(src, title, appearance);
  }

  function addListener(eventTarget, name, fn) {
      if (eventTarget.addEventListener) {
        eventTarget.addEventListener(name, fn);
      } else {
        eventTarget.attachEvent('on' + name, fn);
      }
    }

  function removeListener(eventTarget, name, fn) {
    if (eventTarget.removeEventListener) {
      eventTarget.removeEventListener(name, fn);
    } else {
      eventTarget.detachEvent('on' + name, fn);
    }
  }

  function addPostMessageListener(sdk, timeout) {
    var deferred = Q.defer();

    function responseHandler(e) {
      if (!e.data || e.origin !== sdk.options.url) {
        return;
      }
      deferred.resolve(e.data);
    }

    addListener(window, 'message', responseHandler);

    return deferred.promise.timeout(timeout || 120000, new AuthSdkError('OAuth flow timed out'))
      .fin(function() {
        removeListener(window, 'message', responseHandler);
      });
  }

  function addFragmentListener(sdk, windowEl, timeout) {
    var deferred = Q.defer();

    // Predefine regexs for parsing hash
    var plus2space = /\+/g;
    var paramSplit = /([^&=]+)=?([^&]*)/g;

    function hashToObject(hash) {
      // Remove the leading hash
      var fragment = hash.substring(1);

      var obj = {};

      // Loop until we have no more params
      var param;
      while (true) { // eslint-disable-line no-constant-condition
        param = paramSplit.exec(fragment);
        if (!param) { break; }

        var key = param[1];
        var value = param[2];

        // id_token should remain base64url encoded
        if (key === 'id_token') {
          obj[key] = value;
        } else {
          obj[key] = decodeURIComponent(value.replace(plus2space, ' '));
        }
      }
      return obj;
    }

    function hashChangeHandler() {
      /*
        We are only able to access window.location.hash on a window
        that has the same domain. A try/catch is necessary because
        there's no other way to determine that the popup is in
        another domain. When we try to access a window on another 
        domain, an error is thrown.
      */
      try {
        if (windowEl &&
            windowEl.location &&
            windowEl.location.hash) {
          deferred.resolve(hashToObject(windowEl.location.hash));
        } else if (windowEl && !windowEl.closed) {
          setTimeout(hashChangeHandler, 500);
        }
      } catch (err) {
        setTimeout(hashChangeHandler, 500);
      }
    }

    hashChangeHandler();

    return deferred.promise.timeout(timeout || 120000, new AuthSdkError('OAuth flow timed out'));
  }

  /*
   * Retrieve an idToken from an Okta or a third party idp
   * 
   * Two main flows:
   *
   *  1) Exchange a sessionToken for an idToken
   * 
   *    Required:
   *      clientId: passed via the OktaAuth constructor or into getIdToken
   *      sessionToken: 'yourtoken'
   *
   *    Optional:
   *      redirectUri: defaults to window.location.href
   *      scopes: defaults to ['openid', 'email']
   *
   *    Forced:
   *      prompt: 'none'
   *      responseMode: 'okta_post_message'
   *      display: undefined
   *
   *  2) Get an idToken from an idp
   *
   *    Required:
   *      clientId: passed via the OktaAuth constructor or into getIdToken
   *
   *    Optional:
   *      redirectUri: defaults to window.location.href
   *      scopes: defaults to ['openid', 'email']
   *      idp: defaults to Okta as an idp
   *      prompt: no default. Pass 'none' to throw an error if user is not signed in
   *
   *    Forced:
   *      display: 'popup'
   *
   *  Only common optional params shown. Any OAuth parameters not explicitly forced are available to override
   *
   * @param {Object} oauthOptions
   * @param {String} [oauthOptions.clientId] ID of this client
   * @param {String} [oauthOptions.redirectUri] URI that the iframe or popup will go to once authenticated
   * @param {String[]} [oauthOptions.scopes] OAuth 2.0 scopes to request (openid must be specified)
   * @param {String} [oauthOptions.idp] ID of an external IdP to use for user authentication
   * @param {String} [oauthOptions.sessionToken] Bootstrap Session Token returned by the Okta Authentication API
   * @param {String} [oauthOptions.prompt] Determines whether the Okta login will be displayed on failure.
   *                                       Use 'none' to prevent this behavior
   *
   * @param {Object} options
   * @param {Integer} [options.timeout] Time in ms before the flow is automatically terminated. Defaults to 120000
   * @param {String} [options.popupTitle] Title dispayed in the popup.
   *                                      Defaults to 'External Identity Provider User Authentication'
   */
  function getIdToken(sdk, oauthOptions, options) {
    if (!oauthOptions) {
      oauthOptions = {};
    }

    if (!options) {
      options = {};
    }

    // Default OAuth query params
    var oauthParams = {
      clientId: sdk.options.clientId,
      redirectUri: sdk.options.redirectUri || window.location.href,
      responseType: 'id_token',
      responseMode: 'okta_post_message',
      state: util.genRandomString(64),
      nonce: util.genRandomString(64),
      scope: ['openid', 'email']
    };

    // Add user-provided options
    util.extend(oauthParams, oauthOptions);

    // Start overriding any options that don't make sense
    var sessionTokenOverrides = {
      prompt: 'none',
      responseMode: 'okta_post_message',
      display: null
    };

    var idpOverrides = {
      display: 'popup'
    };

    if (oauthOptions.sessionToken) {
      util.extend(oauthParams, sessionTokenOverrides);
    } else if (oauthOptions.idp) {
      util.extend(oauthParams, idpOverrides);
    }

    // Quick validation
    if (!oauthParams.clientId) {
      throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get an idToken');
    }

    // Convert our params to their actual OAuth equivalents
    var oauthQueryHash = util.removeNils({
      'client_id': oauthParams.clientId,
      'redirect_uri': oauthParams.redirectUri,
      'response_type': oauthParams.responseType,
      'response_mode': oauthParams.responseMode,
      'state': oauthParams.state,
      'nonce': oauthParams.nonce,
      'prompt': oauthParams.prompt,
      'display': oauthParams.display,
      'sessionToken': oauthParams.sessionToken,
      'idp': oauthParams.idp
    });

    if (oauthParams.scope.indexOf('openid') !== -1) {
      oauthQueryHash.scope = oauthParams.scope.join(' ');
    } else {
      throw new AuthSdkError('openid scope must be specified in the scope argument');
    }

    // Use the query params to build the authorize url
    var requestUrl = sdk.options.url + '/oauth2/v1/authorize' + util.toQueryParams(oauthQueryHash);

    // Determine the flow type
    var flowType;
    if (oauthParams.sessionToken || oauthParams.display === null) {
      flowType = 'IFRAME';
    } else if (oauthParams.display === 'popup') {
      flowType = 'POPUP';
    } else {
      flowType = 'IMPLICIT';
    }

    function handleOAuthResponse(res) {
      if (res['error'] || res['error_description']) {
        throw new OAuthError(res['error'], res['error_description']);

      } else if (res['id_token']) {
        if (res.state !== oauthParams.state) {
          throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
        }

        var jwt = sdk.idToken.decode(res['id_token']);
        if (jwt.payload.nonce !== oauthParams.nonce) {
          throw new AuthSdkError('OAuth flow response nonce doesn\'t match request nonce');
        }

        validateClaims(jwt.payload, sdk.options.url, oauthParams.clientId);
        return {
          idToken: res['id_token'],
          claims: jwt.payload
        };

      } else {
        throw new AuthSdkError('Unable to parse OAuth flow response');
      }
    }

    function getOrigin(url) {
      var originRegex = /^(https?\:\/\/)?([^:\/?#]*(?:\:[0-9]+)?)/;
      return originRegex.exec(url)[0];
    }

    // Execute the flow type
    switch (flowType) {
      case 'IFRAME':
        var iframePromise = addPostMessageListener(sdk, options.timeout);
        var iframeEl = loadFrame(requestUrl, ("okta-oauth-helper-frame"));
        return iframePromise
          .then(handleOAuthResponse)
          .fin(function() {
            if (document.body.contains(iframeEl)) {
              iframeEl.parentElement.removeChild(iframeEl);
            }
          });

      case 'POPUP': // eslint-disable-line no-case-declarations
        var popupPromise;

        // Add listener on postMessage before window creation, so
        // postMessage isn't triggered before we're listening
        if (oauthParams.responseMode === 'okta_post_message') {
          if (!sdk.features.isPopupPostMessageSupported()) {
            return Q.reject(new AuthSdkError('This browser doesn\'t have full postMessage support'));
          }
          popupPromise = addPostMessageListener(sdk, options.timeout);
        }

        // Create the window
        var windowOptions = {
          popupTitle: options.popupTitle
        };
        var windowEl = loadPopup(requestUrl, windowOptions);

        // Poll until we get a valid hash fragment
        if (oauthParams.responseMode === 'fragment') {
          var windowOrigin = getOrigin(sdk.idToken.authorize._getLocationHref());
          var redirectUriOrigin = getOrigin(oauthParams.redirectUri);
          if (windowOrigin !== redirectUriOrigin) {
            return Q.reject(new AuthSdkError('Using fragment, the redirectUri origin (' + redirectUriOrigin +
              ') must match the origin of this page (' + windowOrigin + ')'));
          }
          popupPromise = addFragmentListener(sdk, windowEl, options.timeout);
        }

        // Both postMessage and fragment require a poll to see if the popup closed
        var popupDeferred = Q.defer();
        function hasClosed(win) { // eslint-disable-line no-inner-declarations
          if (win.closed) {
            popupDeferred.reject(new AuthSdkError('Unable to parse OAuth flow response'));
          }
        }
        var closePoller = setInterval(function() {
          hasClosed(windowEl);
        }, 500);

        // Proxy the promise results into the deferred
        popupPromise
        .then(function(res) {
          popupDeferred.resolve(res);
        })
        .fail(function(err) {
          popupDeferred.reject(err);
        });

        return popupDeferred.promise
          .then(handleOAuthResponse)
          .fin(function() {
            if (!windowEl.closed) {
              clearInterval(closePoller);
              windowEl.close();
            }
          });

      default:
        return Q.reject(new AuthSdkError('The full page redirect flow is not supported'));
    }
  }

  module.exports = {
    getIdToken: getIdToken,
    refreshIdToken: refreshIdToken,
    decodeIdToken: decodeIdToken,
    verifyIdToken: verifyIdToken
  };


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  var util = __webpack_require__(6);

  function verifyToken(idToken, key) {
    var format = 'jwk';
    var algo = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' }
    };
    var extractable = true;
    var usages = ['verify'];

    return crypto.subtle.importKey(
      format,
      key,
      algo,
      extractable,
      usages
    )
    .then(function(cryptoKey) {
      var jwt = idToken.split('.');
      var payload = util.stringToBuffer(jwt[0] + '.' + jwt[1]);
      var b64Signature = util.base64UrlDecode(jwt[2]);
      var signature = util.stringToBuffer(b64Signature);

      return crypto.subtle.verify(
        algo,
        cryptoKey,
        signature,
        payload
      );
    });
  }

  module.exports = {
    verifyToken: verifyToken
  };


/***/ },
/* 17 */
/***/ function(module, exports) {

  /*!
   * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
   * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
   *
   * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *
   * See the License for the specific language governing permissions and limitations under the License.
   */

  function OAuthError(errorCode, summary) {
    this.name = 'OAuthError';
    this.message = summary;

    this.errorCode = errorCode;
    this.errorSummary = summary;
  }
  OAuthError.prototype = new Error();

  module.exports = OAuthError;


/***/ }
/******/ ])});;
