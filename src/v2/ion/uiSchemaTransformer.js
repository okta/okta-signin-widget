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

/**
 * Create UI Schema into remedation object base on remediation values
 */
import { _ } from '@okta/courage';
import createUiSchemaForBoolean from './ui-schema/ion-boolean-handler';
import createUiSchemaForObject from './ui-schema/ion-object-handler';
import createUiSchemaForString from './ui-schema/ion-string-handler';

const UISchemaHandlers = {
  string: createUiSchemaForString,
  boolean: createUiSchemaForBoolean,
  object: createUiSchemaForObject,
};

/**
 *
 * @param {AuthResult} transformedResp
 * @param {IONForm} remeditationForm
 */
const createUISchema = (transformedResp, remediationForm, settings) => {

  // For cases where field itself is a form, it has a formname and we are appending the formname to each field.
  // Sort of flat the structure in order to align Courage flatten Model. The flatten structure will be converted
  // back to object hierarchy through `Model.toJSON`.
  // For simplicity we are assuming that when field itself is a form its only one level deep.
  const remediationValue = _.chain(remediationForm.value || [])
    .filter(v => v.visible !== false)
    .map(v => {
      let nestedForm;
      if (v.form) {
        nestedForm = v.form;
      } else if (v.value?.form) {
        nestedForm = v.value.form;
      }

      if (nestedForm) {
        const inputGroupName = v.name;
        return nestedForm.value.map(input => {
          return Object.assign({}, input, { name: inputGroupName + '.' + input.name });
        });
      } else {
        return v;
      }
    })
    .flatten()
    .value();

  return remediationValue.map(ionFormField => {
    const uiSchemaDefaultConfig = {
      'label-top': true,
      'multirowError': true,
      'data-se': `o-form-fieldset-${ionFormField.name}`,
    };
    const fieldType = ionFormField.type || 'string';
    const uiSchemaHandler = UISchemaHandlers[fieldType];
    const uiSchemaResult = uiSchemaHandler(ionFormField, remediationForm, transformedResp, createUISchema, settings);

    return Object.assign(
      {},
      ionFormField,
      uiSchemaDefaultConfig,
      uiSchemaResult,
    );
  });
};

/**
 *
 * @param {AuthResult} transformedResp
 */
const insertUISchema = (settings, transformedResp) => {
  if (transformedResp) {
    transformedResp.remediations = transformedResp.remediations.map(obj => {
      obj.uiSchema = createUISchema(transformedResp, obj, settings);
      return obj;
    });
  }
  return transformedResp;
};

export default insertUISchema;

/**
 * @typedef {Object} Authenticator
 * @property {string} label
 * @property {AuthenticatorValue} value
 */
/**
 * @typedef {Object} AuthenticatorValue
 * @property {string} type Authenticator Type
 * @property {string} id Authenticator Org Authenticator ID
 * @property {AuthenticatorMethod[]} methods
 */
/**
 * @typedef {Object} AuthenticatorEnrollment
 * @property {string} label
 * @property {AuthenticatorEnrollmentValue} value
 */
/**
 * @typedef {Object} AuthenticatorEnrollmentValue
 * @property {string} authenticatorId Org Authenticator ID
 * @property {string} type Authenticator Type
 * @property {string} id Authenticator Enrollment ID
 * @property {AuthenticatorMethod[]} methods
 */
/**
 * @typedef {Object} AuthenticatorMethod
 * @property {string} type Authenticator method type
 */
/**
 * @typedef {Object} AuthenticatorOption
 * @property {string} label
 * @property {Object} form
 * @property {AuthenticatorOption[]} form.value
 */
/**
 * @typedef {Object} AuthenticatorOptionValue
 * @property {string} name
 * @property {boolean} required
 * @property {string} value
 * @property {boolean} mutable
 */
/**
 * @typedef {Object} IONForm
 * @property {string} name
 * @property {string[]} rel
 * @property {string} method
 * @property {string} href
 * @property {string} accepts
 * @property {IONFormField[]} value
 */
/**
 * @typedef {Object} IONFormField
 * @property {string} name
 * @property {string=} type
 * @property {string=} required
 * @property {string=} secret
 * @property {string=} label
 * @property {Object[]} options
 * @property {Object=} form
 * @property {IONFormField[]} form.value
 */
