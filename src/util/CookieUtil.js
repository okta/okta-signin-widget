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

define(['okta', 'util/CryptoUtil', 'js-cookie'], function (Okta, CryptoUtil, Cookies) {

  var LAST_USERNAME_COOKIE_NAME = 'ln';
  var DAYS_SAVE_REMEMBER = 365;

  function removeCookie (name) {
    Cookies.remove(name, { path: '/' });
  }

  function setCookie (name, value) {
    Cookies.set(name, value, {
      expires: DAYS_SAVE_REMEMBER,
      path: '/'
    });
  }

  var fn = {};

  fn.getCookieUsername = function () {
    return Cookies.get(LAST_USERNAME_COOKIE_NAME);
  };

  fn.setUsernameCookie = function (username) {
    setCookie(LAST_USERNAME_COOKIE_NAME, username);
  };

  fn.removeUsernameCookie = function () {
    removeCookie(LAST_USERNAME_COOKIE_NAME);
  };

  fn.isAutoPushEnabled = function (userId) {
    if (userId === undefined) {
      return false;
    }
    return Cookies.get(getAutoPushKey(userId)) === 'true';
  };

  fn.setAutoPushCookie = function (userId) {
    if (userId === undefined) {
      return;
    }
    setCookie(getAutoPushKey(userId), true);
  };

  fn.removeAutoPushCookie = function (userId) {
    if (userId === undefined) {
      return;
    }
    removeCookie(getAutoPushKey(userId));
  };

  return fn;
});
