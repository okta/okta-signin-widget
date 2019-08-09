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
import ViewFactory from '../view-builder/ViewFactory';
import FactorBeacon from '../view-builder/components/FactorBeacon';

export default BaseLoginController.extend({
  className: 'form-controller',
  initialize: function () {
    BaseLoginController.prototype.initialize.call(this);

    this.listenTo(this.options.appState, 'change:currentState', this.setRemediationValueByPriorityAndRender);
    this.listenTo(this.options.appState, 'invokeAction', this.invokeAction);
    this.listenTo(this.options.appState, 'showView', this.setRemediationByFormAndRender);
    this.listenTo(this.options.appState, 'saveForm', this.handleFormSave);

    this.setRemediationValueByPriority();
  },

  setRemediationByFormAndRender (formName) {
    this.remediationValue = this.findRemediationValueByFormName(formName);
    this.render();
  },

  setRemediationValueByPriority () {
    this.remediationValue = this.options.appState.get('remediation')[0];
  },

  setRemediationValueByPriorityAndRender () {
    this.setRemediationValueByPriority();
    this.render();
  },

  preRender () {
    this.removeChildren();
  },

  postRender () {
    const TheView = ViewFactory.create(this.remediationValue.name);
    this.formView = this.add(TheView, {
      options: {
        remediationValue: this.remediationValue,
      }
    }).last();

    this.listenTo(this.formView, 'save', this.handleFormSave);
  },

  findRemediationValueByFormName (formName) {
    return this.options.appState.get('remediation')
      .filter(r => r.name === formName)[0];
  },

  invokeAction (actionPath = '') {
    const paths = actionPath.split('.');
    let targetObject;
    if (paths.length === 1) {
      targetObject = this.options.appState.get('currentState');
    } else {
      targetObject = this.options.appState.get(paths.shift());
    }
    // At the time of writting, action only lives in first level of state objects.
    const actionFn = targetObject[paths.shift()];

    if (_.isFunction(actionFn)) {
      // TODO: OKTA-243167
      // 1. what's the approach to show spinner indicating API in fligh?
      // 2. how to catch error?
      actionFn()
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
