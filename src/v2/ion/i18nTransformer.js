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
//   - Not all path needs i18n override. e.g.
//     `challenge-authenticator.security_question.credentials.questionKey`,
//     which is security question during verify step and apparently it does not
//     need overwrite.
//   - This mapping is subject to change when API starts sending i18n key along with label.
//     It probably becomes a mapping between API's i18n key and key in login.properties
//     in order to be backward compatible.
// 3. Now find i18n value using such route: `i18n Path -> i18n key -> login.properties`
//    If found an i18n value, replace label by this i18n value.
//
// ## For top level messages
// 1. Overwrite `message.message` if `message.i18n.key` exists in `login.properties`
//
///////////////////////////////////////////////////////////////////////////////

import { _, loc, $ } from 'okta';
import Bundles from 'util/Bundles';
import Logger from 'util/Logger';

const SECURITY_QUESTION_PREFIX = 'enroll-authenticator.security_question.credentials.questionKey.';

const I18N_OVERRIDE_MAPPINGS = {
  'identify.identifier': 'primaryauth.username.placeholder',
  'identify.credentials.passcode': 'primaryauth.password.placeholder',
  'identify.rememberMe': 'remember',

  'select-authenticator-enroll.authenticator.email': 'oie.authenticator.email.label',
  'select-authenticator-enroll.authenticator.password': 'oie.authenticator.password.label',
  'select-authenticator-enroll.authenticator.phone': 'oie.authenticator.phone.label',
  'select-authenticator-enroll.authenticator.security_key': 'oie.authenticator.webauthn.label',
  'select-authenticator-enroll.authenticator.security_question': 'oie.authenticator.security.question.label',
  'select-authenticator-enroll.authenticator.app': 'oie.authenticator.okta_verify.label',

  'select-authenticator-authenticate.authenticator.email': 'oie.authenticator.email.label',
  'select-authenticator-authenticate.authenticator.password': 'oie.authenticator.password.label',
  'select-authenticator-authenticate.authenticator.phone': 'oie.authenticator.phone.label',
  'select-authenticator-authenticate.authenticator.security_key': 'oie.authenticator.webauthn.label',
  'select-authenticator-authenticate.authenticator.security_question': 'oie.authenticator.security.question.label',
  'select-authenticator-authenticate.authenticator.app': 'oie.authenticator.okta_verify.label',

  'authenticator-enrollment-data.phone.authenticator.phoneNumber': 'mfa.phoneNumber.placeholder',

  'enroll-authenticator.password.credentials.passcode': 'oie.password.passwordLabel',
  'enroll-authenticator.security_question.sub_schema_local_credentials.0': 'oie.security.question.questionKey.label',
  'enroll-authenticator.security_question.sub_schema_local_credentials.1': 'oie.security.question.createQuestion.label',
  'enroll-authenticator.security_question.credentials.answer': 'mfa.challenge.answer.placeholder',
  'enroll-authenticator.security_question.credentials.question': 'oie.security.question.createQuestion.label',
  'enroll-authenticator.security_question.credentials.questionKey': 'oie.security.question.questionKey.label',

  'challenge-authenticator.email.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.password.credentials.passcode': 'mfa.challenge.password.placeholder',
  'challenge-authenticator.phone.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.security_question.credentials.answer': 'mfa.challenge.answer.placeholder',
};

const getI18nKey = (i18nPath) => {
  let i18nKey;

  // we can add mapping to `I18N_OVERRIDE_MAPPINGS` for all
  // security question. It's just a bit tedious hence use following shortcut.
  if (i18nPath.indexOf(SECURITY_QUESTION_PREFIX) === 0) {
    const securityQuestionValue = i18nPath.replace(SECURITY_QUESTION_PREFIX, '');
    i18nKey = `security.${securityQuestionValue}`;
  }

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
 */
const getI18NValue = (i18nPath, defaultValue) => {
  const i18nKey = getI18nKey(i18nPath);
  if (i18nKey) {
    return loc(i18nKey, 'login');
  } else {
    return defaultValue;
  }
};

const updateLabelForUiSchema = (remediation, uiSchema) => {
  if (uiSchema.mutable === false) {
    return;
  }
  Logger.info('i18n label transformer');
  Logger.info('\t remediationName: ', remediation.name);
  Logger.info('\t uiSchema: ', JSON.stringify(uiSchema));

  const authenticatorType = remediation.relatesTo?.value.type
    ? `.${remediation.relatesTo.value.type}`
    : '';
  const i18nPrefix = `${remediation.name}${authenticatorType}.`;
  const i18nPath = `${i18nPrefix}${uiSchema.name}`;

  if (uiSchema.type === 'checkbox' && uiSchema.placeholder) {
    Logger.info('\t 1: ', i18nPath);
    uiSchema.placeholder = getI18NValue(i18nPath, uiSchema.placeholder);
  }

  if (uiSchema.label) {
    Logger.info('\t 2: ', i18nPath);
    uiSchema.label = getI18NValue(i18nPath, uiSchema.label);
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
      if (o.authenticatorType) {
        i18nPathOption = `${i18nPath}.${o.authenticatorType}`;
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
  return message.message;
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

export { uiSchemaLabelTransformer as default, getMessage };
