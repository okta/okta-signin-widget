/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

export const PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS = 50;

export const AUTHENTICATOR_KEY: Record<string, string> = {
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
  SMS: 'sms',
  DEFAULT: '__',
};

export const IDX_STEP: Record<string, string> = {
  AUTHENTICATOR_ENROLLMENT_DATA: 'authenticator-enrollment-data',
  AUTHENTICATOR_VERIFICATION_DATA: 'authenticator-verification-data',
  CANCEL_TRANSACTION: 'cancel-transaction',
  CHALLENGE_AUTHENTICATOR: 'challenge-authenticator',
  CHALLENGE_POLL: 'challenge-poll',
  CONSENT_ADMIN: 'admin-consent',
  EMAIL_CHALLENGE_CONSENT: 'email-challenge-consent',
  CONSENT_ENDUSER: 'consent',
  DEVICE_APPLE_SSO_EXTENSION: 'device-apple-sso-extension',
  DEVICE_CHALLENGE_POLL: 'device-challenge-poll',
  DEVICE_ENROLLMENT_TERMINAL: 'device-enrollment-terminal',
  ENROLL_AUTHENTICATOR: 'enroll-authenticator',
  ENROLL_POLL: 'enroll-poll',
  ENROLL_PROFILE_UPDATE: 'profile-update',
  ENROLL_PROFILE: 'enroll-profile',
  ENROLLMENT_CHANNEL_DATA: 'enrollment-channel-data',
  FAILURE_REDIRECT: 'failure-redirect',
  IDENTIFY_RECOVERY: 'identify-recovery',
  IDENTIFY: 'identify',
  LAUNCH_AUTHENTICATOR: 'launch-authenticator',
  PIV_IDP: 'piv-idp',
  POLL: 'poll',
  REDIRECT_IDP: 'redirect-idp',
  REENROLL_AUTHENTICATOR_WARNING: 'reenroll-authenticator-warning',
  REENROLL_AUTHENTICATOR: 'reenroll-authenticator',
  REQUEST_ACTIVATION: 'request-activation-email',
  RESEND: 'resend',
  RESET_AUTHENTICATOR: 'reset-authenticator',
  SELECT_AUTHENTICATOR_AUTHENTICATE: 'select-authenticator-authenticate',
  SELECT_AUTHENTICATOR_ENROLL_DATA: 'select-authenticator-enroll-data',
  SELECT_AUTHENTICATOR_ENROLL: 'select-authenticator-enroll',
  SELECT_AUTHENTICATOR_UNLOCK: 'select-authenticator-unlock-account',
  SELECT_ENROLL_PROFILE: 'select-enroll-profile',
  SELECT_ENROLLMENT_CHANNEL: 'select-enrollment-channel',
  SELECT_IDENTIFY: 'select-identify',
  SKIP: 'skip',
  SUCCESS_REDIRECT: 'success-redirect',
  UNLOCK_ACCOUNT: 'unlock-account',
  USER_CODE: 'user-code',
};

export const TERMINAL_KEY: Record<string, string> = {
  DEVICE_ACTIVATED: 'idx.device.activated',
  DEVICE_NOT_ACTIVATED_CONSENT_DENIED: 'idx.device.not.activated.consent.denied',
  DEVICE_NOT_ACTIVATED_INTERNAL_ERROR: 'idx.device.not.activated.internal.error',
  EMAIL_ACTIVATION_EMAIL_EXPIRE: 'idx.expired.activation.token',
  EMAIL_ACTIVATION_EMAIL_INVALID: 'idx.missing.activation.token',
  EMAIL_ACTIVATION_EMAIL_SUBMITTED: 'idx.request.activation.email',
  EMAIL_ACTIVATION_EMAIL_SUSPENDED: 'idx.activating.inactive.user',
  EMAIL_LINK_CANT_BE_PROCESSED: 'idx.return.error',
  EMAIL_LINK_OUT_OF_DATE: 'idx.return.stale',
  EMAIL_VERIFICATION_REQUIRED: 'idx.email.verification.required',
  FLOW_CONTINUE_IN_NEW_TAB: 'idx.transferred.to.new.tab',
  FORGOT_PASSWORD_NOT_ENABLED: 'oie.forgot.password.is.not.enabled',
  IDX_RETURN_LINK_OTP_ONLY: 'idx.enter.otp.in.original.tab',
  OPERATION_CANCELED_BY_USER_KEY: 'idx.operation.cancelled.by.user',
  OPERATION_CANCELED_ON_OTHER_DEVICE_KEY: 'idx.operation.cancelled.on.other.device',
  REGISTRATION_NOT_ENABLED: 'oie.registration.is.not.enabled',
  RESET_PASSWORD_NOT_ALLOWED_KEY: 'oie.selfservice.reset.password.not.allowed',
  RETURN_LINK_EXPIRED_KEY: 'idx.return.link.expired',
  RETURN_TO_ORIGINAL_TAB_KEY: 'idx.return.to.original.tab',
  SAFE_MODE_KEY_PREFIX: 'idx.error.server.safe.mode',
  SESSION_EXPIRED: 'idx.session.expired',
  TOO_MANY_REQUESTS: 'tooManyRequests',
  UNLOCK_ACCOUNT_FAILED_PERMISSIONS_KEY: 'oie.selfservice.unlock_user.challenge.failed.permissions',
  UNLOCK_ACCOUNT_KEY: 'oie.selfservice.unlock_user.success.message',
};

export const OV_UV_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.oktaverify.method.totp.verify.enable.biometrics';

export const EMAIL_AUTHENTICATOR_TERMINAL_KEYS = [
  TERMINAL_KEY.EMAIL_LINK_CANT_BE_PROCESSED,
  TERMINAL_KEY.EMAIL_LINK_OUT_OF_DATE,
  TERMINAL_KEY.EMAIL_VERIFICATION_REQUIRED,
  TERMINAL_KEY.FLOW_CONTINUE_IN_NEW_TAB,
  TERMINAL_KEY.IDX_RETURN_LINK_OTP_ONLY,
  TERMINAL_KEY.OPERATION_CANCELED_BY_USER_KEY,
  TERMINAL_KEY.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY,
  TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY,
  TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY,
];

export const DEVICE_CODE_ERROR_KEYS = [
  TERMINAL_KEY.DEVICE_NOT_ACTIVATED_CONSENT_DENIED,
  TERMINAL_KEY.DEVICE_NOT_ACTIVATED_INTERNAL_ERROR,
];

export const TERMINAL_KEYS_WITHOUT_CANCEL = [
  TERMINAL_KEY.DEVICE_ACTIVATED,
  ...DEVICE_CODE_ERROR_KEYS,
  TERMINAL_KEY.FLOW_CONTINUE_IN_NEW_TAB,
  TERMINAL_KEY.IDX_RETURN_LINK_OTP_ONLY,
  TERMINAL_KEY.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY,
  TERMINAL_KEY.RESET_PASSWORD_NOT_ALLOWED_KEY,
  TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY,
  TERMINAL_KEY.UNLOCK_ACCOUNT_FAILED_PERMISSIONS_KEY,
  TERMINAL_KEY.UNLOCK_ACCOUNT_KEY,
];

export const TERMINAL_TITLE_KEY: Record<string, string> = {
  [TERMINAL_KEY.DEVICE_ACTIVATED]: 'device.code.activated.success.title',
  [TERMINAL_KEY.DEVICE_NOT_ACTIVATED_CONSENT_DENIED]: 'device.code.activated.error.title',
  [TERMINAL_KEY.DEVICE_NOT_ACTIVATED_INTERNAL_ERROR]: 'device.code.activated.error.title',
  [TERMINAL_KEY.EMAIL_ACTIVATION_EMAIL_EXPIRE]: 'oie.activation.request.email.title.expire',
  [TERMINAL_KEY.EMAIL_ACTIVATION_EMAIL_INVALID]: 'oie.activation.request.email.title.invalid',
  [TERMINAL_KEY.EMAIL_ACTIVATION_EMAIL_SUBMITTED]: 'oie.activation.request.email.title.submitted',
  [TERMINAL_KEY.EMAIL_ACTIVATION_EMAIL_SUSPENDED]: 'oie.activation.request.email.title.suspended',
  [TERMINAL_KEY.FORGOT_PASSWORD_NOT_ENABLED]: 'password.reset.title.generic',
  [TERMINAL_KEY.IDX_RETURN_LINK_OTP_ONLY]: 'idx.return.link.otponly.your.verification.code',
  [TERMINAL_KEY.REGISTRATION_NOT_ENABLED]: 'oie.registration.form.title',
  [TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY]: 'oie.email.return.link.expired.title',
  [TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY]: 'oie.consent.enduser.email.allow.title',
  [TERMINAL_KEY.UNLOCK_ACCOUNT_KEY]: 'account.unlock.unlocked.title',
};

export const STEPS_REQUIRING_CUSTOM_LINK = [
  IDX_STEP.CHALLENGE_AUTHENTICATOR,
  IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
  IDX_STEP.CHALLENGE_POLL,
  IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA,
];

export const AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP: Record<string, string> = {
  [AUTHENTICATOR_KEY.EMAIL]: 'oie.email.authenticator.description',
  [AUTHENTICATOR_KEY.PASSWORD]: 'oie.password.authenticator.description',
  [AUTHENTICATOR_KEY.PHONE]: 'oie.phone.authenticator.description',
  [AUTHENTICATOR_KEY.SECURITY_QUESTION]: 'oie.security.question.authenticator.description',
  [AUTHENTICATOR_KEY.WEBAUTHN]: 'oie.webauthn.description',
  [AUTHENTICATOR_KEY.OV]: 'oie.okta_verify.authenticator.description',
  [AUTHENTICATOR_KEY.GOOGLE_OTP]: 'oie.google_authenticator.authenticator.description',
  [AUTHENTICATOR_KEY.ON_PREM]: 'oie.on_prem.authenticator.description',
  [AUTHENTICATOR_KEY.RSA]: 'oie.rsa.authenticator.description',
  [AUTHENTICATOR_KEY.DUO]: 'oie.duo.authenticator.description',
  [AUTHENTICATOR_KEY.IDP]: 'oie.custom_otp.description',
  [AUTHENTICATOR_KEY.CUSTOM_OTP]: 'oie.custom_otp.description',
  [AUTHENTICATOR_KEY.SYMANTEC_VIP]: 'oie.symantecVip.authenticator.description',
  [AUTHENTICATOR_KEY.YUBIKEY]: 'oie.yubikey.authenticator.description',
  [AUTHENTICATOR_KEY.CUSTOM_APP]: 'oie.custom.app.authenticator.description',
};

// TODO: OKTA-503490 temporary sln to fix issue with missing relatesTo obj
export const STEPS_MISSING_RELATES_TO: string[] = [
  IDX_STEP.ENROLL_POLL,
  IDX_STEP.ENROLLMENT_CHANNEL_DATA,
];

export const CHALLENGE_INTENT_TO_I18KEY: Record<string, string> = {
  AUTHENTICATION: 'idx.return.link.otponly.enter.code.on.page.sign.in',
  RECOVERY: 'idx.return.link.otponly.enter.code.on.page.password.reset',
  UNLOCK_ACCOUNT: 'idx.return.link.otponly.enter.code.on.page.account.unlock',
  ENROLLMENT: 'idx.return.link.otponly.enter.code.on.page.registration',
};

// Possible options for the SIW interstitial redirect view
export enum InterstitialRedirectView {
  DEFAULT = 'DEFAULT',
  NONE = 'NONE',
}
