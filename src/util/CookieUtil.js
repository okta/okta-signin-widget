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

import { internal } from 'okta';
const Cookie = internal.util.Cookie;
const LAST_USERNAME_COOKIE_NAME = 'ln';
const DAYS_SAVE_REMEMBER = 365;
const fn = {};
const ONEPASS_ENROLLMENT_HINT = 'ONEPASS_ENROLLMENT_HINT';
const ONEPASS_WEBAUTHN_AAGUID = 'ONEPASS_WEBAUTHN_AAGUID';
const ONEPASS_AUTHENTICATOR_TYPE = 'ONEPASS_AUTHENTICATOR_TYPE';

fn.getCookieUsername = function() {
  return Cookie.getCookie(LAST_USERNAME_COOKIE_NAME);
};

fn.setUsernameCookie = function(username) {
  Cookie.setCookie(LAST_USERNAME_COOKIE_NAME, username, {
    expires: DAYS_SAVE_REMEMBER,
    path: '/',
  });
};

fn.removeUsernameCookie = function() {
  Cookie.removeCookie(LAST_USERNAME_COOKIE_NAME, { path: '/' });
};

fn.getOnePassEnrollmentHint = function() {
  return Cookie.getCookie(ONEPASS_ENROLLMENT_HINT);
};

fn.setOnePassEnrollmentHint = function(hint) {
  Cookie.setCookie(ONEPASS_ENROLLMENT_HINT, hint, {
    expires: DAYS_SAVE_REMEMBER,
    path: '/',
  });
};

fn.removeOnePassEnrollmentHint = function() {
  Cookie.removeCookie(ONEPASS_ENROLLMENT_HINT, { path: '/' });
};

fn.setOnePassWebAuthnAAGUID = function(aaguid) {
  Cookie.setCookie(ONEPASS_WEBAUTHN_AAGUID, aaguid, {
    expires: DAYS_SAVE_REMEMBER,
    path: '/',
  });
};

fn.getOnePassWebAuthnAAGUID = function() {
  return Cookie.getCookie(ONEPASS_WEBAUTHN_AAGUID);
};

fn.removeOnePassWebAuthnAAGUID = function() {
  Cookie.removeCookie(ONEPASS_WEBAUTHN_AAGUID, { path: '/' });
};

fn.setOnePassAuthenticatorType = function(aaguid) {
  Cookie.setCookie(ONEPASS_AUTHENTICATOR_TYPE, aaguid, {
    expires: DAYS_SAVE_REMEMBER,
    path: '/',
  });
};

fn.getOnePassAuthenticatorType = function() {
  return Cookie.getCookie(ONEPASS_AUTHENTICATOR_TYPE);
};

fn.removeOnePassAuthenticatorType = function() {
  Cookie.removeCookie(ONEPASS_AUTHENTICATOR_TYPE, { path: '/' });
};

export default fn;
