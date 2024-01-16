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

import { UserOperation } from '../../../types';

export const PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS = 50;

export const OKTA_VERIFY_APP_URL: Record<string, string> = {
  IOS: 'https://apps.apple.com/us/app/okta-verify/id490179405',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.okta.android.auth',
};

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
  SMART_CARD_IDP: 'smart_card_idp',
  DEFAULT: '__',
};

export const IDX_STEP: Record<string, string> = {
  AUTHENTICATOR_ENROLLMENT_DATA: 'authenticator-enrollment-data',
  AUTHENTICATOR_VERIFICATION_DATA: 'authenticator-verification-data',
  CANCEL_TRANSACTION: 'cancel-transaction',
  CHALLENGE_AUTHENTICATOR: 'challenge-authenticator',
  CHALLENGE_POLL: 'challenge-poll',
  CONSENT_ADMIN: 'admin-consent',
  CONSENT_EMAIL_CHALLENGE: 'email-challenge-consent',
  CONSENT_ENDUSER: 'consent',
  CONSENT_GRANULAR: 'granular-consent',
  DEVICE_APPLE_SSO_EXTENSION: 'device-apple-sso-extension',
  DEVICE_CHALLENGE_POLL: 'device-challenge-poll',
  DEVICE_ENROLLMENT_TERMINAL: 'device-enrollment-terminal',
  ENROLLMENT_CHANNEL_DATA: 'enrollment-channel-data',
  ENROLL_AUTHENTICATOR: 'enroll-authenticator',
  ENROLL_POLL: 'enroll-poll',
  ENROLL_PROFILE: 'enroll-profile',
  ENROLL_PROFILE_UPDATE: 'profile-update',
  ENROLL_WEBAUTHN_RESIDENTKEY: 'enroll-webauthn-residentkey',
  FAILURE_REDIRECT: 'failure-redirect',
  IDENTIFY: 'identify',
  IDENTIFY_RECOVERY: 'identify-recovery',
  KEEP_ME_SIGNED_IN: 'keep-me-signed-in',
  LAUNCH_AUTHENTICATOR: 'launch-authenticator',
  LAUNCH_WEBAUTHN_AUTHENTICATOR: 'launch-webauthn-authenticator',
  PIV_IDP: 'piv-idp',
  POLL: 'poll',
  REDIRECT_IDP: 'redirect-idp',
  REENROLL_AUTHENTICATOR: 'reenroll-authenticator',
  REENROLL_AUTHENTICATOR_WARNING: 'reenroll-authenticator-warning',
  REENROLL_CUSTOM_PASSWORD_EXPIRY: 'reenroll-custom-password-expiry',
  REENROLL_CUSTOM_PASSWORD_EXPIRY_WARNING: 'reenroll-custom-password-expiry-warning',
  REQUEST_ACTIVATION: 'request-activation-email',
  RESEND: 'resend',
  RESET_AUTHENTICATOR: 'reset-authenticator',
  SELECT_AUTHENTICATOR_AUTHENTICATE: 'select-authenticator-authenticate',
  SELECT_AUTHENTICATOR_ENROLL: 'select-authenticator-enroll',
  SELECT_AUTHENTICATOR_ENROLL_DATA: 'select-authenticator-enroll-data',
  SELECT_AUTHENTICATOR_UNLOCK: 'select-authenticator-unlock-account',
  SELECT_ENROLLMENT_CHANNEL: 'select-enrollment-channel',
  SELECT_ENROLL_PROFILE: 'select-enroll-profile',
  SELECT_IDENTIFY: 'select-identify',
  SKIP: 'skip',
  SUCCESS_REDIRECT: 'success-redirect',
  TERMINAL: 'terminal',
  UNLOCK_ACCOUNT: 'unlock-account',
  USER_CODE: 'user-code',
};

export const CHALLENGE_METHOD: Record<string, string> = {
  APP_LINK: 'APP_LINK',
  CHROME_DTC: 'CHROME_DTC',
  CUSTOM_URI: 'CUSTOM_URI',
  LOOPBACK: 'LOOPBACK',
  UNIVERSAL_LINK: 'UNIVERSAL_LINK',
};

export const AUTHENTICATOR_ALLOWED_FOR_OPTIONS: Record<string, string> = {
  ANY: 'any',
  SSO: 'sso',
  RECOVERY: 'recovery',
};

export const DEVICE_ENROLLMENT_TYPE: Record<string, string> = {
  ODA: 'oda',
  MDM: 'mdm',
  WS1: 'ws1',
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
  SIGNED_NONCE_ERROR: 'core.auth.factor.signedNonce.error',
  END_USER_REMEDIATION_ERROR_PREFIX: 'idx.error.code.access_denied.device_assurance.remediation',
};

export const CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.custom_app.method.push.verify.enable.biometrics';
export const OV_UV_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.oktaverify.method.totp.verify.enable.biometrics';
export const OV_UV_RESEND_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.app.method.push.verify.enable.biometrics';
export const OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP = 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.desktop';
export const OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE = 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.mobile';
export const OV_NMC_FORCE_UPGRADE_SERVER_KEY = 'oie.authenticator.app.method.push.force.upgrade.number_challenge';
export const ON_PREM_TOKEN_CHANGE_ERROR_KEY = 'errors.E0000113';

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

export const STEPS_REQUIRING_HELP_LINK = [
  IDX_STEP.IDENTIFY,
  IDX_STEP.LAUNCH_AUTHENTICATOR,
];

export const STEPS_REQUIRING_UNLOCK_ACCOUNT_LINK = [
  IDX_STEP.IDENTIFY,
  IDX_STEP.LAUNCH_AUTHENTICATOR,
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
  [AUTHENTICATOR_KEY.IDP]: 'oie.idp.authenticator.description',
  [AUTHENTICATOR_KEY.CUSTOM_OTP]: 'oie.custom_otp.description',
  [AUTHENTICATOR_KEY.SYMANTEC_VIP]: 'oie.symantecVip.authenticator.description',
  [AUTHENTICATOR_KEY.YUBIKEY]: 'oie.yubikey.authenticator.description',
  [AUTHENTICATOR_KEY.CUSTOM_APP]: 'oie.custom.app.authenticator.description',
  [AUTHENTICATOR_KEY.SMART_CARD_IDP]: 'oie.smartcard.authenticator.description',
};

export const CHALLENGE_INTENT_TO_I18KEY: Record<string, string> = {
  AUTHENTICATION: 'idx.return.link.otponly.enter.code.on.sign.in.page',
  RECOVERY: 'idx.return.link.otponly.enter.code.on.password.reset.page',
  UNLOCK_ACCOUNT: 'idx.return.link.otponly.enter.code.on.account.unlock.page',
  ENROLLMENT: 'idx.return.link.otponly.enter.code.on.sign.up.page',
};

export const SOCIAL_IDP_TYPE_TO_I18KEY: Record<string, string> = {
  facebook: 'socialauth.facebook.label',
  google: 'socialauth.google.label',
  linkedin: 'socialauth.linkedin.label',
  microsoft: 'socialauth.microsoft.label',
  apple: 'socialauth.apple.label',
  github: 'socialauth.github.label',
  gitlab: 'socialauth.gitlab.label',
  yahoo: 'socialauth.yahoo.label',
  line: 'socialauth.line.label',
  paypal: 'socialauth.paypal.label',
  paypal_sandbox: 'socialauth.paypal_sandbox.label',
  salesforce: 'socialauth.salesforce.label',
  amazon: 'socialauth.amazon.label',
  yahoojp: 'socialauth.yahoojp.label',
  discord: 'socialauth.discord.label',
  adobe: 'socialauth.adobe.label',
  orcid: 'socialauth.orcid.label',
  spotify: 'socialauth.spotify.label',
  xero: 'socialauth.xero.label',
  quickbooks: 'socialauth.quickbooks.label',
};

// Possible options for the SIW interstitial redirect view
export enum InterstitialRedirectView {
  DEFAULT = 'DEFAULT',
  NONE = 'NONE',
}

export const FORM_NAME_TO_OPERATION_MAP: Record<string, UserOperation> = {
  [IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK]: 'UNLOCK_ACCOUNT',
  [IDX_STEP.IDENTIFY]: 'PRIMARY_AUTH',
  [IDX_STEP.IDENTIFY_RECOVERY]: 'FORGOT_PASSWORD',
};

export const CONSENT_HEADER_STEPS: Array<string> = [
  IDX_STEP.CONSENT_ADMIN,
  IDX_STEP.CONSENT_ENDUSER,
  IDX_STEP.CONSENT_GRANULAR,
];

export type ConsentScopeGroup = 'user' | 'resource' | 'system' | 'hook';
export const SCOPE_GROUP_CONFIG: Record<string, ConsentScopeGroup> = {
  groups: 'user',
  myAccount: 'user',
  users: 'user',
  apps: 'resource',
  authenticators: 'resource',
  authorizationServers: 'resource',
  clients: 'resource',
  domains: 'resource',
  factors: 'resource',
  idps: 'resource',
  linkedObjects: 'resource',
  policies: 'resource',
  templates: 'resource',
  eventHooks: 'hook',
  inlineHooks: 'hook',
  events: 'system',
  logs: 'system',
  orgs: 'system',
  roles: 'system',
  schemas: 'system',
  sessions: 'system',
  trustedOrigins: 'system',
};

export const SUPPORTED_SERVER_GENERATED_SCHEMA_REMEDIATIONS: string[] = [
  IDX_STEP.IDENTIFY,
];
