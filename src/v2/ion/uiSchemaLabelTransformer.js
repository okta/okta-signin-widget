/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Create UI Schema into remedation object base on remediation values
 */
import { _, loc, $ } from 'okta';
import Bundles from 'util/Bundles';
import Logger from 'util/Logger';

const SECURITY_QUESTION_PREFIX = 'enroll-authenticator.security_question.credentials.questionKey.';

const I18N_OVERRIDE_MAPPINGS = {
  'identify.identifier': 'primaryauth.username.placeholder',
  'identify.passcode': 'primaryauth.password.placeholder',
  'identify.rememberMe': 'remember',

  'select-authenticator-enroll.authenticator.email': 'oie.email',
  'select-authenticator-enroll.authenticator.password': 'oie.password',
  'select-authenticator-enroll.authenticator.phone': 'oie.phone',
  'select-authenticator-enroll.authenticator.security_key': 'oie.webauthn',
  'select-authenticator-enroll.authenticator.security_question': 'oie.security.question',

  'authenticator-enrollment-data.phone.authenticator.phoneNumber': 'mfa.phoneNumber.placeholder',

  'enroll-authenticator.password.credentials.passcode': 'oie.password.passwordLabel',
  'enroll-authenticator.security_question.credentials.answer': 'mfa.challenge.answer.placeholder',
  'enroll-authenticator.security_question.credentials.question': 'oie.security.question.create.question.label',
  'enroll-authenticator.security_question.credentials.questionKey': 'oie.security.question.questionKey.label',

  'select-authenticator-authenticate.authenticator.email': 'oie.email',
  'select-authenticator-authenticate.authenticator.password': 'oie.password',
  'select-authenticator-authenticate.authenticator.phone': 'oie.phone',
  'select-authenticator-authenticate.authenticator.security_key': 'oie.webauthn',
  'select-authenticator-authenticate.authenticator.security_question': 'oie.security.question',

  'challenge-authenticator.email.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.password.credentials.passcode': 'mfa.challenge.password.placeholder',
  'challenge-authenticator.phone.credentials.passcode': 'mfa.challenge.enterCode.placeholder',
  'challenge-authenticator.security_question.credentials.answer': 'mfa.challenge.answer.placeholder',
};

const getI18nKey = (i18nPath) => {
  let i18nKey;
  if (i18nPath.indexOf(SECURITY_QUESTION_PREFIX) === 0) {
    const securityQuestionValue = i18nPath.replace(SECURITY_QUESTION_PREFIX, '');
    i18nKey = `security.${securityQuestionValue}`;
  }

  if (I18N_OVERRIDE_MAPPINGS[i18nPath]) {
    i18nKey = I18N_OVERRIDE_MAPPINGS[i18nPath];
  }

  if (i18nKey && !Bundles.login[i18nKey]) {
    Logger.warn(`expect i18n key ${i18nKey} for ${i18nPath} but not found in 'login' bundle.`);
  }
};

const overrideLabelIfI18NPathExists = (i18nPath, value) => {
  const i18nKey = getI18nKey(i18nPath);
  if (i18nKey) {
    return loc(i18nKey, 'login');
  } else {
    return value;
  }
};

const updateLabelForUiSchema = (remediation, uiSchema) => {
  if (uiSchema.mutable === false) {
    return;
  }
  Logger.info('i18n label transformer');
  Logger.info('\t remediationName: ', remediation.name);
  Logger.info('\t uiSchema: ', uiSchema);

  const authenticatorType = remediation.relatesTo && remediation.relatesTo.value.type
    ? `.${remediation.relatesTo.value.type}`
    : '';
  const i18nPrefix = `${remediation.name}${authenticatorType}.`;
  const i18nPath = `${i18nPrefix}${uiSchema.name}`;

  if (uiSchema.type === 'checkbox' && uiSchema.placeholder) {
    Logger.info('\t 1: ', i18nPath);
    uiSchema.placeholder = overrideLabelIfI18NPathExists(i18nPath, uiSchema.placeholder);
  }

  if (uiSchema.label) {
    Logger.info('\t 2: ', i18nPath);
    uiSchema.label = overrideLabelIfI18NPathExists(i18nPath, uiSchema.label);
  }
  if ($.isPlainObject(uiSchema.options)) {
    uiSchema.options = _.mapObject(uiSchema.options, (value, key) => {
      const i18nPathOption = `${i18nPath}.${key}`;
      Logger.info('\t 3: ', i18nPathOption);
      return overrideLabelIfI18NPathExists(i18nPathOption, value);
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
      overrideLabelIfI18NPathExists(i18nPathOption, o.label);
    });
  }

  if (Array.isArray(uiSchema.optionsUiSchemas)) {
    uiSchema.optionsUiSchemas.forEach(optionsUiSchema => {
      optionsUiSchema.forEach(uiSchema => updateLabelForUiSchema(remediation, uiSchema));
    });
  }

};

const uiSchemaLabelTransformer = (transformedResp) => {
  if (Array.isArray(transformedResp.remediations)) {
    transformedResp.remediations
      .filter(remediation => Array.isArray(remediation.uiSchema) && remediation.uiSchema.length)
      .forEach(remediation => {
        remediation.uiSchema.forEach(uiSchema => updateLabelForUiSchema(remediation, uiSchema));
      });
  }
  return transformedResp;
};

module.exports = uiSchemaLabelTransformer;
