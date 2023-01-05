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

/* eslint max-len: [2, 130] */
import { Form, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import ProfileSchema from 'v1/models/ProfileSchema';
import RegistrationFormFactory from 'v1/util/RegistrationFormFactory';
export default Form.extend({
  layout: 'o-form-theme',
  autoSave: true,
  noCancelButton: true,
  title() {
    return loc('registration.form.title', 'login');
  },
  save() {
    return loc('registration.form.submit', 'login');
  },
  initialize: function(options) {
    this.options = options || {};
    this.schema = new ProfileSchema({
      profileSchemaAttributes: this.options.appState.get('policy').registration.profile,
    });
    this.schema.properties.each(schemaProperty => {
      const inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);

      this.addInput(inputOptions);
    });
    const requiredFieldsLabel = hbs('<span class="required-fields-label">{{label}}</span>')({
      label: loc('registration.required.fields.label', 'login'),
    });

    this.add(requiredFieldsLabel);
  },
});
