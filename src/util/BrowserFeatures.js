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

define(['underscore'], function (_) {

  // Save a reference to the original XHR object, before it's overwritten by
  // xdomain. Note: This file must be loaded before xdomain.
  var XHR = window.XMLHttpRequest,
      fn = {},
      hasFullCorsSupport = 'withCredentials' in new XHR(),
      hasXDomainRequest = typeof XDomainRequest !== 'undefined';

  // IE8 and IE9
  fn.corsIsLimited = function () {
    // IE10 has XDomainRequest, but it is removed in IE11
    return hasXDomainRequest && !hasFullCorsSupport;
  };

  fn.corsIsNotSupported = function () {
    return !(hasFullCorsSupport || hasXDomainRequest);
  };

  fn.corsIsNotEnabled = function (jqXhr) {
    // Not a definitive check, but it's the best we've got.
    // Note: This will change when OktaAuth is updated
    return jqXhr.status === 0;
  };

  // This is currently not being used, but we'll keep it around for when we
  // want a fallback mechanism - i.e. use localStorage if it exists, else fall
  // back to cookies.
  fn.localStorageIsNotSupported = function () {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return false;
    } catch(e) {
        return true;
    }
  };

  fn.supportsPushState = function (win) {
    win = win || window;
    return !!(win.history && win.history.pushState);
  };

  fn.isIE = function () {
    return /(msie|trident)/i.test(navigator.userAgent);
  };

  // Returns a list of languages the user has configured for their browser, in
  // order of preference.
  fn.getUserLanguages = function () {
    var languages, properties;

    // Chrome, Firefox
    if (navigator.languages) {
      return navigator.languages;
    }

    languages = [];
    properties = [
      'language',         // Safari, IE11
      'userLanguage',     // IE
      'browserLanguage',  // IE
      'systemLanguage'    // IE
    ];

    _.each(properties, function (property) {
      if (navigator[property]) {
        languages.push(navigator[property]);
      }
    });

    return languages;
  };

  return fn;

});
