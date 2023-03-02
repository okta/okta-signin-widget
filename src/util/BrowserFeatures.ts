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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const fn: Record<string, (...any: any[]) => any> = {};
const hasFullCorsSupport = 'withCredentials' in new window.XMLHttpRequest();
const hasXDomainRequest = typeof window.XDomainRequest !== 'undefined';

fn.corsIsNotSupported = function() {
  return !(hasFullCorsSupport || hasXDomainRequest);
};

fn.corsIsNotEnabled = function(jqXhr) {
  // Not a definitive check, but it's the best we've got.
  // Note: This will change when OktaAuth is updated
  return jqXhr.status === 0;
};

// This is currently not being used, but we'll keep it around for when we
// want a fallback mechanism - i.e. use localStorage if it exists, else fall
// back to cookies.
fn.localStorageIsNotSupported = function() {
  const test = 'test';

  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch (e) {
    return true;
  }
};

fn.supportsPushState = function(win) {
  win = win || window;
  return !!(win.history && win.history.pushState);
};

fn.isIE = function() {
  return /(msie|trident)/i.test(navigator.userAgent);
};

fn.isFirefox = function() {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

fn.isEdge = function() {
  // This is to just check for windows edge. Mac edge - chromium based's UA is 'edg'.
  return navigator.userAgent.toLowerCase().indexOf('edge') > -1;
};

fn.isSafari = function() {
  // Chrome has safari in its useragent string so adding this extra check.
  return (
    navigator.userAgent.toLowerCase().indexOf('safari') > -1 &&
    navigator.userAgent.toLowerCase().indexOf('chrome') === -1
  );
};

fn.isMac = function() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};


fn.isAndroid = function() {
  // Windows Phone also contains "Android"
  return /android/i.test(navigator.userAgent) &&
    !/windows phone/i.test(navigator.userAgent);
};

fn.isIOS = function() {
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Returns a list of languages the user has configured for their browser, in
// order of preference.
fn.getUserLanguages = function() {
  // Chrome, Firefox
  if (navigator.languages) {
    return [...navigator.languages];
  }

  const languages = [];
  const properties = [
    'language',         // Safari, IE11
    'userLanguage',     // IE
    'browserLanguage',  // IE
    'systemLanguage'    // IE
  ];

  properties.forEach(function(property) {
    if (navigator[property]) {
      languages.push(navigator[property]);
    }
  });

  return languages;
};


export default fn;
