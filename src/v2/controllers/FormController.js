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
import IonResponseHelper from '../ion/IonResponseHelper';

export default Controller.extend({
  className: 'form-controller',

  initialize: function () {
    Controller.prototype.initialize.call(this);

    this.listenTo(this.options.appState, 'change:currentFormName', this.render);
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
      this.options.appState.get('authenticatorType'),
    );
    this.formView = this.add(TheView, {
      options: {
        currentViewState,
      }
    }).last();

    this.listenTo(this.formView, 'save', this.handleFormSave);
  },

  invokeAction (actionPath = '') {
    const idx = this.options.appState.get('idx');
    if (idx['neededToProceed'].find(item => item.name === actionPath)) {
      idx.proceed(actionPath, {})
        .then(this.handleIdxSuccess.bind(this))
        .catch(error => {
          throw error;
        });
      return;
    }

    const actionFn = idx['actions'][actionPath];

    if (_.isFunction(actionFn)) {
      // TODO: OKTA-243167
      // 1. what's the approach to show spinner indicating API in fligh?
      // 2. how to catch error?
      actionFn()
        .then(this.handleIdxSuccess.bind(this))
        .catch(error => {
          throw error;
        });
    } else {
      throw `Invalid action selected: ${actionPath}`;
    }
  },

  switchForm (formName) {
    // trigger formname change to change view
    this.options.appState.set('currentFormName', formName);
  },

  handleFormSave (model) {
    const formName = model.get('formName');
    const idx = this.options.appState.get('idx');
    if (!idx['neededToProceed'].find(item => item.name === formName)) {
      model.trigger('error', model, { errorSummary: `Cannot find http action for "${formName}".`});
      return;
    }
    this.toggleFormButtonState(true);
    model.trigger('request');
    return idx.proceed(formName, model.toJSON())
      .then(this.handleIdxSuccess.bind(this))
      .catch(error => {
        if (error.proceed && error.rawIdxState) {
          // Okta server responds 401 status code with WWW-Authenticate header and new remediation
          // so that the iOS/MacOS credential SSO extension (Okta Verify) can intercept
          // the response reaches here when Okta Verify is not installed
          // we need to return an idx object so that
          // the SIW can proceed to the next step without showing error
          this.handleIdxSuccess(error);
        } else {
          this.showFormErrors(model, error);
        }
      });
  },

  showFormErrors (model, error) {
    //check if error format is an ION response by looking for version attribute. To handle both types of responses.
    if(error.version) {
      const convertedErrors = IonResponseHelper.convertFormErrors(error);
      model.trigger('error', model, convertedErrors, convertedErrors.responseJSON.errorCauses.length ? false : true);
    } else {
      model.trigger('error', model, {'responseJSON': error}, true);
    }
    this.toggleFormButtonState(false);
  },

  handleIdxSuccess: function (idxResp) {
    this.options.appState.trigger('remediationSuccess', idxResp);
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
