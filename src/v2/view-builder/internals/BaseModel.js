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
import { _, Model } from 'okta';

// change the param to uiSchemaField instead..
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

const createPropsAndLocals = function (
  remediation = {},
  subSchemaConfig = {},
  props = {},
  local = {}) {

  const uiSchemas = remediation.uiSchema || [];

  uiSchemas.forEach(schema => {
    if (Array.isArray(schema.optionsUiSchemas)) {
      let subSchemaIndex;
      let subSchemaValue = {};

      if (Number(schema.value) >= 0) {
        subSchemaIndex = schema.value;
      }
      if (subSchemaConfig[schema.name]) {
        subSchemaValue = {value: subSchemaConfig[schema.name]};
        subSchemaIndex = Number(subSchemaValue.value);
      }

      Object.assign(
        local,
        convertUiSchemaFieldToProp(Object.assign({}, schema, subSchemaValue)));

      if (subSchemaIndex) {
        createPropsAndLocals(
          { uiSchema: schema.optionsUiSchemas[subSchemaIndex] },
          subSchemaConfig,
          props,
          local,
        );
      }
    } else {
      Object.assign(props, convertUiSchemaFieldToProp(schema));
    }
  });
};

const create = function (remediation = {}, subSchemaConfig = {}) {
  const props = {};
  const local = {
    formName: 'string',
  };
  createPropsAndLocals(
    remediation,
    subSchemaConfig,
    props,
    local);

  const BaseModel = Model.extend({
    props,
    local,
  });

  return BaseModel;
};

module.exports = {
  create,
};
