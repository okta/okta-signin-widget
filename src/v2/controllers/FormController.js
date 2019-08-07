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
import { _ } from 'okta';
import '../../views/shared/FooterWithBackLink';
import BaseLoginController from './BaseLoginController';
import FormView from '../views/FormView';
import ViewFactory from '../view-builder/ViewFactory';

export default BaseLoginController.extend({
  className: 'form-controller',
  initialize: function () {
    BaseLoginController.prototype.initialize.call(this);

    this.listenTo(this.options.appState, 'change:currentState', this.reRender);
    this.listenTo(this.options.appState, 'invokeCurrentStateAction', this.invokeCurrentStateAction);
    this.listenTo(this.options.appState, 'saveForm', this.handleFormSave);
  },

  reRender () {
    this.removeChildren();
    this.render();
  },

  postRender () {
    const firstRemediationValue = this.options.appState.get('remediation')[0];

    if (_.contains(['identify', 'select-factor', 'enroll-factor-password'], firstRemediationValue.name)) {
      const TheView = ViewFactory.create(firstRemediationValue.name);
      this.formView = this.add(TheView, {
        options: {
          remediationValue: firstRemediationValue,
        }
      }).last();
    } else {
      this.formView = this.add(FormView).last();
    }

    this.listenTo(this.formView, 'save', this.handleFormSave);

    // add footer if its not IDENTIFY step
    if (this.options.appState.get('currentState').step !== 'IDENTIFY') {
      // TODO: move to uiSchema
      // this.add(new FooterWithBackLink(this.toJSON()));
    }
  },

  invokeCurrentStateAction (actionName = '') {
    const currentState = this.options.appState.get('currentState');
    if (_.isFunction(currentState[actionName])) {
      // TODO: what's the approach to show spinner indicating API in fligh?
      currentState[actionName]()
        .then(resp => {
          this.options.appState.trigger('remediationSuccess', resp.response);
        })
        .catch();
    }
  },

  handleFormSave (model) {
    const formName = model.get('formName');
    const actionFn = this.options.appState.get('currentState')[formName];

    if (!_.isFunction(actionFn)) {
      model.trigger('error', `Cannot find http action for "${formName}".`);
      return;
    }

    model.trigger('request');
    return actionFn(model.toJSON())
      .then(resp => {
        this.options.appState.trigger('remediationSuccess', resp.response);
      })
      .catch(error => {
        model.trigger('error', error);
      });
  },
});
