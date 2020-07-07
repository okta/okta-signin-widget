/* eslint max-depth: [2, 3] */

import { _ } from 'okta';

const ionOptionsToUiOptions = (options) => {
  const result = {};
  options.forEach(({ value, label }) => {
    result[value] = label;
  });
  return result;
};

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

const getFactorsUiSchema = ({ options }, factors) => ({
  type: 'factorSelect',
  options: createFactorTypeOptions(options, factors),
});

const getPasswordUiSchema = () => ({
  type: 'password',
  params: {
    showPasswordToggle: true,
  },
});

const createUiSchemaForString = (ionFormField, remediationForm, transformedResp) => {
  const uiSchema = {
    type: 'text'
  };

  // e.g. { name: 'password', secret: true }
  if (ionFormField.secret === true) {
    Object.assign(uiSchema, getPasswordUiSchema());
  }

  if (Array.isArray(ionFormField.options)) {
    if (ionFormField.name === 'factorId'
      || ionFormField.name === 'factorProfileId') {
      // select factor form for multiple factor enroll and multiple factor verify
      // when factor has not been enrolled we get back factorProfileId, and once its enrolled
      // we get back factorId
      // e.g. { name: 'factorId' | 'factorProfileId', type: 'string', options: [ {label: 'xxx', value: 'yyy'} ]}
      const factors = transformedResp.factors && transformedResp.factors.value || [];
      Object.assign(uiSchema, getFactorsUiSchema(ionFormField, factors));
    } else if (ionFormField.name.indexOf('methodType') >= 0) {
      // e.g. { name: 'methodType', options: [ {label: 'sms'} ], type: 'string' | null }
      uiSchema.type = 'radio';
      // set the default value to the first value..
      if (ionFormField.options[0] && ionFormField.options[0].value) {
        ionFormField.value = ionFormField.options[0].value;
      }
    } else {
      // default to select (dropdown). no particular reason (certainly can default to radio.)
      // e.g. { name: 'questionKey', options: [], type: 'string' | null }
      uiSchema.type = 'select';
      uiSchema.wide = true;
      uiSchema.options = ionOptionsToUiOptions(ionFormField.options);
    }
  }

  return uiSchema;
};

export default createUiSchemaForString;