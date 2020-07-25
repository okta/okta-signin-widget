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

/**
 * Example of the option like
 * @param {AuthenticatorOption[]} options
 * @param {( AuthenticatorEnrollment[] || Authenticator[] )} authenticators
 */
const createAuthenticatorOptions = (options = []) => {
  return options.map(option => {
    const value = option.value && option.value.form && option.value.form.value || [];

    // Each authenticator option has list of ION field.
    // Currently we only support merely selecting one of options
    // rather than pop up another page to collect extra data
    // (in order to fill value for `mutable: true; value: null` fields).
    // The only reason of such design is to simplify widget implementation
    // but could subject to change in later releases.
    // Thus only surface up fields that are `required: true; mutable: false`
    // which implies it already has `value`.
    const valueObject = value
      .filter(v => v.required === true && v.mutable === false)
      .reduce((init, v) => {
        return Object.assign(init, { [v.name]: v.value });
      }, {});
    return {
      label: option.label,
      value: valueObject,
      relatesTo: option.relatesTo,
      authenticatorType: option.relatesTo && option.relatesTo.type,
    };
  });
};

const getAuthenticatorsEnrollUiSchema = ({ options }) => {
  return {
    type: 'authenticatorEnrollSelect',
    options: createAuthenticatorOptions(options),
  };
};

const getAuthenticatorsVerifyUiSchema = ({ options }) => {
  return {
    type: 'authenticatorVerifySelect',
    options: createAuthenticatorOptions(options),
  };
};

/**
  * Create ui schema for ION field that has type 'object'.
  */
const createUiSchemaForObject = (ionFormField, remediationForm, transformedResp, createUISchema) => {
  const uiSchema = {};

  if (ionFormField.name === 'authenticator' && remediationForm.name === 'select-authenticator-authenticate') {
    // 1. when `select-authenticator-authenticator`,
    // create customize type so that display authenticator list as selectable list
    Object.assign(uiSchema, getAuthenticatorsVerifyUiSchema(ionFormField));
  } else if (ionFormField.name === 'authenticator' && remediationForm.name === 'select-authenticator-enroll') {
    // 2. when `select-authenticator-enroll`,
    // create customize type so that display authenticator list as selectable list
    Object.assign(uiSchema, getAuthenticatorsEnrollUiSchema(ionFormField));
  } else if (Array.isArray(ionFormField.options)) {
    // 3. For other cases, create ui schema for each `option` in order to render
    // different view for each option.
    //
    // e.g. { "name": "credentials", "type": "object", options: [ {value: {form: value:[]} ]
    uiSchema.optionsUiSchemas = ionFormField.options.map(opt => {
      return createUISchema(transformedResp, {
        value: [
          {
            name: ionFormField.name,
            value: opt.value,
          }
        ]
      });
    });
    uiSchema.options = ionFormField.options.map((opt, index) => {
      return { label: opt.label, value: index };
    });
    // assume (default to) use radio buttons to switch sub-schema.
    uiSchema.type = 'radio';
    uiSchema.value = '0';
    uiSchema.name = `sub_schema_local_${ionFormField.name}`;
  }

  return uiSchema;
};

export default createUiSchemaForObject;
