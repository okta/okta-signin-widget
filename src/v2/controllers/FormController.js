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
  '../util/BaseLoginController',
  '../views/FormView',
  '../../views/shared/FooterWithBackLink'
],
function (
  Okta,
  BaseLoginController,
  FormView,
  FooterWithBackLink
) {
  return BaseLoginController.extend({
    className: 'form-controller',
    initialize: function () {
      BaseLoginController.prototype.initialize.call(this);
      this.listenTo(this.options.appState, 'change:currentState', this.reRender);
    },

    reRender () {
      if (this.formView) {
        this.formView.remove();
      }
      this.render();
    },

    postRender () {
      this.formView = this.add(FormView).last();

      this.listenTo(this.formView, 'save', this.handleFormSave);

      // add footer if its not IDENTIFY step
      if (!this.options.appState.get('currentState').step === 'IDENTIFY') {
        this.add(new FooterWithBackLink(this.toJSON()));
      }
    },

    handleFormSave (model) {
      const formName = model.get('formName');
      const actionFn = this.options.appState.get('currentState')[formName];

      if (!Okta._.isFunction(actionFn)) {
        model.trigger('error', `Cannot find http action for "${formName}".`);
        return;
      }

      model.trigger('request');
      return actionFn(model.toJSON())
        .then(resp => {
          model.trigger('sync');
          this.options.appState.trigger('remediationSuccess', resp.response);
        })
        .catch(error => {
          model.trigger('error', error);
        });
    },
  });
});
