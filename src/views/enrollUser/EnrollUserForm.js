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

import hbs from 'handlebars-inline-precompile';

/* eslint max-len: [2, 130] */
define([
  'okta',
  'util/RegistrationFormFactory',
  'models/ProfileSchema',
], function (Okta, RegistrationFormFactory, ProfileSchema) {
  return Okta.Form.extend({
    layout: 'o-form-theme',
    autoSave: true,
    noCancelButton: true,
    title: Okta.loc('registration.form.title', 'login'),
    save: Okta.loc('registration.form.submit', 'login'),
    initialize: function (options) {
      this.options = options || {};
      this.schema = new ProfileSchema({ profileSchemaAttributes: this.options.appState.get('policy').registration.profile });
      this.schema.properties.each((schemaProperty) => {
        var inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
        this.addInput(inputOptions);
      });
      var requiredFieldsLabel = hbs('<span class="required-fields-label">{{label}}</span>')({
        label: Okta.loc('registration.required.fields.label', 'login')
      });
      this.add(requiredFieldsLabel); 
    }
  });
});
