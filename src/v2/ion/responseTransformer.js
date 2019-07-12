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
 * @property {CurrentState} currentState
 * @property {Object=} user
 * @property {Object=} factor
 */

/**
 * @typedef {Object} CurrentState
 * @property {string} stateHandle
 * @property {string} step
 * @property {string} intent
 * @property {function} cancel
 * @property {function} context
 * @property {Remediation} remediation
 */

/**
 * @typedef {Object} Remediation
 * @property {RemediationObject[]} values
 */

/**
 * @typedef {Object} RemediationObject
 * @property {string} name
 * @property {value[]} value mandatory visible parameters
 * @property {uiSchema[]} uiSchema `value` corresponding UI Schema
 */

const isObject = x => _.isObject(x);
const isArray = x => Array.isArray(x);
const containsAny = (xs, ys) => _.intersection(xs, ys).length > 0;

const getRelObjectByName = (resp, relName) => {
  const getRelBy_ = (result_, resp_) => {
    if (isObject(resp_)) {
      if (resp_.rel && containsAny(resp_.rel, relName)) {
        result_.push(resp_);
      } else {
        _.mapObject(resp_, getRelBy_.bind({}, result_));
      }
    } else if (isArray(resp_)) {
      resp_.forEach(getRelBy_.bind({}, result_));
    }
    return result_;
  };

  return getRelBy_([], resp);
};

/**
 *
 * @returns {Object} actionObject
 * @returns {string} actionObject.name
 * @returns {function} actionObject.createRequest
 */
const createActionObj = (relObj) => {
  const data = (relObj.value || [])
    .filter(v => v.visible === false)
    .map(v => { return { [v.name]: v.value }; })
    .reduce((init, x) => Object.assign({}, init, x), {});

  const needExtraData = relObj.value.length !== Object.keys(data).length;
  const method = relObj.method;
  const url = relObj.href;
  const obj = {
    name: relObj.name,
    createRequest (extraData = {}) {
      const reqData = needExtraData ? Object.assign({}, data, extraData) : data;
      return {
        method,
        url,
        data: reqData,
      };
    }
  };
  if (relObj.refresh) {
    obj.createRequest.refresh = relObj.refresh;
  }

  return obj;
};

/**
 * @returns {Object.<string, function>} actions
 */
const createActions = (allCreateForms) => {
  const allActions = allCreateForms.map(createActionObj);

  // turns list of actions into a mapping
  return allActions.reduce((init, action) => {
    return Object.assign({}, init, {
      [action.name]: action.createRequest,
    });
  }, {});
};

const convertRelFormToFunction = (value) => {
  const allCreateForms = getRelObjectByName(value, ['create-form']);
  const actions = createActions(allCreateForms);
  const restValue = _.omit.apply(_, [value].concat(Object.keys(actions)));

  return Object.assign({}, restValue, actions);
};

/**
 * Transform 'type: "object"' by converting "rel: form" to be a function.
 */
const convertObjectType = (resp) => {
  const result = {};
  _.each(resp, (val, key) => {
    if (val.type && val.type === 'object') {
      result[key] = convertRelFormToFunction(val.value);
    }
  });
  return result;
};

/**
 * remove attribute that used for actions (`createActionObj`)
 *
 * @returns {RemediationObject} remediationObject
 */
const normalizeRemedation = (remedationValue) => {
  const result = _.omit(remedationValue, 'rel', 'method', 'value');
  result.value = remedationValue.value.filter(v => v.visible !== false);

  return result;
};

/**
 *
 * @param {AuthnResponse} originalResp
 * @param {*} omitKeys
 * @returns {CurrentState} currentState
 */
const createCurrentStateObject = (originalResp, omitKeys) => {
  const resp = _.omit.apply(_, [originalResp].concat(omitKeys));
  const allCreateForms = getRelObjectByName(resp, ['create-form']);
  const actions = createActions(allCreateForms);
  const restData = _.omit.apply(_, [resp, 'remediation', 'success'].concat(Object.keys(actions)));
  let remediation = [];

  if (resp.remediation) {
    remediation = resp.remediation.value.map(normalizeRemedation);
  }
  // success does not have remediation, only has a name and href
  if (resp.success) {
    remediation = [resp.success];
  }

  return Object.assign(restData, actions, {
    remediation,
  });

};

/**
 *
 * @param {AuthnResponse} resp authn v2 response
 * @returns {AuthnResult} transformed result
 */
const convert = (resp) => {
  if (!isObject(resp)) {
    return null;
  }

  const firstLevelObjects = convertObjectType(resp);
  const currentState = createCurrentStateObject(resp, Object.keys(firstLevelObjects));

  const result = Object.assign({},
    firstLevelObjects,
    {
      currentState,
      __rawResponse: resp,
    },
  );
  return result;
};

module.exports = convert;
