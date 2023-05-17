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

import { FORMS as RemediationForms } from './RemediationConstants';

const flattenObj = (obj) => {
  let result = {};

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] !== 'object') {
      result[key] = obj[key];
      return;
    }

    const tempObj = flattenObj(obj[key]);
    Object.keys(tempObj).forEach((j) => {
      result[key + '.' + j] = tempObj[j];
    });
  });
  return result;
};

/**
 * This function is for the Granular Consent remediation, scopes within the optedScopes
 * property can include a singular value or n values delimited by a "."
 * When they are delimited, BackBone's toJSON function will create a nested object, however,
 * these should not be nested and the delimited key names should stay as is. So this function will
 * flatten those nested proeprties to format it how the backend expects it. 
 * i.e. { optedScopes: { some: { scope: true }}} = { optedScopes: { 'some.scope': true }}
 * Currently, this is only used when the Granular Consent view form is saved see:
 * src/v2/view-builder/views/consent/GranularConsentView.js
 * 
 * @param {JSON} modelJSON JSON Equivalent of the Backbone Model's attributes/fields
 * @returns If the JSON contains the optedScopes Property, we will flatten the fields from
 * a nested object into K/V pair with dot notation for nested key names. Otherwise, we will return
 * the JSON as is.
 */
const transformOptedScopes = (modelJSON) => {
  if (modelJSON.optedScopes && typeof modelJSON.optedScopes !== 'string') {
    const data = {
      ...modelJSON,
      optedScopes: flattenObj(modelJSON.optedScopes),
    };
    return data;
  }
  return modelJSON;
};

const FormNameToTransformerHandler = {
  [RemediationForms.CONSENT_GRANULAR]: transformOptedScopes,
};

/**
 * The purpose of this function is the transform the
 * Backbone Model's attributes/fields into a JSON equivalent before sending to IDX,
 * since the Model fields are all flattend when the UI Schema is transformed on consumption.
 * 
 * @param {string} formName Form name of the current remediation
 * @param {Model} model Backbone Model Class
 * @returns JSON equivalent of the Model
 */
const transformPayload = (formName, model) => {
  const modelJSON = model.toJSON();
  const transformHandler = FormNameToTransformerHandler[formName];
  if (typeof transformHandler === 'undefined') {
    return modelJSON;
  }
  return transformHandler(modelJSON);
};

export default transformPayload;
