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
import { _, Model } from '@okta/courage';

const convertUiSchemaFieldToProp = (uiSchemaField) => {
  const config = Object.assign(
    {},
    _.chain(uiSchemaField)
      .pick('minLength', 'maxLength', 'required', 'value')
      .defaults({ type: 'string', required: true })
      .value()
  );

  if (uiSchemaField.modelType) {
    config.type = uiSchemaField.modelType;
  }

  return { [uiSchemaField.name]: config };
};

const createPropsAndLocals = function(
  remediation = {},
  optionUiSchemaConfig = {},
  props = {},
  local = {}) {

  const uiSchemas = remediation.uiSchema || [];

  uiSchemas.forEach(schema => {
    if (Array.isArray(schema.optionsUiSchemas)) {
      let optionUiSchemaIndex;
      let optionUiSchemaValue = {};

      if (Number(schema.value) >= 0) {
        optionUiSchemaIndex = schema.value;
      }
      if (optionUiSchemaConfig[schema.name]) {
        optionUiSchemaValue = { value: optionUiSchemaConfig[schema.name] };
        optionUiSchemaIndex = Number(optionUiSchemaValue.value);
      }

      Object.assign(
        local,
        convertUiSchemaFieldToProp(Object.assign({}, schema, optionUiSchemaValue)));

      if (optionUiSchemaIndex) {
        createPropsAndLocals(
          { uiSchema: schema.optionsUiSchemas[optionUiSchemaIndex] },
          optionUiSchemaConfig,
          props,
          local,
        );
      }
    } else {
      Object.assign(props, convertUiSchemaFieldToProp(schema));
    }
  });
};

const create = function(remediation = {}, optionUiSchemaConfig = {}) {
  const props = {};
  const local = {
    // current remediation form name
    formName: 'string',
    // use full page redirect instead of AJAX
    useRedirect: 'boolean',
  };
  createPropsAndLocals(
    remediation,
    optionUiSchemaConfig,
    props,
    local);

  const BaseModel = Model.extend({
    props,
    local,
  });

  return BaseModel;
};

export default {
  create,
};
