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
import { validateFieldsMatch } from './ValidationUtil';

const covertIonFieldToProp = (ionField) => {
  const config = Object.assign(
    {
      required: true,
      type: 'string',
    },
    _.pick(ionField, 'minLength', 'maxLength'),
  );
  return { [ionField.name]: config };
};

const createModel = function (remediation = {}) {
  const value = remediation.value;
  const props = _.chain(value)
    .map(covertIonFieldToProp)
    .reduce((init, field) => {
      return Object.assign({}, init, field);
    })
    .value();

  return Model.extend({
    props,

    local: {
      formName: 'string',
    },

    validate: function (data) {
      //validate password match
      if (data.formName === 'enroll-factor-password') {
        return validateFieldsMatch(data.password, data.confirmPassword);
      }
    }
  });
};

module.exports = {
  createModel,
};
