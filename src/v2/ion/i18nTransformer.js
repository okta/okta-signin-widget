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

///////////////////////////////////////////////////////////////////////////////
//                                  How this transformer work?               //
//
// ## For Labels inside remediation forms
// 1. Figure out Path for all Labels (for normal field, or options) or Placeholder (for checkbox),e.g.
//   - `identify.identifier`, this is the label for user name at identify page
//   - `select-authenticator-enroll.authenticator.email`,
//      this is for label for email authenticator at `select-authenticator-enroll` page
// 2. Define a mapping between the path and i18n key. see `I18N_OVERRIDE_MAPPINGS`
//   - This mapping is subject to change when API starts sending i18n key along with label.
//     It probably becomes a mapping between API's i18n key and key in login.properties
//     in order to be backward compatible.
// 3. Now find i18n value using such route: `i18n Path -> i18n key -> login.properties`
//    If found an i18n value, replace label by this i18n value.
//
// ## For top level messages
// 1. Overwrite `message.message` if `message.i18n.key` exists in `login.properties`
//
// ## How to override mappings in I18N_OVERRIDE_MAPPINGS for localization?
// Step 1. First search the string in login.properties and see if already exists or not
// Step 2. Find idx response path, for eg. select-authenticator-enroll.authenticator.email
// Step 3. Make that path a key and add it to I18N_OVERRIDE_MAPPINGS if doesn't exist already
// Step 4. If you find a key in Step 1 that already exists, use it as value of key created in Step 3, 
//          else create a new lable `oie.your.new.label` and add it.
// Step 5. If you create a new label then add that to login.properties file with proper string
//         oie.your.new.label = Your new string
///////////////////////////////////////////////////////////////////////////////

import { _, loc, $ } from 'okta';
import Bundles from 'util/Bundles';
import Logger from 'util/Logger';
import { getAuthenticatorDisplayName } from '../view-builder/utils/AuthenticatorUtil';
import { FORMS, AUTHENTICATOR_KEY } from './RemediationConstants';

const SECURITY_QUESTION_PREFIXES = [
  'enroll-authenticator.security_question.credentials.questionKey.',
  'challenge-authenticator.security_question.credentials.questionKey.',
];

const I18N_OVERRIDE_MAPPINGS = {
  'identify.identifier': 'primaryauth.username.placeholder',
  'identify.credentials.passcode': 'primaryauth.password.placeholder',
  'identify.rememberMe': 'oie.remember',

  'identify-recovery.identifier': 'password.forgot.email.or.username.placeholder',

  'select-authenticator-enroll.authenticator.okta_email': 'oie.email.label',
  'select-authenticator-enroll.authenticator.okta_password': 'oie.password.label',
  'select-authenticator-enroll.authenticator.phone_number': 'oie.phone.label',
  'select-authenticator-enroll.authenticator.webauthn': 'oie.webauthn.label',
  'select-authenticator-enroll.authenticator.security_question': 'oie.security.question.label',
  'select-authenticator-enroll.authenticator.okta_verify': 'oie.okta_verify.label',
  'select-authenticator-enroll.authenticator.google_otp': 'oie.google_authenticator.label',
  'select-authenticator-enroll.authenticator.rsa_token': 'factor.totpHard.rsaSecurId',

  'select-authenticator-authenticate.authenticator.okta_email': 'oie.email.label',
  'select-authenticator-authenticate.authenticator.okta_password': 'oie.password.label',
  'select-authenticator-authenticate.authenticator.phone_number': 'oie.phone.label',
  'select-authenticator-authenticate.authenticator.webauthn': 'oie.webauthn.label',
  'select-authenticator-authenticate.authenticator.security_question': 'oie.security.question.label',
  'select-authenticator-authenticate.authenticator.okta_verify.signed_nonce': 'oie.okta_verify.signed_nonce.label',
  'select-authenticator-authenticate.authenticator.okta_verify.push': 'oie.okta_verify.push.title',
  'select-authenticator-authenticate.authenticator.okta_verify.totp': 'oie.okta_verify.totp.title',
  'select-authenticator-authenticate.authenticator.google_otp':
    'oie.google_authenticator.label',
  'select-authenticator-authenticate.authenticator.rsa_token': 'factor.totpHard.rsaSecurId',

  'select-authenticator-unlock-account.authenticator.okta_email': 'oie.email.label',
  'select-authenticator-unlock-account.authenticator.phone_number': 'oie.phone.label',

  'authenticator-verification-data.okta_verify.authenticator.methodType.signed_nonce':
    'oie.okta_verify.signed_nonce.label',
  'authenticator-verification-data.okta_verify.authenticator.methodType.push': 'oie.okta_verify.push.title',
  'authenticator-verification-data.okta_verify.authenticator.methodType.totp': 'oie.okta_verify.totp.title',

  'authenticator-enrollment-data.phone_number.authenticator.phoneNumber': 'mfa.phoneNumber.placeholder',

  'enroll-authenticator.okta_password.credentials.passcode': 'oie.password.passwordLabel',
  'enroll-authenticator.phone.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'enroll-authenticator.security_question.sub_schema_local_credentials.0': 'oie.security.question.questionKey.label',
  'enroll-authenticator.security_question.sub_schema_local_credentials.1': 'oie.security.question.createQuestion.label',
  'enroll-authenticator.security_question.credentials.answer': 'mfa.challenge.answer.placeholder',
  'enroll-authenticator.security_question.credentials.question': 'oie.security.question.createQuestion.label',
  'enroll-authenticator.security_question.credentials.questionKey': 'oie.security.question.questionKey.label',
  'enroll-authenticator.google_otp.credentials.passcode': 'oie.google_authenticator.otp.title',
  'enroll-authenticator.onprem_mfa.credentials.clientData': 'enroll.onprem.username.placeholder',
  'enroll-authenticator.onprem_mfa.credentials.passcode': 'enroll.onprem.passcode.placeholder',
  'enroll-authenticator.rsa_token.credentials.clientData': 'enroll.onprem.username.placeholder',
  'enroll-authenticator.rsa_token.credentials.passcode': 'enroll.onprem.passcode.placeholder',

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

  'enroll-profile.userProfile.lastName': 'oie.user.profile.lastname',
  'enroll-profile.userProfile.firstName': 'oie.user.profile.firstname',
  'enroll-profile.userProfile.email': 'oie.user.profile.primary.email',

  'oie.session.expired' : 'oie.idx.session.expired',
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
    if (i18nPath.indexOf(prefix) === 0 ) {
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

const updateLabelForUiSchema = (remediation, uiSchema) => {
  if (uiSchema.mutable === false && uiSchema.name.indexOf('questionKey') < 0) {
    return;
  }
  Logger.info('i18n label transformer');
  Logger.info('\t remediationName: ', remediation.name);
  Logger.info('\t uiSchema: ', JSON.stringify(uiSchema));

  const authenticatorKey = remediation.relatesTo?.value?.key;
  const authenticatorKeyPath = authenticatorKey
    ? `.${remediation.relatesTo.value.key}`
    : '';

  const i18nPrefix = `${remediation.name}${authenticatorKeyPath}.`;
  let i18nPath = `${i18nPrefix}${uiSchema.name}`;

  if (uiSchema.type === 'text' && uiSchema.name.indexOf('questionKey') >= 0 && uiSchema.value !== 'custom') {
    i18nPath = `${i18nPath}.${uiSchema.value}`;
  }

  if (uiSchema.type === 'checkbox' && uiSchema.placeholder) {
    Logger.info('\t 1: ', i18nPath);
    uiSchema.placeholder = getI18NValue(i18nPath, uiSchema.placeholder);
  }

  if (uiSchema.label) {
    Logger.info('\t 2: ', i18nPath);
    const params = getI18NParams(remediation, authenticatorKey);
    uiSchema.label = getI18NValue(i18nPath, uiSchema.label, params);
  }
  if ($.isPlainObject(uiSchema.options)) {
    uiSchema.options = _.mapObject(uiSchema.options, (value, key) => {
      const i18nPathOption = `${i18nPath}.${key}`;
      Logger.info('\t 3: ', i18nPathOption);
      return getI18NValue(i18nPathOption, value);
    });
  }
  if (Array.isArray(uiSchema.options)) {
    uiSchema.options.forEach(o => {
      if (!o.label) {
        return;
      }
      let i18nPathOption;
      if (o.authenticatorKey) {
        i18nPathOption = `${i18nPath}.${o.authenticatorKey}`;

        const methodType = o.value?.methodType;
        if (o.authenticatorKey === AUTHENTICATOR_KEY.OV && methodType) {
          i18nPathOption = `${i18nPathOption}.${methodType}`;
        }
      } else if (o.value !== undefined) { // value could be string or number or undefined.
        i18nPathOption = `${i18nPath}.${o.value}`;
      }
      Logger.info('\t 4: ', i18nPathOption);
      o.label = getI18NValue(i18nPathOption, o.label);
    });
  }

  if (Array.isArray(uiSchema.optionsUiSchemas)) {
    uiSchema.optionsUiSchemas.forEach(optionsUiSchema => {
      optionsUiSchema.forEach(uiSchema => updateLabelForUiSchema(remediation, uiSchema));
    });
  }

};

/**
 * @typedef {Object} Message
 * @property {string} message
 * @property {Object=} i18n
 * @property {string} i18n.key
 * @property {string[]} i18n.params
 */
/**
 * - iff `message.i18n.key` exists and has value in 'login.properties', return the value.
 * - otherwise returns `message.message`
 *
 * @param {Message} message
 */
const getMessage = (message) => {
  if (message.i18n?.key) {
    const i18nKey = message.i18n.key;
    if (Bundles.login[i18nKey]) {
      Logger.info(`Override messages using i18n key ${i18nKey}`);
      // expect user config i18n properly.
      // e.g. the i18n value shall have placeholders like `{0}`, when params is not empty.
      return loc(i18nKey, 'login', message.i18n.params || []);
    }
  }
  Logger.warn(`Avoid rendering unlocalized text sent from the API: ${message.message}`);
  return message.message;
};

/**
 * - iff `message.i18n.key` exists return the key.
 *
 * @param {Message} message
 */
const getMessageKey = (message) => {
  return message?.i18n?.key || '';
};

const uiSchemaLabelTransformer = (transformedResp) => {
  // Try to override label using i18n value
  if (Array.isArray(transformedResp.remediations)) {
    transformedResp.remediations
      .filter(remediation => Array.isArray(remediation.uiSchema) && remediation.uiSchema.length)
      .forEach(remediation => {
        remediation.uiSchema.forEach(uiSchema => updateLabelForUiSchema(remediation, uiSchema));
      });
  }

  // Try to override `messages` using i18n value.
  // 1. This is only handling top level `messages` object when response status is 200.
  // 2. See `IonResponseHelper.js` where handle `messages` object when none 200 response.
  // 3. Handling `messages` in remediation forms on 200 response is not considered yet.
  //    Is that possible?
  if (Array.isArray(transformedResp.messages?.value)) {
    transformedResp.messages.value.forEach(message => {
      message.message = getMessage(message);
    });
  }
  return transformedResp;
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

export { uiSchemaLabelTransformer as default, getMessage, getMessageKey, getI18NParams, isCustomizedI18nKey };
