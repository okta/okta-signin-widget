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
 * @property {string} status
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
 * @property {value[]=} value mandatory visible parameters
 */

const isObject = (x) => _.isObject(x);
const isArray = (x) => Array.isArray(x);
const containsAny = (xs, ys) => _.intersection(xs, ys).length > 0;

const getRelObjectByName = (resp, relName) => {
  const getRelBy_ = (result, resp_) => {
    if (isObject(resp_)) {
      if (resp_.rel && containsAny(resp_.rel, relName)) {
        result.push(resp_);
      } else {
        Object.keys(resp_)
          .forEach(k => {
            getRelBy_(result, resp_[k]);
          });
      }
    } else if (isArray(resp_)) {
      resp_.forEach(x => getRelBy_(result, x));
    }
    return result;
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

  const obj = {
    name: relObj.name,
    createRequest (extraData = {}) {
      const reqData = needExtraData ? Object.assign({}, data, extraData) : data;
      return {
        method: relObj.method,
        url: relObj.href,
        data: reqData,
      };
    }
  };

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
  const result = _.omit(remedationValue, 'rel', 'href', 'method', 'value');
  const value = remedationValue.value.filter(v => v.visible !== false);

  if (value.length) {
    result.value = value;
  }
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
  const remediation = resp.remediation.value.map(normalizeRemedation);
  const restData = _.omit.apply(_, [resp, 'remediation'].concat(Object.keys(actions)));

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
  if (!isObject(resp) || !resp) {
    return null;
  }

  const firstLevelObjects = convertObjectType(resp);
  const currentState = createCurrentStateObject(resp, Object.keys(firstLevelObjects));

  const result = Object.assign({},
    firstLevelObjects,
    {
      currentState,
      __raw: resp,
    },
  );
  return result;
};

module.exports = convert;
