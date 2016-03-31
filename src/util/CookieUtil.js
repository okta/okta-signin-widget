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

define(['okta', 'vendor/plugins/jquery.cookie'], function (Okta) {

  var $ = Okta.$;
  var LAST_USERNAME_COOKIE_NAME = 'ln';
  var REMEMBER_DEVICE_COOKIE_NAME = 'rdln';
  var DAYS_SAVE_REMEMBER = 365;

  function removeCookie (name) {
    $.removeCookie(name, { path: '/' });
  }

  function setCookie (name, value) {
    $.cookie(name, value, {
      expires: DAYS_SAVE_REMEMBER,
      path: '/'
    });
  }

  var fn = {};

  fn.getCookieUsername = function () {
    return $.cookie(LAST_USERNAME_COOKIE_NAME);
  };

  fn.setUsernameCookie = function (username) {
    setCookie(LAST_USERNAME_COOKIE_NAME, username);
  };

  fn.removeUsernameCookie = function () {
    removeCookie(LAST_USERNAME_COOKIE_NAME);
  };

  fn.getCookieDeviceUsername = function () {
    return $.cookie(REMEMBER_DEVICE_COOKIE_NAME);
  };

  fn.setDeviceCookie = function (username) {
    setCookie(REMEMBER_DEVICE_COOKIE_NAME, username);
  };

  fn.removeDeviceCookie = function () {
    removeCookie(REMEMBER_DEVICE_COOKIE_NAME);
  };

  return fn;
});
