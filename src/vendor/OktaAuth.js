define(['vendor/lib/q', 'jquery'], function(Q, $) {

/* Base64.js
 *
 * Copyright 2015 David Chambers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
!function(){function t(t){this.message=t}var r="undefined"!=typeof exports?exports:this,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";t.prototype=new Error,t.prototype.name="InvalidCharacterError",r.btoa||(r.btoa=function(r){for(var o,n,a=String(r),i=0,c=e,d="";a.charAt(0|i)||(c="=",i%1);d+=c.charAt(63&o>>8-i%1*8)){if(n=a.charCodeAt(i+=.75),n>255)throw new t("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");o=o<<8|n}return d}),r.atob||(r.atob=function(r){var o=String(r).replace(/=+$/,"");if(o.length%4==1)throw new t("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,a,i=0,c=0,d="";a=o.charAt(c++);~a&&(n=i%4?64*n+a:a,i++%4)?d+=String.fromCharCode(255&n>>(-2*i&6)):0)a=e.indexOf(a);return d})}(); // jshint ignore:line

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


function isVerifySupported() {
  return typeof crypto !== 'undefined' && crypto.subtle && typeof Uint8Array !== 'undefined';
}

function stringToBuffer(str) {
  var res = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) {
    res[i] = str.charCodeAt(i);
  }
  return res;
}

function base64UrlDecode(str) {
  return atob(base64UrlToBase64(str));
}

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
    var payload = stringToBuffer(jwt[0] + '.' + jwt[1]);
    var b64Signature = base64UrlDecode(jwt[2]);
    var signature = stringToBuffer(b64Signature);

    return crypto.subtle.verify(
      algo,
      cryptoKey,
      signature,
      payload
    );
  });
}


/* globals process, console, Q, JSON, escape, verifyToken, isVerifySupported */
/*jshint maxcomplexity:15 */

var LOG_PREFIX = '[OktaAuth]';
var STATE_TOKEN_COOKIE_NAME = 'oktaStateToken';
var FRAME_ID = 'okta-oauth-helper-frame';
var DEFAULT_POLLING_DELAY = 500;
var DEBUG = false;
var IS_NODE = 'object' === typeof process && Object.prototype.toString.call(process) === '[object process]';
var IS_BROWSER = !IS_NODE;

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

function OAuthError(errorCode, summary) {
  this.name = 'OAuthError';
  this.message = summary;

  this.errorCode = errorCode;
  this.errorSummary = summary;
}
OAuthError.prototype = new Error();

// LOGGING
function print(fn, args) {
  if (DEBUG) {
    var consoleArgs = Array.prototype.slice.call(args);
    consoleArgs.unshift(LOG_PREFIX + ' ');
    fn.apply(console, consoleArgs);
  }
}

function log() {
  if (typeof console !== 'undefined' && console.log) {
    return print(console.log, arguments);
  }
}

function error() {
  if (typeof console !== 'undefined' && console.error) {
    return print(console.error, arguments);
  }
}

// UTILS
function isAbsoluteUrl(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

function isoToDate(str) {
  var parts = str.match(/\d+/g),
      isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]),
      isoDate = new Date(isoTime);

  return isoDate;
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

function setCookie(name, value, expiresAt) {
  if (!IS_BROWSER) {
    return;
  }

  var expiresText = '';
  if (expiresAt) {
    expiresText = ' expires=' + isoToDate(expiresAt).toUTCString() + ';';
  }

  var cookieText = name + '=' + value + ';' + expiresText;
  log('Set cookie: ' + cookieText);
  document.cookie = cookieText;

  return cookieText;
}

function getCookie(name) {
  if (!IS_BROWSER) {
    return;
  }

  var pattern = new RegExp(name + '=([^;]*)'),
    matched = document.cookie.match(pattern);

  if (matched) {
    var cookie = matched[1];
    log('Got cookie: ', cookie);
    return cookie;
  }
}

function deleteCookie(name) {
  setCookie(name, '', '1970-01-01T00:00:00Z');
}

function addStateToken(trans, options) {
  var builtArgs = clone(options) || {};

  // Add the stateToken if one isn't passed and we have one
  if (!builtArgs.stateToken && trans.response && trans.response.stateToken) {
    builtArgs.stateToken = trans.response.stateToken;
  }

  return builtArgs;
}

function getStateToken(trans) {
  return addStateToken(trans);
}

function AuthTransaction(sdk, res) {
  if (res) {
    this.response = res;

    if (res.status) {
      this.status = res.status;
      var methods = STATE_MAP[res.status](sdk, this);
      extend(this, methods);
    }
  }
}

function postToTransaction(sdk, uri, options) {
  return sdk.post(uri, options)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
}

function getCancelFn(sdk, trans, ref) {
  function cancel() {
    if (ref) {
      ref.isPolling = false;
    }
    var cancelLink = getLink(trans.response, 'cancel');
    return postToTransaction(sdk, cancelLink.href, getStateToken(trans));
  }
  return cancel;
}

function getPreviousFn(sdk, trans, ref) {
  function previous() {
    if (ref) {
      ref.isPolling = false;
    }
    var previousLink = getLink(trans.response, 'prev');
    return postToTransaction(sdk, previousLink.href, getStateToken(trans));
  }
  return previous;
}

function getPollFn(sdk, trans, ref) {
  return function (delay) {
    if (!delay && delay !== 0) {
      delay = DEFAULT_POLLING_DELAY;
    }

    // Get the poll function
    var pollLink = getLink(trans.response, 'next', 'poll');
    function pollFn() {
      return sdk.post(pollLink.href, getStateToken(trans), true, true);
    }

    // Exposed to stop any polling in tests
    pollFn.__ref = ref;

    ref.isPolling = true;

    var retryCount = 0;
    var recursivePoll = function () {

      // If the poll was manually stopped during the delay
      if (!ref.isPolling) {
        return Q.resolve(trans);
      }

      return pollFn()
        .then(function (res) {
          // Reset our retry counter on success
          retryCount = 0;

          // If we're still waiting
          if (res.factorResult && res.factorResult === 'WAITING') {

            // If the poll was manually stopped while the pollFn was called
            if (!ref.isPolling) {
              return trans;
            }

            // Continue poll
            return Q.delay(delay)
              .then(recursivePoll);

          } else {
            // Any non-waiting result, even if polling was stopped
            // during a request, will return
            ref.isPolling = false;
            return new AuthTransaction(sdk, res);
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

// STATE DEFINITIONS
var STATE_MAP = {}; /* jshint ignore: line */

STATE_MAP['RECOVERY'] = function (sdk, trans) {
  var answerLink = getLink(trans.response, 'next', 'answer');
  if (answerLink) {
    return {

      // { answer }
      answerRecoveryQuestion: function (options) {
        var data = addStateToken(trans, options);
        return postToTransaction(sdk, answerLink.href, data);
      },

      // no arguments
      cancel: getCancelFn(sdk, trans)
    };

  } else {
    return {

      // { recoveryToken }
      verifyRecoveryToken: function (options) {
        var recoveryLink = getLink(trans.response, 'next', 'recovery');
        return postToTransaction(sdk, recoveryLink.href, options);
      },

      // no arguments
      cancel: getCancelFn(sdk, trans)
    };
  }
};

STATE_MAP['RECOVERY_CHALLENGE'] = function (sdk, trans) {
  // This state has some responses without _links.
  // Without _links, we emulate cancel to make it
  // intuitive to return to the starting state. We 
  // may remove this when OKTA-75434 is resolved
  if (!trans.response._links) {
    return {
      cancel: function() {
        return new Q(new AuthTransaction(sdk));
      }
    };
  }

  return {

    // { passCode }
    verifyRecovery: function(options) {
      var data = addStateToken(trans, options);
      var verifyLink = getLink(trans.response, 'next', 'verify');

      return postToTransaction(sdk, verifyLink.href, data);
    },

    resendByName: function(name) {
      var resendLink = getLink(trans.response, 'resend', name);
      if (!resendLink) {
        var err = new AuthSdkError('"' + name + '" is not a valid name for recovery');
        return Q.reject(err);
      }
      return postToTransaction(sdk, resendLink.href, getStateToken(trans));
    },

    // no arguments
    cancel: getCancelFn(sdk, trans)
  };
};

STATE_MAP['LOCKED_OUT'] = function (sdk, trans) {
  return {

    // { username, (relayState) }
    unlockAccount: function (options) {
      var unlockLink = getLink(trans.response, 'next', 'unlock');
      return postToTransaction(sdk, unlockLink.href, options);
    },
    
    // no arguments
    cancel: getCancelFn(sdk, trans)
  };
};

STATE_MAP['PASSWORD_EXPIRED'] = function (sdk, trans) {
  return {

    // { newPassword }
    changePassword: function (options) {
      var data = addStateToken(trans, options);
      var passwordLink = getLink(trans.response, 'next', 'changePassword');
      return postToTransaction(sdk, passwordLink.href, data);
    },

    // no arguments
    cancel: getCancelFn(sdk, trans)
  };
};

STATE_MAP['PASSWORD_WARN'] = function (sdk, trans) {
  return {

    // { newPassword }
    changePassword: function (options) {
      var data = addStateToken(trans, options);
      var passwordLink = getLink(trans.response, 'next', 'changePassword');
      return postToTransaction(sdk, passwordLink.href, data);
    },

    // no arguments
    skip: function () {
      var skipLink = getLink(trans.response, 'skip', 'skip');
      return postToTransaction(sdk, skipLink.href, getStateToken(trans));
    },

    // no arguments
    cancel: getCancelFn(sdk, trans)
  };
};

STATE_MAP['PASSWORD_RESET'] = function (sdk, trans) {
  return {

    // { newPassword }
    resetPassword: function (options) {
      var data = addStateToken(trans, options);
      var passwordLink = getLink(trans.response, 'next', 'resetPassword');
      return postToTransaction(sdk, passwordLink.href, data);
    },

    // no arguments
    cancel: getCancelFn(sdk, trans)
  };
};

STATE_MAP['MFA_ENROLL'] = function (sdk, trans) {
  var methods = {

    // no arguments
    cancel: getCancelFn(sdk, trans),

    getFactorByTypeAndProvider: function (type, provider) {

      var factor = find(trans.response._embedded.factors, { factorType: type, provider: provider });
      if (!factor) {
        var err = 'No factor with a type of ' + type + ' and a provider of ' + provider;
        error(err);
        throw new AuthSdkError(err);
      }

      var factorMethods = {

        /*
          Append the profile property to the factor
          Type                | Profile
          question            | { question, answer }
          sms                 | { phoneNumber, updatePhone }
          token:software:totp | no profile
          push                | no profile
        */
        enrollFactor: function(options) {
          var enrollLink = getLink(factor, 'enroll');
          var data = clone(options) || {};

          if (data.profile && data.profile.updatePhone !== undefined) {
            if (data.profile.updatePhone) {
              enrollLink.href += '?updatePhone=true';
            }
            delete data.profile.updatePhone;
          }

          data.factorType = type;
          data.provider = provider;

          data = addStateToken(trans, data);
          return postToTransaction(sdk, enrollLink.href, data);
        }
      };

      if (type === 'question') {
        // no arguments
        factorMethods.getQuestions = function() {
          var questionLink = getLink(factor, 'questions');
          return sdk.get(questionLink.href);
        };
      }

      return factorMethods;
    }
  };

  var skipLink = getLink(trans.response, 'skip');
  if (skipLink) {
    methods.skip = function() {
      return postToTransaction(sdk, skipLink.href, getStateToken(trans));
    };
  }

  return methods;
};

STATE_MAP['MFA_ENROLL_ACTIVATE'] = function (sdk, trans) {

  // A reference to manage polling
  var ref = {
    isPolling: false
  };

  // Default methods for MFA_CHALLENGE states
  var methods = {

    // no arguments
    previous: getPreviousFn(sdk, trans, ref),

    // no arguments
    cancel: getCancelFn(sdk, trans, ref)
  };

  var pollLink = getLink(trans.response, 'next', 'poll');
  if (pollLink) {

    // polls until factorResult changes
    // optional polling interval in millis
    methods.startEnrollFactorPoll = getPollFn(sdk, trans, ref);

    // no arguments
    methods.stopEnrollFactorPoll = function() {
      ref.isPolling = false;
    };

  } else {

    /*
        Just send the profile
        Type                | Profile
        sms                 | { passCode }
        token:software:totp | { passCode }
        push                | no profile
    */
    methods.activateFactor = function(options) {
      var data = addStateToken(trans, options);
      var activateLink = getLink(trans.response, 'next', 'activate');
      return postToTransaction(sdk, activateLink.href, data);
    };
  }

  var resendLinks = getLink(trans.response, 'resend');
  if (resendLinks) {
    methods.resendByName = function(name) {
      var resendLink = find(resendLinks, { name: name });
      return postToTransaction(sdk, resendLink.href, getStateToken(trans));
    };
  }

  return methods;
};

STATE_MAP['MFA_REQUIRED'] = function (sdk, trans) {
  return {

    // no arguments
    cancel: getCancelFn(sdk, trans),

    getFactorById: function (id) {
      var factor = find(trans.response._embedded.factors, { id: id });
      if (!factor) {
        var err = 'No factor with an id of ' + id;
        error(err);
        throw new AuthSdkError(err);
      }

      return {

        /*
          Just send the profile
          Type                | Profile
          question            | { answer }
          sms (send passCode) | no arguments
          sms (validate)      | { passCode }
          token:software:totp | { passCode }
          push                | no arguments
        */
        verifyFactor: function(options) {
          var data = addStateToken(trans, options);
          var verifyLink = getLink(factor, 'verify');

          if (data && data.rememberDevice !== undefined) {
            if (data.rememberDevice) {
              verifyLink.href += '?rememberDevice=true';
            }
            delete data.rememberDevice;
          }

          return postToTransaction(sdk, verifyLink.href, data);
        }
      };
    }
  };
};

STATE_MAP['MFA_CHALLENGE'] = function (sdk, trans) {

  // A reference to manage polling
  var ref = {
    isPolling: false
  };

  // Default methods for MFA_CHALLENGE states
  var methods = {

    // no arguments
    previous: getPreviousFn(sdk, trans, ref),

    // no arguments
    cancel: getCancelFn(sdk, trans, ref)
  };

  var pollLink = getLink(trans.response, 'next', 'poll');

  if (pollLink) {

    // polls until factorResult changes
    // optional polling interval in millis
    methods.startVerifyFactorPoll = getPollFn(sdk, trans, ref);

    // no arguments
    methods.stopVerifyFactorPoll = function() {
      ref.isPolling = false;
    };

  } else {

    /*
      Just send the profile
      Type                | Profile
      question            | { answer }
      token:software:totp | { passCode }
    */
    methods.verifyFactor = function(options) {
      var data = addStateToken(trans, options);
      var verifyLink = getLink(trans.response, 'next', 'verify');

      if (data.rememberDevice !== undefined) {
        if (data.rememberDevice) {
          verifyLink.href += '?rememberDevice=true';
        }
        delete data.rememberDevice;
      }

      return postToTransaction(sdk, verifyLink.href, data);
    };
  }

  var resendLinks = getLink(trans.response, 'resend');
  if (resendLinks) {
    methods.resendByName = function(name) {
      var resendLink = find(resendLinks, { name: name });
      return postToTransaction(sdk, resendLink.href, getStateToken(trans));
    };
  }

  return methods;
};

STATE_MAP['SUCCESS'] = function () { return {}; };

// HTTP METHODS

function httpRequest(sdk, url, method, args, dontSaveResponse) {
  var options = {
    headers: sdk.headers,
    data: args || undefined
  };

  log('Request: ', method, url, options);

  var err, res;
  return new Q(sdk.ajaxRequest(method, url, options))
    .then(function(resp) { /* jshint ignore: line */
      log('Response: ', resp);

      res = resp.responseText;
      if (isString(res)) {
        res = JSON.parse(res);
      }

      if (!dontSaveResponse) {
        if (!res.stateToken) {
          deleteCookie(STATE_TOKEN_COOKIE_NAME);
        }
      }

      if (res && res.stateToken && res.expiresAt) {
        setCookie(STATE_TOKEN_COOKIE_NAME, res.stateToken, res.expiresAt);
      }

      return res;
    })
    .fail(function(resp) { 
      var serverErr = resp.responseText || {};
      if (isString(serverErr)) {
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

      error('Error: ' + resp);

      if (sdk.transformErrorXHR) {
        resp = sdk.transformErrorXHR(clone(resp));
      }

      err = new AuthApiError(serverErr, resp);

      if (err.errorCode === 'E0000011') {
        deleteCookie(STATE_TOKEN_COOKIE_NAME);
      }

      throw err;
    });
}

function OktaAuth(args) { // jshint ignore:line

  if (!(this instanceof OktaAuth)) {
    return new OktaAuth(args);
  }

  if (!args) {
    throw new AuthSdkError('OktaAuth must be provided arguments');
  }

  if (!args.uri) {
    throw new AuthSdkError('OktaAuth must be provided a uri');
  }

  DEBUG = args.debug;

  this.uri = args.uri;

  // Remove trailing forward slash
  if (this.uri.slice(-1) === '/') {
    this.uri = this.uri.slice(0, -1);
  }

  this.apiToken = args.apiToken;
  this.ajaxRequest = args.ajaxRequest || this.ajaxRequest;
  this.transformErrorXHR = args.transformErrorXHR;
  this.clientId = args.clientId;
  this.redirectUri = args.redirectUri;

  this.headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (args.apiToken) {
    this.headers['Authorization'] = 'SSWS ' + args.apiToken;
  }

  log('OktaAuth created');
}

var proto = OktaAuth.prototype;

proto.get = function(url, saveResponse) {
  url = isAbsoluteUrl(url) ? url : this.uri + url;
  return httpRequest(this, url, 'GET', undefined, !saveResponse);
};

proto.post = function(url, args, dontSaveResponse) {
  url = isAbsoluteUrl(url) ? url : this.uri + url;
  return httpRequest(this, url, 'POST', args, dontSaveResponse);
};

// { username, password, (relayState), (context) }
proto.primaryAuth = function (opts) {
  return postToTransaction(this, '/api/v1/authn', opts);
};

// { username, (relayState) }
proto.forgotPassword = function (opts) {
  return postToTransaction(this, '/api/v1/authn/recovery/password', opts);
};

// { username, (relayState) }
proto.unlockAccount = function (opts) {
  return postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
};

// { recoveryToken }
proto.verifyRecoveryToken = function (opts) {
  return postToTransaction(this, '/api/v1/authn/recovery/token', opts);
};

// NON-STANDARD METHODS

proto.resumeTransaction = function(args) {
  var sdk = this;
  if (!args || !args.stateToken) {
    var stateToken = sdk.transactionExists._getCookie(STATE_TOKEN_COOKIE_NAME);
    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Q.reject(new AuthSdkError('No transaction to resume'));
    }
  }
  return sdk.status(args)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
};

proto.transactionExists = function() {
  // We have a cookie state token
  return !!this.transactionExists._getCookie(STATE_TOKEN_COOKIE_NAME);
};

// This is exposed so we can mock document.cookie in our tests
proto.transactionExists._getCookie = function(name) {
  return getCookie(name);
};

// STANDARD METHODS

proto.status = function(args) {
  args = addStateToken(this, args);
  return this.post(this.uri + '/api/v1/authn', args);
};

proto.getWellKnown = function() {
  return this.get(this.uri + '/.well-known/openid-configuration');
};

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

proto.decodeIdToken = function(idToken) {
  var jwt = idToken.split('.');
  var decodedToken;

  try {
    decodedToken = {
      header: JSON.parse(base64UrlToString(jwt[0])),
      payload: JSON.parse(base64UrlToString(jwt[1])),
      signature: jwt[2]
    };
  } catch(e) {
    throw new AuthSdkError('Malformed idToken');
  }

  return decodedToken;
};

proto.isVerifySupported = isVerifySupported;

proto.verifyIdToken = function(idToken, options) {
  var sdk = this;
  options = options || {};

  if (!sdk.isVerifySupported()) {
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

  return sdk.getWellKnown()
    .then(function(res) {
      return sdk.get(res['jwks_uri']);
    })
    .then(function(res) {
      var key = res.keys[0];
      return verifyToken(idToken, key);
    })
    .then(function(res) {
      if (!res) {
        return false;
      }
      var jwt = sdk.decodeIdToken(idToken);

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
};

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

proto.isPopupPostMessageSupported = function() {
  var isIE8or9 = document.documentMode && document.documentMode < 10;
  if (window.postMessage && !isIE8or9) {
    return true;
  }
  return false;
};

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
    if (!e.data || e.origin !== sdk.uri) {
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
    while (true) {
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
 *      prompt: defaults to 'none'
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
proto.getIdToken = function (oauthOptions, options) {
  var sdk = this;

  if (!oauthOptions) {
    oauthOptions = {};
  }

  if (!options) {
    options = {};
  }

  // Default OAuth query params
  var oauthParams = {
    clientId: sdk.clientId,
    redirectUri: sdk.redirectUri || window.location.href,
    responseType: 'id_token',
    responseMode: 'okta_post_message',
    state: genRandomString(64),
    scope: ['openid', 'email'],
    prompt: 'none'
  };

  // Add user-provided options
  extend(oauthParams, oauthOptions);

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
    extend(oauthParams, sessionTokenOverrides);
  } else {
    // NOTE: this prevents us from ever going into the IMPLICIT flow
    extend(oauthParams, idpOverrides);
  }

  // Quick validation
  if (!oauthParams.clientId) {
    throw new AuthSdkError('The clientId must be specified');
  }

  // Convert our params to their actual OAuth equivalents
  var oauthQueryHash = removeNils({
    'client_id': oauthParams.clientId,
    'redirect_uri': oauthParams.redirectUri,
    'response_type': oauthParams.responseType,
    'response_mode': oauthParams.responseMode,
    'state': oauthParams.state,
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
  var requestUrl = sdk.uri + '/oauth2/v1/authorize' + toQueryParams(oauthQueryHash);

  // Determine the flow type
  var flowType;
  if (oauthParams.sessionToken) {
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
      var jwt = sdk.decodeIdToken(res['id_token']);
      validateClaims(jwt.payload, sdk.uri, oauthParams.clientId);
      return {
        idToken: res['id_token'],
        claims: jwt.payload
      };

    } else {
      throw new AuthSdkError('Unable to parse OAuth flow response');
    }
  }

  function getOrigin(uri) {
    var originRegex = /^(https?\:\/\/)?([^:\/?#]*(?:\:[0-9]+)?)/;
    return originRegex.exec(uri)[0];
  }

  // Execute the flow type
  switch (flowType) {
    case 'IFRAME':
      var iframePromise = addPostMessageListener(sdk, options.timeout);
      var iframeEl = loadFrame(requestUrl, FRAME_ID);
      return iframePromise
        .then(handleOAuthResponse)
        .fin(function() {
          if (document.body.contains(iframeEl)) {
            iframeEl.parentElement.removeChild(iframeEl);
          }
        });

    case 'POPUP':
      var popupPromise;

      // Add listener on postMessage before window creation, so
      // postMessage isn't triggered before we're listening
      if (oauthParams.responseMode === 'okta_post_message') {
        if (!sdk.isPopupPostMessageSupported()) {
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
        var windowOrigin = getOrigin(sdk.getIdToken._getLocationHref());
        var redirectUriOrigin = getOrigin(oauthParams.redirectUri);
        if (windowOrigin !== redirectUriOrigin) {
          return Q.reject(new AuthSdkError('Using fragment, the redirectUri origin (' + redirectUriOrigin +
            ') must match the origin of this page (' + windowOrigin + ')'));
        }
        popupPromise = addFragmentListener(sdk, windowEl, options.timeout);
      }

      // Both postMessage and fragment require a poll to see if the popup closed
      var popupDeferred = Q.defer();
      function hasClosed(win) {
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
};

// This is exposed so we can mock window.location.href in our tests
proto.getIdToken._getLocationHref = function() {
  return window.location.href;
};

/**
 * Check if there is an active session. If there is one, the callback is 
 * invoked with the session and user information. Otherwise, the callback is 
 * invoked with {status: 'INACTIVE'}.
 *
 * @param callback - function to invoke after checking if there is an active session.
 */
proto.checkSession = function(callback) {
  var sdk = this;
  return sdk.get('/api/v1/sessions/me')
    .then(function(session) {

      // Build the response
      var res = {
        status: 'ACTIVE',
        session: omit(session, '_links')
      };

      // Expose refresh() on the session object
      res.session.refresh = function() {
        return sdk.post(getLink(session, 'refresh').href);
      };

      // Get the user information
      return sdk.get(getLink(session, 'user').href)
        .then(function(user) {
          res.user = user;
          callback(res);
        });
    })
    .fail(function() {

      // Call the callback function with INACTIVE status on failure
      callback({status: 'INACTIVE'});
    });
};


  function jqueryRequest(method, uri, args) {
    var deferred = $.Deferred();
    $.ajax({
      type: method,
      url: uri,
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
  OktaAuth.prototype.ajaxRequest = jqueryRequest;

  return OktaAuth;
});
