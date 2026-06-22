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

const OPTED_SCOPES_PREFIX = 'optedScopes.';

/**
 * This function is for the Granular Consent remediation. The Granular Consent
 * model uses `flat: false` (see GranularConsentView) so Courage's toJSON does
 * not try to unflatten the optedScopes sub-form — that would crash when scope
 * names share a dotted prefix (e.g. `custom1` and `custom1.custom2`). The
 * flat `optedScopes.<scope>` keys are grouped here into the nested
 * `optedScopes` object that the IDX backend expects, preserving dotted scope
 * names verbatim.
 * i.e. { 'optedScopes.custom1': true, 'optedScopes.custom1.custom2': false }
 *      => { optedScopes: { 'custom1': true, 'custom1.custom2': false } }
 *
 * @param {JSON} modelJSON JSON Equivalent of the Backbone Model's attributes/fields
 * @returns A copy of modelJSON with `optedScopes.*` keys grouped into a single `optedScopes` object.
 */
const transformOptedScopes = (modelJSON) => {
  const result = { ...modelJSON };
  const optedScopes = {};
  Object.keys(modelJSON).forEach((key) => {
    if (key.indexOf(OPTED_SCOPES_PREFIX) === 0) {
      optedScopes[key.slice(OPTED_SCOPES_PREFIX.length)] = modelJSON[key];
      delete result[key];
    }
  });
  result.optedScopes = optedScopes;
  return result;
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
