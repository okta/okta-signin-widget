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
    if (typeof obj[key] !== 'object' || Array.isArray(obj[key])) {
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

const transformPayload = (formName, model) => {
  const modelJSON = model.toJSON();
  const transformHandler = FormNameToTransformerHandler[formName];
  if (typeof transformHandler === 'undefined') {
    return modelJSON;
  }
  return transformHandler(modelJSON);
};

export default transformPayload;
