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

import { _ } from 'okta';

/**
 * Transform the ion spec response into canonical format.
 */

/**
 * Authn V2 response
 * @typedef {Object} AuthnResponse
 */

/**
 * @typedef {Object} AuthnResult
 * @property {Object=} user
 * @property {Object=} factor
 */

const isObject = x => _.isObject(x);

/**
 * Transform 'type: "object"' by converting "rel: form" to be a function.
 */
const convertObjectType = (resp) => {
  const result = {};
  _.each(resp, (val, key) => {
    // if key is remediation we dont do any transformation
    if (key === 'remediation') {
      return;
    }

    // for arrays we just want it as a top level object
    // Example factors array in select-factor form
    if (val.type === 'array') {
      result[key] = {
        value: val.value
      };
    }

    // for objects like factor
    if (val.type === 'object') {
      result[key] = val.value;
    }
  });
  return result;
};

/**
 *
 * @param {AuthnResponse} resp authn v2 response
 * @returns {AuthnResult} transformed result
 */
const convert = (idx) => {
  if (!isObject(idx && idx.rawIdxState)) {
    return null;
  }
  const resp = idx.rawIdxState;

  const firstLevelObjects = convertObjectType(resp);

  const result = Object.assign({},
    firstLevelObjects,
    idx
  );
  return result;
};

module.exports = convert;
