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
    //select factor form for multiple factor enroll and multiple factors verify
    if (ionFormField.name === 'factorType' || ionFormField.name === 'factorId') {
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
