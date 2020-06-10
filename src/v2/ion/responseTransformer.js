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
 * Flatten first level objects from response
 */
const getFirstLevelObjects = (resp) => {
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

    // for handling attributes with type object
    if (val.type === 'object') {
      result[key] = val.value;
    }
  });
  return result;
};

const getRemediationValues = (idx) => {
  const remediationValues = [];
  // handle success case
  if (_.isEmpty(idx.neededToProceed) && idx.context.success) {
    remediationValues.push({
      name: idx.context.success.name,
      href: idx.context.success.href,
      value: []
    });
  }
  return {
    remediations: [
      ...remediationValues,
      ...idx.neededToProceed,
    ]
  };
};

/**
 *
 * @param {idx} idx object
 * @returns {} transformed object with flattened firstlevel objects, idx and remediations array
 * Example: {
 *  remediations: [],
 *  proceed: ƒ(),
 *  neededToProceed: [],
 *  actions: {cancel: ƒ()},
 *  context: {},
 *  rawIdxState:{},
 *  factors: {},
 *  factor: {},
 *  messages: {},
 * }
 */
const convert = (idx = {}) => {
  if (!isObject(idx.rawIdxState)) {
    return null;
  }
  const resp = idx.rawIdxState;

  const firstLevelObjects = getFirstLevelObjects(resp);

  const remediationValues = getRemediationValues(idx);

  const result = Object.assign({},
    firstLevelObjects,
    remediationValues,
    { idx }
  );
  return result;
};

module.exports = convert;
