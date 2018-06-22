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

define(['okta'], function (Okta) {
  var Cookie = Okta.internal.util.Cookie;
  var LAST_USERNAME_COOKIE_NAME = 'ln';
  var DAYS_SAVE_REMEMBER = 365;

  var fn = {};

  fn.getCookieUsername = function () {
    return Cookie.getCookie(LAST_USERNAME_COOKIE_NAME);
  };

  fn.setUsernameCookie = function (username) {
    Cookie.setCookie(LAST_USERNAME_COOKIE_NAME, username, {
      expires: DAYS_SAVE_REMEMBER,
      path: '/'
    });
  };

  fn.removeUsernameCookie = function () {
    Cookie.removeCookie(LAST_USERNAME_COOKIE_NAME, { path: '/' });
  };

  return fn;
});
