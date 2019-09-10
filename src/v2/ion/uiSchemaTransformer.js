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
import { _ } from 'okta';
/**
 * @typedef {Object} IONFormField
 * @property {string} name
 * @property {string=} type
 * @property {string=} required
 * @property {string=} secret
 * @property {string=} label
 * @property {Object[]} options
 */

/**
 *
 * @param {IONFormField[]} remediationValue
 */
const createUISchema = (remediationValue = []) => {
  // For cases where field itself is a form, it has a formname and we are appending the formname to each field
  // This is so that while making the request we can bundle these key:value pairs under the same key name
  // For simplicity we are assuming that when field itself is a form its only one level deep
  remediationValue = _.chain(remediationValue)
    .map(v => {
      if (v.form) {
        const inputGroupName = v.name;
        return v.form.value.map(input => {
          return Object.assign({}, input, { name: inputGroupName + '.' + input.name });
        });
      } else {
        return v;
      }
    })
    .flatten()
    .value();
  return remediationValue.map(ionFormField => {
    const uiSchema = {
      type: 'text',
    };
    if (ionFormField.secret === true) {
      uiSchema.type = 'password';
      uiSchema.params = {
        showPasswordToggle: true,
      };
    }
    // select factor form for multiple factor enroll and multiple factor verify
    // when factor has not been enrolled we get back factorProfileId, and once its enrolled
    // we get back factorId
    if (ionFormField.name === 'factorId' ||
      ionFormField.name === 'factorProfileId') {
      uiSchema.type = 'factorType';
    }
    return Object.assign(
      {},
      ionFormField,
      uiSchema,
    );
  });
};

/**
 *
 * @param {AuthResult} transformedResp (after `actionsTransformer`)
 */
const insertUISchema = (transformedResp) => {
  if (transformedResp.currentState) {
    const remediation = transformedResp.currentState.remediation || [];
    transformedResp.currentState.remediation = remediation.map(obj => {
      obj.uiSchema = createUISchema(obj.value);
      return obj;
    });
  }
  return transformedResp;
};

module.exports = insertUISchema;
