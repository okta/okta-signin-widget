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

import { _ } from 'okta';

const convertErrorMessageToErrorSummary = (formName, remediationValues = []) => {
  return _.chain(remediationValues)
    .filter(field => {
      return field.messages
        && Array.isArray(field.messages.value)
        && field.messages.value.length;
    })
    .map(field => {
      return {
        property: formName ? `${formName}.${field.name}` : field.name,
        errorSummary: _.map(field.messages.value, (err) => err.message),
      };
    })
    .value();
};

/**
 * returns errors
 * @example
 * errors = [
 *   {property : fieldName1, errorSummary: [errorMessage1]},
 *   {property : fieldName2, errorSummary: [errorMessage1]}
 *   {property : fieldName3, errorSummary: [errorMessage1, errorMessage2]}
 * ]
 */
const getRemediationErrors = (res) => {
  let errors = [];

  if (!res.remediation || !Array.isArray(res.remediation.value) || res.remediation.value.length === 0) {
    return errors;
  }
  let remediationFormFields = res.remediation.value[0].value ;

  if (!Array.isArray(remediationFormFields)) {
    return errors;
  }

  // error at field
  errors.push(convertErrorMessageToErrorSummary(null, remediationFormFields));

  _.each(remediationFormFields, (remediationForm) => {
    const formName = remediationForm.name;

    // error at form.value
    if (remediationForm.form && Array.isArray(remediationForm.form.value)) {
      errors.push(convertErrorMessageToErrorSummary(formName, remediationForm.form.value));
    }

    // error at option.value.form.value
    if (Array.isArray(remediationForm.options)) {
      _.each(remediationForm.options, (option) => {
        if (option.value && option.value.form && Array.isArray(option.value.form.value)) {
          errors.push(convertErrorMessageToErrorSummary(formName, option.value.form.value));
        }
      });
    }
  });

  return _.flatten(errors);
};

/**
 * return global error summary combined into one string
 * allErrors = 'error string1. error string2'
 */
const getGlobalErrors  = (res) => {
  let allErrors = [];

  if(res.messages && res.messages.value) {
    _.each(res.messages.value, (value) => {
      if(value.message) {
        allErrors.push(value.message);
      }
    });
  }

  return allErrors.join('. ');
};

const convertFormErrors = (response) => {
  let errors = {
    errorCauses : getRemediationErrors(response),
    errorSummary : getGlobalErrors(response)
  };

  return {
    responseJSON : errors
  };
};

export default {
  convertFormErrors
};
