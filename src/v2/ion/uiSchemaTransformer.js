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
 * @typedef {Object} FactorOption
 * @property {string} label Factor label
 * @property {string} value Factor ID
 */
/**
 * @typedef {Object} Factor
 * @property {string} factorType
 * @property {string} factorId
 */

/**
 * Adds `factorType` metadata to each select-factor option item using factors array
 * @param {FactorOption[]} options
 * @param {Factor[]} factors
 * @returns {Object} option
 * @returns {string} option.label
 * @returns {string} option.value
 * @returns {string} option.factorType
 */
const createFactorTypeOptions = (options, factors) => {
  _.each(options, function (optionItem) {
    const factorValue = optionItem.value;
    const factor = factors.find(function (item) {
      return (item.factorProfileId === factorValue
        || item.factorId === factorValue);
    }) || {};
    optionItem.factorType = factor.factorType;
  });
  return options;
};


/**
 * @typedef {Object} AuthenticatorInstance
 * @property {string} authenticatorId
 * @property {string} authenticatorType
 * @property {string} authenticatorEnrollmentId
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
 * Example of the option like
 * @param {AuthenticatorOption[]} options
 * @param {AuthenticatorInstance[]} authenticators
 */
const createAuthenticatorOptions = (options = [], authenticators = []) => {
  return options.map(option => {
    const value = option.value && option.value.form && option.value.form.value || [];
    const valueObject = value
      // TODO:
      // base on current API design, there maybe field that has
      // required is true && muable is true, need to figure out
      // later how to surface up to UI.
      .filter(v => v.required === true && v.mutable === false)
      .reduce((init, v) => {
        return Object.assign(init, {[v.name]: v.value});
      }, {});
    const authenticator = authenticators.find(auth => {
      return auth.authenticatorId === valueObject.id;
    }) || {};

    return {
      label: option.label,
      value: valueObject,
      authenticatorType: authenticator.authenticatorType
    };
  });
};

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

/**
 *
 * @param {IONFormField[]} remediationValue
 * @param {factor[]} factors
 */
const createUISchema = (remediationValue = [], factors = [], authenticators = []) => {
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
      uiSchema.type = 'factorSelect';
      uiSchema.options = createFactorTypeOptions(ionFormField.options, factors);
    }

    // similar to `factorId` but `authenticator` is a new way to model factors
    // hence it has different structure
    if (ionFormField.name === 'authenticator') {
      uiSchema.type = 'authenticatorSelect';
      uiSchema.options = createAuthenticatorOptions(ionFormField.options, authenticators);
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
 * @param {AuthResult} transformedResp
 */
const insertUISchema = (transformedResp) => {
  if (transformedResp) {
    const factors = transformedResp.factors && transformedResp.factors.value || [];
    const authenticators = transformedResp.authenticators && transformedResp.authenticators.value || [];

    transformedResp.remediations = transformedResp.remediations.map(obj => {
      obj.uiSchema = createUISchema(obj.value, factors, authenticators);
      return obj;
    });
  }
  return transformedResp;
};

module.exports = insertUISchema;
