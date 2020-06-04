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
 * @typedef {Object} Authenticator
 * @property {string} label
 * @property {AuthenticatorValue} value
 */
/**
 * @typedef {Object} AuthenticatorValue
 * @property {string} type Authenticator Type
 * @property {string} id Authenticator Org Authenticator ID
 * @property {AuthenticatorMethod[]} methods
 */

/**
 * @typedef {Object} AuthenticatorEnrollment
 * @property {string} label
 * @property {AuthenticatorEnrollmentValue} value
 */
/**
 * @typedef {Object} AuthenticatorEnrollmentValue
 * @property {string} authenticatorId Org Authenticator ID
 * @property {string} type Authenticator Type
 * @property {string} id Authenticator Enrollment ID
 * @property {AuthenticatorMethod[]} methods
 */
/**
 * @typedef {Object} AuthenticatorMethod
 * @property {string} type Authenticator method type
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
 * @param {( AuthenticatorEnrollment[] || Authenticator[] )} authenticators
 */
const createAuthenticatorOptions = (options = [], authenticators = []) => {
  const authenticatorValues = authenticators.map(_.property('value'));

  return options.map(option => {
    const value = option.value && option.value.form && option.value.form.value || [];

    // Each authenticator option has list of ION field.
    // Currently we are only support merely selecting one of options
    // rather than pop up another page to collection extra data
    // (in order to fill value for `mutable: true; value: null` fields).
    // The only reason of such design is to simplify widget implementation
    // but could subject to change in later releases.
    // Thus only surface up fields that are `required: true; mutable: false`
    // which implies it already has `value`.
    const valueObject = value
      .filter(v => v.required === true && v.mutable === false)
      .reduce((init, v) => {
        return Object.assign(init, {[v.name]: v.value});
      }, {});
    const authenticator = authenticatorValues.find(auth => {
      return auth.id === valueObject.id;
    }) || {};

    return {
      label: option.label,
      value: valueObject,
      authenticatorType: authenticator.type,
    };
  });
};

/**
 * @typedef {Object} IONForm
 * @property {string} name
 * @property {string[]} rel
 * @property {string} method
 * @property {string} href
 * @property {string} accepts
 * @property {IONFormField[]} value
 */
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
 * @param {AuthResult} transformedResp
 * @param {IONForm} remeditationForm
 */
const createUISchema = (transformedResp, remediationForm) => {
  /* eslint complexity: [2, 16] */

  // For cases where field itself is a form, it has a formname and we are appending the formname to each field.
  // Sort of flat the structure in order to align Courage flatten Model. The flatten structure will be converted
  // back to object hierarchy through `Model.toJSON`.
  // For simplicity we are assuming that when field itself is a form its only one level deep.
  const remediationValue = _.chain(remediationForm.value || [])
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

  const getCheckboxUiSchema = ({ label, type, required }) => ({
    // For Remember Me checkbox, we need the label only on the right side of it.
    placeholder: label,
    label: false,
    // Separating prop type for Backbone.Model
    // from html input type
    modelType: type,
    // uiSchema type is the html input type desired.
    type: 'checkbox',
    required: required || false,
  });

  const getPasswordUiSchema = () => ({
    type: 'password',
    params: {
      showPasswordToggle: true,
    },
  });

  const getFactorsUiSchema = ({ options }, factors) => ({
    type: 'factorSelect',
    options: createFactorTypeOptions(options, factors),
  });

  const getAuthenticatorsUiSchema = ({ options }, authenticators) => ({
    type: 'authenticatorSelect',
    options: createAuthenticatorOptions(options, authenticators),
  });

  return remediationValue.map(ionFormField => {
    const uiSchema = {
      'label-top': true,
      type: 'text',
    };

    if (ionFormField.type === 'boolean') {
      Object.assign(uiSchema, getCheckboxUiSchema(ionFormField));
    }

    if (ionFormField.secret === true) {
      Object.assign(uiSchema, getPasswordUiSchema());
    }
    // select factor form for multiple factor enroll and multiple factor verify
    // when factor has not been enrolled we get back factorProfileId, and once its enrolled
    // we get back factorId
    if (ionFormField.name === 'factorId' ||
      ionFormField.name === 'factorProfileId') {
      const factors = transformedResp.factors && transformedResp.factors.value || [];
      Object.assign(uiSchema, getFactorsUiSchema(ionFormField, factors));
    }

    // similar to `factorId` but `authenticator` is a new way to model factors
    // hence it has different structure
    if (ionFormField.name === 'authenticator'
      && remediationForm.name === 'select-authenticator-authenticate') {
      const authenticators = transformedResp.authenticatorEnrollments
        && transformedResp.authenticatorEnrollments.value || [];
      Object.assign(uiSchema, getAuthenticatorsUiSchema(ionFormField, authenticators));
    }

    if (ionFormField.name === 'authenticator'
      && remediationForm.name === 'select-authenticator-enroll') {
      const authenticators = transformedResp.authenticators
        && transformedResp.authenticators.value || [];
      // TODO: OKTA-302497: use different type for enrollment flow.
      Object.assign(uiSchema, getAuthenticatorsUiSchema(ionFormField, authenticators));
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
    transformedResp.remediations = transformedResp.remediations.map(obj => {
      obj.uiSchema = createUISchema(transformedResp, obj);
      return obj;
    });
  }
  return transformedResp;
};

module.exports = insertUISchema;
