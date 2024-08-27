/* eslint-disable max-len */
/* eslint max-statements: [2, 25], complexity: [2, 15] */

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

import Bundles from 'util/Bundles';
import Logger from 'util/Logger';
import { loc } from '../../util/loc';
import { getAuthenticatorDisplayName } from '../view-builder/utils/AuthenticatorUtil';
import { FORMS, AUTHENTICATOR_KEY } from './RemediationConstants';
import { I18N_BASE_ATTRIBUTE_ENROLL_PROFILE_MAPPINGS } from '../view-builder/views/enroll-profile/i18nBaseAttributeMappings';

const WEBAUTHN_API_GENERIC_ERROR_KEY = 'authfactor.webauthn.error';

const SECURITY_QUESTION_PREFIXES = [
  'enroll-authenticator.security_question.credentials.questionKey.',
  'challenge-authenticator.security_question.credentials.questionKey.',
];

const I18N_OVERRIDE_MAPPINGS = {
  'identify.identifier': 'primaryauth.username.placeholder',
  'select-authenticator-unlock-account.identifier': 'primaryauth.username.placeholder',
  'unlock-account.identifier': 'primaryauth.username.placeholder',
  'identify.credentials.passcode': 'primaryauth.password.placeholder',
  'identify.rememberMe': 'oie.remember',
  'enroll-profile.userProfile.rememberMe': 'oie.remember',
  
  'identify-recovery.identifier': 'password.forgot.email.or.username.placeholder',

  'select-authenticator-enroll.authenticator.duo': 'factor.duo',
  'select-authenticator-enroll.authenticator.google_otp': 'oie.google_authenticator.label',
  'select-authenticator-enroll.authenticator.okta_email': 'oie.email.label',
  'select-authenticator-enroll.authenticator.okta_password': 'oie.password.label',
  'select-authenticator-enroll.authenticator.okta_verify': 'oie.okta_verify.label',
  'select-authenticator-enroll.authenticator.phone_number': 'oie.phone.label',
  'select-authenticator-enroll.authenticator.rsa_token': 'factor.totpHard.rsaSecurId',
  'select-authenticator-enroll.authenticator.security_question': 'oie.security.question.label',
  'select-authenticator-enroll.authenticator.symantec_vip': 'factor.totpHard.symantecVip',
  'select-authenticator-enroll.authenticator.webauthn': 'oie.webauthn.label',
  'select-authenticator-enroll.authenticator.yubikey_token': 'oie.yubikey.label',

  'select-authenticator-authenticate.authenticator.duo': 'factor.duo',
  'select-authenticator-authenticate.authenticator.google_otp': 'oie.google_authenticator.label',
  'select-authenticator-authenticate.authenticator.okta_email': 'oie.email.label',
  'select-authenticator-authenticate.authenticator.okta_password': 'oie.password.label',
  'select-authenticator-authenticate.authenticator.okta_verify.push': 'oie.okta_verify.push.title',
  'select-authenticator-authenticate.authenticator.okta_verify.signed_nonce': 'oie.okta_verify.signed_nonce.label',
  'select-authenticator-authenticate.authenticator.okta_verify.totp': 'oie.okta_verify.totp.title',
  'select-authenticator-authenticate.authenticator.phone_number': 'oie.phone.label',
  'select-authenticator-authenticate.authenticator.rsa_token': 'factor.totpHard.rsaSecurId',
  'select-authenticator-authenticate.authenticator.security_question': 'oie.security.question.label',
  'select-authenticator-authenticate.authenticator.symantec_vip': 'factor.totpHard.symantecVip',
  'select-authenticator-authenticate.authenticator.webauthn': 'oie.webauthn.label',
  'select-authenticator-authenticate.authenticator.yubikey_token': 'oie.yubikey.label',
  'select-authenticator-authenticate.authenticator.custom_app': 'oie.custom.app.authenticator.title',

  'select-authenticator-unlock-account.authenticator.okta_email': 'oie.email.label',
  'select-authenticator-unlock-account.authenticator.phone_number': 'oie.phone.label',
  'select-authenticator-unlock-account.authenticator.okta_verify.push': 'oie.okta_verify.push.title',

  'authenticator-verification-data.okta_verify.authenticator.methodType.signed_nonce':
    'oie.okta_verify.signed_nonce.label',
  'authenticator-verification-data.okta_verify.authenticator.methodType.push': 'oie.okta_verify.push.title',
  'authenticator-verification-data.okta_verify.authenticator.methodType.totp': 'oie.okta_verify.totp.title',

  'authenticator-enrollment-data.phone_number.authenticator.phoneNumber': 'mfa.phoneNumber.placeholder',
  'authenticator-enrollment-data.phone_number.authenticator.methodType.sms': 'oie.phone.enroll.sms.label',
  'authenticator-enrollment-data.phone_number.authenticator.methodType.voice': 'oie.phone.enroll.voice.label',

  'enroll-authenticator.okta_password.credentials.passcode': 'oie.password.passwordLabel',
  'enroll-authenticator.okta_email.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'enroll-authenticator.phone_number.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'enroll-authenticator.security_question.sub_schema_local_credentials.0': 'oie.security.question.questionKey.label',
  'enroll-authenticator.security_question.sub_schema_local_credentials.1': 'oie.security.question.createQuestion.label',
  'enroll-authenticator.security_question.credentials.answer': 'mfa.challenge.answer.placeholder',
  'enroll-authenticator.security_question.credentials.question': 'oie.security.question.createQuestion.label',
  'enroll-authenticator.security_question.credentials.questionKey': 'oie.security.question.questionKey.label',
  'enroll-authenticator.google_otp.credentials.passcode': 'oie.google_authenticator.otp.enterCodeText',
  'enroll-authenticator.onprem_mfa.credentials.clientData': 'enroll.onprem.username.placeholder',
  'enroll-authenticator.onprem_mfa.credentials.passcode': 'enroll.onprem.passcode.placeholder',
  'enroll-authenticator.rsa_token.credentials.clientData': 'enroll.onprem.username.placeholder',
  'enroll-authenticator.rsa_token.credentials.passcode': 'enroll.onprem.passcode.placeholder',
  'enroll-authenticator.symantec_vip.credentials.credentialId': 'enroll.symantecVip.credentialId.placeholder',
  'enroll-authenticator.symantec_vip.credentials.passcode': 'enroll.symantecVip.passcode1.placeholder',
  'enroll-authenticator.symantec_vip.credentials.nextPasscode': 'enroll.symantecVip.passcode2.placeholder',
  'enroll-authenticator.yubikey_token.credentials.passcode': 'oie.yubikey.passcode.label',

  'enrollment-channel-data.email': 'oie.enroll.okta_verify.channel.email.label',
  'enrollment-channel-data.phoneNumber': 'mfa.phoneNumber.placeholder',

  'select-enrollment-channel.authenticator.channel.qrcode': 'oie.enroll.okta_verify.select.channel.qrcode.label',
  'select-enrollment-channel.authenticator.channel.email': 'oie.enroll.okta_verify.select.channel.email.label',
  'select-enrollment-channel.authenticator.channel.sms': 'oie.enroll.okta_verify.select.channel.sms.label',

  'challenge-authenticator.okta_email.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.okta_password.credentials.passcode': 'mfa.challenge.password.placeholder',
  'challenge-authenticator.phone_number.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.security_question.credentials.answer': 'mfa.challenge.answer.placeholder',
  'challenge-authenticator.okta_verify.credentials.totp': 'oie.okta_verify.totp.enterCodeText',
  'challenge-authenticator.google_otp.credentials.passcode': 'oie.google_authenticator.otp.enterCodeText',
  'challenge-authenticator.onprem_mfa.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.rsa_token.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.custom_otp.credentials.passcode': 'oie.custom_otp.verify.passcode.label',
  'challenge-authenticator.symantec_vip.credentials.passcode': 'oie.symantecVip.verify.passcode.label',
  'challenge-authenticator.yubikey_token.credentials.passcode': 'oie.yubikey.passcode.label',
  'challenge-authenticator.credentials.passcode': 'oie.password.label',

  'reset-authenticator.okta_password.credentials.passcode': 'oie.password.newPasswordLabel',
  'reset-authenticator.okta_password.confirmPassword': 'oie.password.confirmPasswordLabel',
  'reset-authenticator.okta_password.credentials.revokeSessions': 'password.reset.revokeSessions',
  'reenroll-authenticator.okta_password.credentials.passcode': 'oie.password.newPasswordLabel',
  'reenroll-authenticator.okta_password.confirmPassword': 'oie.password.confirmPasswordLabel',
  'reenroll-authenticator.okta_password.credentials.revokeSessions': 'password.reset.revokeSessions',
  'reenroll-authenticator-warning.okta_password.credentials.passcode': 'oie.password.newPasswordLabel',
  'reenroll-authenticator-warning.okta_password.confirmPassword': 'oie.password.confirmPasswordLabel',
  'reenroll-authenticator-warning.okta_password.credentials.revokeSessions': 'password.reset.revokeSessions',
  'enroll-authenticator.okta_password.confirmPassword': 'oie.password.confirmPasswordLabel',
  'enroll-authenticator.okta_password.credentials.revokeSessions': 'password.reset.revokeSessions',
  'incorrectPassword': 'oie.password.incorrect.message',

  'profile-update.userProfile.secondEmail': 'oie.user.profile.secondary.email',

  'user-code.userCode': 'device.code.activate.label',

  // Remap authn API errors to OIE
  'api.authn.poll.error.push_rejected': 'oktaverify.rejected',

  // Remap duo API errors to OIE
  'oie.authenticator.duo.method.duo.verification_timeout': 'oie.authenticator.duo.error',
  'oie.authenticator.duo.method.duo.verification_failed': 'oie.authenticator.duo.error',

  'idx.email.verification.required': 'registration.complete.confirm.text',
  'tooManyRequests': 'oie.tooManyRequests',
  'api.users.auth.error.POST_PASSWORD_UPDATE_AUTH_FAILURE': 'oie.post.password.update.auth.failure.error',
  'security.access_denied': 'errors.E0000006',
  'E0000009': 'errors.E0000009',
  'E0000020': 'errors.E0000020',
  'api.factors.error.sms.invalid_phone': 'oie.phone.invalid',
  'app.ldap.password.reset.failed': 'errors.E0000017',
  'oie.selfservice.unlock_user.challenge.failed.permissions': 'errors.E0000006',
  'core.auth.factor.signedNonce.error.invalidEnrollment': 'core.auth.factor.signedNonce.error',
  'core.auth.factor.signedNonce.error.invalidFactor': 'core.auth.factor.signedNonce.error',
  'core.auth.factor.signedNonce.error.deletedDevice': 'core.auth.factor.signedNonce.error',
  'core.auth.factor.signedNonce.error.invalidDeviceStatus': 'core.auth.factor.signedNonce.error.invalidDevice',

  // re-map autoPush: "Send push automatically"
  'challenge-poll.custom_app.autoChallenge': 'autoPush', // authenticator-verification-custom-app-push-autochallenge
  'challenge-poll.okta_verify.autoChallenge': 'autoPush', // authenticator-verification-okta-verify-push-autoChallenge-on
  'authenticator-verification-data.authenticator.autoChallenge': 'autoPush', // authenticator-verification-data-okta-verify-push-autoChallenge-off.json
  'authenticator-verification-data.okta_verify.authenticator.autoChallenge': 'autoPush',
  'authenticator-verification-data.custom_app.authenticator.autoChallenge': 'autoPush',
  
  // Existing overrides
  ...I18N_BASE_ATTRIBUTE_ENROLL_PROFILE_MAPPINGS, //enroll-profile strings
};

const I18N_PARAMS_MAPPING = {
  [FORMS.ENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.ON_PREM]: {
      getParam: getAuthenticatorDisplayName,
    },
    [AUTHENTICATOR_KEY.RSA]: {
      getParam: getAuthenticatorDisplayName,
    },
  },
};

/**
 * For i18n keys that require string interpolation using values from "params".
 * {baseKey} : {params}
 */
const I18N_OVERRIDE_WITH_PARAMS_MAP = {
  'registration.error.invalidLoginEmail': {
    Email: 'Email',
  },
  'registration.error.doesNotMatchPattern': {
    Email: 'Email',
  },
  'registration.error.notUniqueWithinOrg': {
    Email: 'Email',
  },
};

/**
 * For messages that need to be interpolated with param values.
 *
 * Enumerate each possible param interpolation and hardcode that into properties file.
 * This is to ensure proper translation.
 *
 * Example - a known param:
 *
 * input =
 *  "i18n": {
      "key": "registration.error.doesNotMatchPattern",
      "params": [
        "Email"
      ]
    }
 * output = registration.error.doesNotMatchPattern.Email
 *
 * Example - an unknown param:
 *
 * input =
 *  "i18n": {
      "key": "registration.error.doesNotMatchPattern",
      "params": [
        "Custom Property"
      ]
    }
 * output = registration.error.doesNotMatchPattern.custom
 *
 * @param {String} key
 * @param {String} param
 * @returns {String}
 */
const getI8nKeyUsingParams = (key, param) => {
  let i18nKey = key;

  if (I18N_OVERRIDE_WITH_PARAMS_MAP[i18nKey][param]) {
    i18nKey += `.${param}`;
  } else {
    i18nKey += '.custom';
  }
  return i18nKey;
};

const getI18NParams = (remediation, authenticatorKey) => {
  const params = [];
  const formName = remediation.name;
  if (I18N_PARAMS_MAPPING[formName] &&
    I18N_PARAMS_MAPPING[formName][authenticatorKey]) {
    const config = I18N_PARAMS_MAPPING[formName][authenticatorKey];
    const param = config.getParam(remediation);
    params.push(param);
  }
  return params;
};

const getI18nKey = (i18nPath) => {
  let i18nKey;
  // Extract security question value from i18nPath
  SECURITY_QUESTION_PREFIXES.forEach(prefix => {
    if (i18nPath.indexOf(prefix) === 0) {
      const securityQuestionValue = i18nPath.replace(prefix, '');
      i18nKey = `security.${securityQuestionValue}`;
    }
  });

  if (I18N_OVERRIDE_MAPPINGS[i18nPath]) {
    i18nKey = I18N_OVERRIDE_MAPPINGS[i18nPath];
  }

  if (i18nKey && !Bundles.login[i18nKey]) {
    Logger.warn(`expect i18n key ${i18nKey} for ${i18nPath} but not found in 'login' bundle.`);
    i18nKey = null;
  }

  return i18nKey;
};

const doesI18NKeyExist = (i18nKey) => {
  return !!Bundles.login[i18nKey];
};

/**
 * Find i18n value using {@code i18nPath} if it exists.
 * Otherwise return {@code defaultValue}.
 *
 * @param {string} i18nPath
 * @param {string} defaultValue
 * @param {string[]} params
 */
const getI18NValue = (i18nPath, defaultValue, params = []) => {
  const i18nKey = getI18nKey(i18nPath);
  if (i18nKey) {
    return loc(i18nKey, 'login', params);
  } else {
    Logger.warn(`Avoid rendering unlocalized text sent from the API: ${defaultValue}`);
    return defaultValue;
  }
};

const isWebAuthnAPIError = (i18nKey) => i18nKey.startsWith(WEBAUTHN_API_GENERIC_ERROR_KEY);

/**
 * @typedef {Object} Message
 * @property {string} message
 * @property {Object=} i18n
 * @property {string} i18n.key
 * @property {string[]} i18n.params
 */
/**
 * - If `message.i18n.key` exists and has a value in 'login.properties'
 *   through the given key or via I18N_OVERRIDE_MAPPINGS, return the value.
 *
 * - returns `message.message` otherwise
 *
 * @param {Message} message
 */
const getMessage = (message) => {
  if (message.i18n?.key) {
    let i18nKey = message.i18n.key;
    let i18nParams = message.i18n.params || [];

    // TODO - remove this block once API fix is done - OKTA-398080
    // Sometimes API sends params: [""] an array with empty string.
    // example - error-authenticator-enroll-password-common mock
    if (i18nParams.length === 1 && i18nParams[0] === '') {
      i18nParams = [];
    }

    if (I18N_OVERRIDE_MAPPINGS[message.i18n?.key]) {
      i18nKey = I18N_OVERRIDE_MAPPINGS[message.i18n?.key];
    } else if (I18N_OVERRIDE_WITH_PARAMS_MAP[i18nKey]) {
      const param = message.i18n.params?.[0];
      i18nKey = getI8nKeyUsingParams(i18nKey, param);
      i18nParams = i18nKey.endsWith('custom') ? [param] : [];
    }

    if (Bundles.login[i18nKey]) {
      Logger.info(`Override messages using i18n key ${i18nKey}`);
      // expect user config i18n properly.
      // e.g. the i18n value shall have placeholders like `{0}`, when params is not empty.
      return loc(i18nKey, 'login', i18nParams);
    }

    if (isWebAuthnAPIError(i18nKey)) {
      // The WebAuthn api error doesn't make much sense to a typical end user, but useful for developer.
      // So keep the api message in response, but show a generic error message on UI.
      return loc(WEBAUTHN_API_GENERIC_ERROR_KEY, 'login');
    }
  }

  Logger.warn(`Avoid rendering unlocalized text sent from the API: ${message.message}`);
  return message.message;
};

/**
 * @param {Object} error
 */
const getMessageFromBrowserError = (error) => {
  if (error.name) {
    const key = `oie.browser.error.${error.name}`;
    if (Bundles.login[key]) {
      Logger.info(`Override messages using i18n key ${key}`);
      // expect user config i18n properly.
      return loc(key, 'login');
    }
  }
  return error.message;
};

/**
 * - iff `message.i18n.key` exists return the key.
 *
 * @param {Message} message
 */
const getMessageKey = (message) => {
  return message?.i18n?.key || '';
};

/**
 * Has this i18n key been overridden for customization?
 * @param {String} i18nKey
 * @param {Object} settings
 * @returns Boolean
 */
const isCustomizedI18nKey = (i18nKey, settings) => {
  const language = settings.get('languageCode');
  const i18n = settings.get('i18n');
  const customizedProperty = i18n && i18n[language] && i18n[language][i18nKey];
  return !!customizedProperty;
};

export {
  getMessage,
  getMessageKey,
  getI18NParams,
  getI18nKey,
  getI18NValue,
  doesI18NKeyExist,
  isCustomizedI18nKey,
  getMessageFromBrowserError
};
