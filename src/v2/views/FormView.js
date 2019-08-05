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
define([
  'okta',
  '../util/ModelBuilder',
  '../util/FormBuilder',
], function (Okta, ModelBuilder, FormBuilder) {
  return Okta.View.extend({

    initialize: function () {
      this.options.appState.get('remediation').forEach(this.renderSingleForm.bind(this));
    },

    renderSingleForm: function (remediationValue) {
      const IonModel = ModelBuilder.createModel(remediationValue);

      const model = new IonModel({
        formName: remediationValue.name,
      });

      const IonForm = FormBuilder.createInputOptions(remediationValue);
      const form = this.add(IonForm, {
        options: {
          model,
        }
      }).last();

      this.listenTo(form, 'save', (model) => {
        this.trigger('save', model);
      });

    },

  });
});
