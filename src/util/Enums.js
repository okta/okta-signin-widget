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

define({

  DIRECTION_BACK: 'DIRECTION_BACK',

  RECOVERY_TYPE_PASSWORD: 'PASSWORD',
  RECOVERY_TYPE_UNLOCK: 'UNLOCK',
  RECOVERY_FACTOR_TYPE_SMS: 'SMS',
  RECOVERY_FACTOR_TYPE_EMAIL: 'EMAIL',

  // Global success messages
  SUCCESS: 'SUCCESS',
  FORGOT_PASSWORD_EMAIL_SENT: 'FORGOT_PASSWORD_EMAIL_SENT',
  UNLOCK_ACCOUNT_EMAIL_SENT: 'UNLOCK_ACCOUNT_EMAIL_SENT',

  // Global error messages
  CONFIG_ERROR: 'CONFIG_ERROR',
  UNSUPPORTED_BROWSER_ERROR: 'UNSUPPORTED_BROWSER_ERROR',
  OAUTH_ERROR: 'OAUTH_ERROR',

  // Enroll choice page types
  ALL_OPTIONAL_NONE_ENROLLED: 'ALL_OPTIONAL_NONE_ENROLLED',
  ALL_OPTIONAL_SOME_ENROLLED: 'ALL_OPTIONAL_SOME_ENROLLED',
  HAS_REQUIRED_NONE_ENROLLED: 'HAS_REQUIRED_NONE_ENROLLED',
  HAS_REQUIRED_SOME_REQUIRED_ENROLLED: 'HAS_REQUIRED_SOME_REQUIRED_ENROLLED',
  HAS_REQUIRED_ALL_REQUIRED_ENROLLED: 'HAS_REQUIRED_ALL_REQUIRED_ENROLLED',

  // Operations
  PRIMARY_AUTH: 'PRIMARY_AUTH',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  UNLOCK_ACCOUNT: 'UNLOCK_ACCOUNT'

});
