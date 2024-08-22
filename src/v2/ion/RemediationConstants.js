/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import Enums from 'util/Enums';

/**
 * Structure of FORMS object:
 * { [CONSTANT]: remediationForm.name }
 */
const FORMS = {
  IDENTIFY: 'identify',
  SELECT_IDENTIFY: 'select-identify',
  IDENTIFY_RECOVERY: 'identify-recovery',
  SELECT_ENROLL_PROFILE: 'select-enroll-profile',
  ENROLL_PROFILE: 'enroll-profile',
  ENROLL_PROFILE_UPDATE: 'profile-update',
  UNLOCK_ACCOUNT: 'unlock-account',
  REQUEST_ACTIVATION: 'request-activation-email',

  CONSENT_ADMIN: 'admin-consent',
  CONSENT_ENDUSER: 'consent',
  CONSENT_GRANULAR: 'granular-consent',
  CONSENT_EMAIL_CHALLENGE: 'email-challenge-consent',

  SELECT_AUTHENTICATOR_AUTHENTICATE: 'select-authenticator-authenticate',
  SELECT_AUTHENTICATOR_UNLOCK: 'select-authenticator-unlock-account',

  AUTHENTICATOR_VERIFICATION_DATA: 'authenticator-verification-data',
  CHALLENGE_AUTHENTICATOR: 'challenge-authenticator',
  CHALLENGE_POLL: 'challenge-poll',
  RESEND: 'resend',

  SELECT_AUTHENTICATOR_ENROLL: 'select-authenticator-enroll',
  SELECT_AUTHENTICATOR_ENROLL_DATA: 'select-authenticator-enroll-data',
  AUTHENTICATOR_ENROLLMENT_DATA: 'authenticator-enrollment-data',
  ENROLL_AUTHENTICATOR: 'enroll-authenticator',
  SELECT_ENROLLMENT_CHANNEL: 'select-enrollment-channel',
  ENROLLMENT_CHANNEL_DATA: 'enrollment-channel-data',
  ENROLL_POLL: 'enroll-poll',
  REENROLL_AUTHENTICATOR: 'reenroll-authenticator',
  REENROLL_AUTHENTICATOR_WARNING: 'reenroll-authenticator-warning',
  REENROLL_CUSTOM_PASSWORD_EXPIRY: 'reenroll-custom-password-expiry',
  REENROLL_CUSTOM_PASSWORD_EXPIRY_WARNING: 'reenroll-custom-password-expiry-warning',
  RESET_AUTHENTICATOR: 'reset-authenticator',
  SKIP: 'skip',
  POLL: 'poll',

  FAILURE_REDIRECT: 'failure-redirect',
  SUCCESS_REDIRECT: 'success-redirect',
  REDIRECT_IDP: 'redirect-idp',
  REDIRECT_IDVERIFY: 'redirect-idverify',
  PIV_IDP: 'piv-idp',

  DEVICE_CHALLENGE_POLL: 'device-challenge-poll',
  DEVICE_APPLE_SSO_EXTENSION: 'device-apple-sso-extension',
  CANCEL_TRANSACTION: 'cancel-transaction',
  LAUNCH_AUTHENTICATOR: 'launch-authenticator',
  LAUNCH_WEBAUTHN_AUTHENTICATOR: 'launch-webauthn-authenticator',
  ENROLL_WEBAUTHN_RESIDENTKEY: 'enroll-webauthn-residentkey',

  DEVICE_ENROLLMENT_TERMINAL: 'device-enrollment-terminal',

  USER_CODE: 'user-code',

  KEEP_ME_SIGNED_IN: 'keep-me-signed-in',

  DEVICE_ASSURANCE_GRACE_PERIOD: 'device-assurance-grace-period',

  // 'terminal` is not ION Form name but only coined in widget
  // for rendering a page that user has nothing to remediate.
  TERMINAL: 'terminal',
};
// Forms added here do not show the Sign out link
const FORMS_WITHOUT_SIGNOUT = [
  FORMS.IDENTIFY,
  FORMS.SUCCESS_REDIRECT,
  FORMS.ENROLL_PROFILE,
  FORMS.DEVICE_ENROLLMENT_TERMINAL,
  FORMS.CONSENT_ADMIN,
  FORMS.CONSENT_ENDUSER,
  FORMS.CONSENT_GRANULAR,
  FORMS.CONSENT_EMAIL_CHALLENGE,
  FORMS.USER_CODE,
  FORMS.KEEP_ME_SIGNED_IN
];

const FORMS_WITH_STATIC_BACK_LINK = [
  FORMS.SELECT_AUTHENTICATOR_ENROLL,
  FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE
];

const FORMS_FOR_VERIFICATION = [
  FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE,
  FORMS.CHALLENGE_AUTHENTICATOR,
  FORMS.CHALLENGE_POLL,
  FORMS.RESEND
];

const AUTHENTICATOR_KEY = {
  EMAIL: 'okta_email',
  PASSWORD: 'okta_password',
  PHONE: 'phone_number',
  WEBAUTHN: 'webauthn',
  SECURITY_QUESTION: 'security_question',
  OV: 'okta_verify',
  GOOGLE_OTP: 'google_otp',
  ON_PREM: 'onprem_mfa',
  RSA: 'rsa_token',
  DUO: 'duo',
  IDP: 'external_idp',
  CUSTOM_OTP: 'custom_otp',
  SYMANTEC_VIP: 'symantec_vip',
  YUBIKEY: 'yubikey_token',
  CUSTOM_APP: 'custom_app',
  SMARTCARD: 'smart_card_idp'
};

const AUTHENTICATOR_METHODS = {
  PUSH: 'push',
};

const FORM_NAME_TO_OPERATION_MAP = {
  [FORMS.SELECT_AUTHENTICATOR_UNLOCK]: Enums.UNLOCK_ACCOUNT,
  [FORMS.IDENTIFY]: Enums.PRIMARY_AUTH,
  [FORMS.IDENTIFY_RECOVERY]: Enums.FORGOT_PASSWORD,
};

const ENROLLED_PASSWORD_RECOVERY_LINK = 'currentAuthenticatorEnrollment-recover';
const ORG_PASSWORD_RECOVERY_LINK = 'currentAuthenticator-recover';
const ACTIONS = {
  ENROLLED_PASSWORD_RECOVERY_LINK,
  ORG_PASSWORD_RECOVERY_LINK
};

// Possible Remediation Form Field Hints
const HINTS = {
  CAPTCHA: 'captcha',
};

const TERMINAL_FORMS = [
  FORMS.TERMINAL,
  FORMS.DEVICE_ENROLLMENT_TERMINAL,
];
const IDP_FORM_TYPE = {
  X509: 'X509',
};

// Possible options for the SIW interstitial redirect view
const INTERSTITIAL_REDIRECT_VIEW = {
  DEFAULT: 'DEFAULT',
  NONE: 'NONE'
};

const ATTR_FORMAT = {
  COUNTRY_CODE: 'country-code',
};

const ID_PROOFING_TYPE = {
  IDV_PERSONA: 'IDV_PERSONA'
};

export {
  ACTIONS,
  ORG_PASSWORD_RECOVERY_LINK,
  FORMS,
  FORMS_WITHOUT_SIGNOUT,
  FORMS_WITH_STATIC_BACK_LINK,
  FORMS_FOR_VERIFICATION,
  AUTHENTICATOR_KEY,
  AUTHENTICATOR_METHODS,
  FORM_NAME_TO_OPERATION_MAP,
  HINTS,
  TERMINAL_FORMS,
  IDP_FORM_TYPE,
  INTERSTITIAL_REDIRECT_VIEW,
  ATTR_FORMAT,
  ID_PROOFING_TYPE,
};
