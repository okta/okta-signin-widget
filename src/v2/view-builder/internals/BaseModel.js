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
import { _, Model} from 'okta';

// change the param to uiSchemaField instead..
const convertUiSchemaFieldToProp = (uiSchemaField) => {
  const config = Object.assign(
    {},
    _.chain(uiSchemaField)
      .pick('minLength', 'maxLength', 'required')
      .defaults({ type: 'string', required: true })
      .value()
  );

  if (uiSchemaField.modelType) {
    config.type = uiSchemaField.modelType;
  }

  return { [uiSchemaField.name]: config };
};

const create = function (remediation = {}) {
  const value = remediation.uiSchema;
  const props = _.chain(value)
    .map(convertUiSchemaFieldToProp)
    .reduce((init, field) => {
      return Object.assign({}, init, field);
    })
    .value();

  const BaseModel = Model.extend({
    props,

    local: {
      formName: 'string',
    },
  });

  return BaseModel;
};

module.exports = {
  create,
};
