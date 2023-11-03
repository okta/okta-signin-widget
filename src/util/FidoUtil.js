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

/* eslint complexity:[2, 9] */

import { loc } from './loc';
const fn = {};

fn.getU2fEnrollErrorMessageKeyByCode = function(errorCode) {
  switch (errorCode) {
  default:
  case 1:
    return 'u2f.error.other';
  case 2:
  case 3:
    return 'u2f.error.badRequest';
  case 4:
    return 'u2f.error.unsupported';
  case 5:
    return 'u2f.error.timeout';
  }
};

fn.getU2fVerifyErrorMessageKeyByCode = function(errorCode, isOneFactor) {
  switch (errorCode) {
  case 1:
    // OTHER_ERROR
    return isOneFactor ? 'u2f.error.other.oneFactor' : 'u2f.error.other';
  case 2: // BAD_REQUEST
  case 3:
    // CONFIGURATION_UNSUPPORTED
    return isOneFactor ? 'u2f.error.badRequest.oneFactor' : 'u2f.error.badRequest';
  case 4:
    // DEVICE_INELIGIBLE
    return isOneFactor ? 'u2f.error.unsupported.oneFactor' : 'u2f.error.unsupported';
  case 5:
    // TIMEOUT
    return 'u2f.error.timeout';
  }
};

fn.getU2fEnrollErrorMessageByCode = function(errorCode) {
  return loc(fn.getU2fEnrollErrorMessageKeyByCode(errorCode), 'login');
};

fn.getU2fVerifyErrorMessageByCode = function(errorCode, isOneFactor) {
  return loc(fn.getU2fVerifyErrorMessageKeyByCode(errorCode, isOneFactor), 'login');
};

fn.getU2fVersion = function() {
  return 'U2F_V2';
};

fn.isU2fAvailable = function() {
  return Object.prototype.hasOwnProperty.call(window, 'u2f');
};

export default fn;
