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

import _ from 'underscore';
import { getMessage, getMessageKey } from './i18nUtils';

const convertErrorMessageToErrorSummary = (formName, remediationValues = []) => {
  return _.chain(remediationValues)
    .filter(field => {
      return Array.isArray(field.messages?.value) && field.messages.value.length;
    })
    .map(field => {
      return {
        property: formName ? `${formName}.${field.name}` : field.name,
        errorSummary: field.messages.value.map(getMessage),
        errorKey: field.messages.value.map(getMessageKey),
      };
    })
    .value();
};

/**
 * Although time complexity is O(n^2),
 * the `array` is actually very small (size < 5),
 * hence performance doesn't matter.
 */
const uniqWith = (array, comparator) => {
  if (!Array.isArray(array)) {
    return [];
  }
  if (!_.isFunction(comparator) || array.length === 1) {
    return array;
  }

  const result = [];
  for (let i = 0; i < array.length; i++) {
    let seen = false;
    for (let j = i + 1; j < array.length; j++) {
      /* eslint max-depth: [2, 3] */
      if (comparator(array[i], array[j])) {
        seen = true;
        break;
      }
    }
    if (!seen) {
      result.push(array[i]);
    }
  }

  return result;
};

/**
 * returns errors
 * @example
 * errors = [
 *   {property : fieldName1, errorSummary: [errorMessage1]},
 *   {property : fieldName2, errorSummary: [errorMessage2]}
 *   {property : fieldName3, errorSummary: [errorMessage31, errorMessage32]}
 * ]
 */
const getRemediationErrors = (res) => {
  let errors = [];

  if (!res.remediation || !Array.isArray(res.remediation.value) || res.remediation.value.length === 0) {
    return errors;
  }
  let remediationFormFields = res.remediation.value[0].value;

  if (!Array.isArray(remediationFormFields)) {
    return errors;
  }

  // error at field
  errors.push(convertErrorMessageToErrorSummary(null, remediationFormFields));

  _.each(remediationFormFields, (remediationForm) => {
    const formName = remediationForm.name;

    // error at form.value
    if (Array.isArray(remediationForm.form?.value)) {
      errors.push(convertErrorMessageToErrorSummary(formName, remediationForm.form.value));
    }

    // error at option.value.form.value
    if (Array.isArray(remediationForm.options)) {
      _.each(remediationForm.options, (option) => {
        if (Array.isArray(option.value?.form?.value)) {
          errors.push(convertErrorMessageToErrorSummary(formName, option.value.form.value));
        }
      });
    }
  });

  // API may return identical error on same field
  // thus run through `uniqWith`.
  // Check unit test for details.
  return uniqWith(_.flatten(errors), _.isEqual);
};

/**
 * return global error summary combined into one string
 * allErrors = 'error string1. error string2'
 */
const getGlobalErrors = (res) => {
  let allErrors = [];

  if (Array.isArray(res.messages?.value)) {
    allErrors = res.messages.value.map(getMessage);
  }

  return allErrors.join('. ');
};

/**
 * return array of error keys
 */
const getGlobalErrorKeys = (res) => {
  let allKeys = [];

  if (Array.isArray(res.messages?.value)) {
    allKeys = res.messages.value.map(getMessageKey);
  }

  return allKeys;
};

const convertFormErrors = (response) => {
  let errors = {
    errorCauses: getRemediationErrors(response),
    errorSummary: getGlobalErrors(response),
    errorSummaryKeys: getGlobalErrorKeys(response),
    errorIntent: response.intent,
  };

  return {
    responseJSON: errors
  };
};

const isIonErrorResponse = (response = {}) => {
  // check if error format is an ION response by looking for version attribute.
  // a little sloppy.
  return response.version;
};

const isIdxSessionExpiredError = (response) => {
  const errorI18NKey = response?.context?.messages?.value[0]?.i18n?.key;
  return errorI18NKey && errorI18NKey === 'idx.session.expired';
};

export default {
  convertFormErrors,
  isIonErrorResponse,
  isIdxSessionExpiredError
};
