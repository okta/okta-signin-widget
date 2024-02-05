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
//          else create a new label `oie.your.new.label` and add it.
// Step 5. If you create a new label then add that to login.properties file with proper string
//         oie.your.new.label = Your new string
///////////////////////////////////////////////////////////////////////////////


import { _, $ } from '@okta/courage';
import Logger from 'util/Logger';
import { AUTHENTICATOR_KEY } from './RemediationConstants';
import {
  getMessage,
  getI18NParams,
  getI18NValue,
} from './i18nUtils';
export * from './i18nUtils';

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
    uiSchema.label = uiSchema.customLabel ? uiSchema.label : getI18NValue(i18nPath, uiSchema.label, params);
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
      } else if (typeof o.value === 'string' || typeof o.value === 'number') { // value could be string, number, object or undefined.
        i18nPathOption = `${i18nPath}.${o.value}`;
      } else {
        i18nPathOption = i18nPath;
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

export default (transformedResp) => {
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
