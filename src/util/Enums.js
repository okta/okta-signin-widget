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

export default {
  API_RATE_LIMIT: 30000, //milliseconds

  WIDGET_LOGIN_CONTAINER_ID: 'okta-login-container',
  WIDGET_CONTAINER_ID: 'okta-sign-in',
  WIDGET_CONFIG_COLORS_ID: 'okta-sign-in-config-colors',

  DIRECTION_BACK: 'DIRECTION_BACK',

  RECOVERY_TYPE_PASSWORD: 'PASSWORD',
  RECOVERY_TYPE_UNLOCK: 'UNLOCK',
  RECOVERY_FACTOR_TYPE_SMS: 'SMS',
  RECOVERY_FACTOR_TYPE_EMAIL: 'EMAIL',
  RECOVERY_FACTOR_TYPE_CALL: 'CALL',

  IOS: 'ios',
  ANDROID: 'android',

  ODA: 'oda',
  MDM: 'mdm',
  WS1: 'ws1',

  // Global success messages
  SUCCESS: 'SUCCESS',
  FORGOT_PASSWORD_EMAIL_SENT: 'FORGOT_PASSWORD_EMAIL_SENT',
  UNLOCK_ACCOUNT_EMAIL_SENT: 'UNLOCK_ACCOUNT_EMAIL_SENT',

  // Global error messages
  CONFIG_ERROR: 'CONFIG_ERROR',
  UNSUPPORTED_BROWSER_ERROR: 'UNSUPPORTED_BROWSER_ERROR',
  OAUTH_ERROR: 'OAUTH_ERROR',
  AUTH_STOP_POLL_INITIATION_ERROR: 'AUTH_STOP_POLL_INITIATION_ERROR',
  U2F_ERROR: 'U2F_ERROR',
  WEB_AUTHN_ERROR: 'WEB_AUTHN_ERROR',
  WEBAUTHN_ABORT_ERROR: 'WEBAUTHN_ABORT_ERROR',
  CONFIGURED_FLOW_ERROR: 'CONFIGURED_FLOW_ERROR',

  // Enroll choice page types
  ALL_OPTIONAL_NONE_ENROLLED: 'ALL_OPTIONAL_NONE_ENROLLED',
  ALL_OPTIONAL_SOME_ENROLLED: 'ALL_OPTIONAL_SOME_ENROLLED',
  HAS_REQUIRED_NONE_ENROLLED: 'HAS_REQUIRED_NONE_ENROLLED',
  HAS_REQUIRED_SOME_REQUIRED_ENROLLED: 'HAS_REQUIRED_SOME_REQUIRED_ENROLLED',
  HAS_REQUIRED_ALL_REQUIRED_ENROLLED: 'HAS_REQUIRED_ALL_REQUIRED_ENROLLED',

  // Operations
  PRIMARY_AUTH: 'PRIMARY_AUTH',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  UNLOCK_ACCOUNT: 'UNLOCK_ACCOUNT',

  // Auth Types
  SESSION_SSO: 'SESSION_SSO',
  SESSION_STEP_UP: 'SESSION_STEP_UP',

  //Registration
  ACTIVATION_EMAIL_SENT: 'ACTIVATION_EMAIL_SENT',
  REGISTRATION_COMPLETE: 'REGISTRATION_COMPLETE',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',

  //IDP Discovery
  IDP_DISCOVERY: 'IDP_DISCOVERY',

  //App Store Links
  OKTA_VERIFY_APPLE_APP_STORE_URL: 'https://apps.apple.com/us/app/okta-verify/id490179405',
  OKTA_VERIFY_GOOGLE_PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.okta.android.auth',

  // Device Challenge Method
  LOOPBACK_CHALLENGE: 'LOOPBACK',
  CUSTOM_URI_CHALLENGE: 'CUSTOM_URI',
  UNIVERSAL_LINK_CHALLENGE: 'UNIVERSAL_LINK',
  APP_LINK_CHALLENGE: 'APP_LINK',
  CHROME_DTC: 'CHROME_DTC',

};
