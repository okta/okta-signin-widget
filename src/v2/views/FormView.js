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
      // Assume the first form is most important and default to display.
      this.renderSingleForm(this.options.appState.get('remediation')[0]);
    },

    renderSingleForm: function (remediationValue) {
      const IonModel = ModelBuilder.createModel(remediationValue);

      const model = new IonModel({
        formName: remediationValue.name,
      });

      const IonForm = FormBuilder.createForm(remediationValue);
      const appState = this.options.appState;
      const form = this.add(IonForm, {
        options: {
          model,
          appState
        }
      }).last();

      this.listenTo(form, 'save', this.saveForm);

      this.maybeRunPolling(remediationValue, model);
    },

    maybeRunPolling (remediationValue, model) {
      // auto 'save' the form if `refresh` is set. a.k.a polling
      // UI will re-render per response even it might be same response
      // thus don't need `setInterval`.
      // (because FormController listen to 'change:currentState' and
      //  'currentState` will be re-created per response hence it's different object.
      //  )
      if (Okta._.isNumber(remediationValue.refresh)) {
        Okta._.delay(this.saveForm.bind(this, model), remediationValue.refresh);
      }
    },

    saveForm (model) {
      this.options.appState.trigger('saveForm', model);
    }

  });
});
