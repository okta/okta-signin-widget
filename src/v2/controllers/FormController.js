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
import { _, Controller } from 'okta';
import '../../views/shared/FooterWithBackLink';
import ViewFactory from '../view-builder/ViewFactory';

export default Controller.extend({
  className: 'form-controller',

  initialize: function () {
    Controller.prototype.initialize.call(this);

    this.listenTo(this.options.appState, 'idxResponseUpdated', this.render);
    this.listenTo(this.options.appState, 'invokeAction', this.invokeAction);
    this.listenTo(this.options.appState, 'switchForm', this.switchForm);
    this.listenTo(this.options.appState, 'saveForm', this.handleFormSave);
  },

  preRender () {
    this.removeChildren();
  },

  postRender () {
    const currentViewState = this.options.appState.getCurrentViewState();

    const TheView = ViewFactory.create(
      currentViewState.name,
      this.options.appState.get('factorType'),
      this.options.appState.get('currentStep'),
    );
    this.formView = this.add(TheView, {
      options: {
        currentViewState,
        messages: this.options.appState.get('messages'),
      }
    }).last();

    this.listenTo(this.formView, 'save', this.handleFormSave);
  },

  invokeAction (actionPath = '') {
    const actionFn = this.options.appState.getActionByPath(actionPath);

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

  switchForm (formName) {
    // trigger formname change to change view
    this.options.appState.set('currentFormName', formName);
    this.options.appState.trigger('idxResponseUpdated', formName);

  },

  handleFormSave (model) {
    const formName = model.get('formName');
    const actionFn = this.options.appState.get('currentState')[formName];
    if (!_.isFunction(actionFn)) {
      model.trigger('error', `Cannot find http action for "${formName}".`);
      return;
    }

    this.toggleFormButtonState(true);
    model.trigger('request');
    return actionFn(model.toJSON())
      .then(resp => {
        this.options.appState.trigger('remediationSuccess', resp.response);
      })
      .catch(error => {
        model.trigger('error', model, {'responseJSON': error}, true);
        this.toggleFormButtonState(false);
      });
  },

  /**
   * SignIn widget has its own (hacky) way to customize the button disabled state:
   * adding `link-button-disabled` despite the name was intend only to disable
   * `link-button`.
   * Instead of doing decent refactor, we want to follow the convention for now.
   *
   * @param {boolean} disabled whether add extra disable CSS class.
   */
  toggleFormButtonState: function (disabled) {
    var button = this.$el.find('.o-form-button-bar .button');
    button.toggleClass('link-button-disabled', disabled);
  },

});
