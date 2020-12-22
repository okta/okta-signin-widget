/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
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
import ViewFactory from '../view-builder/ViewFactory';
import IonResponseHelper from '../ion/IonResponseHelper';
import { getV1ClassName } from '../ion/ViewClassNamesFactory';

export default Controller.extend({
  className: 'form-controller',

  appStateEvents: {
    'change:currentFormName': 'handleFormNameChange',
    'afterError': 'handleAfterError',
    'invokeAction': 'handleInvokeAction',
    'saveForm': 'handleSaveForm',
    'switchForm': 'handleSwitchForm',
  },

  preRender () {
    this.removeChildren();
  },

  postRender () {
    const currentViewState = this.options.appState.getCurrentViewState();
    if (!currentViewState) {
      return;
    }

    const TheView = ViewFactory.create(
      currentViewState.name,
      this.options.appState.get('authenticatorType'),
    );
    try {
      this.formView = this.add(TheView, {
        options: {
          currentViewState,
        }
      }).last();
    } catch (error) {
      // This is the place where runtime error (NPE) happens at most of time.
      // It has been swallowed by Q.js hence add try/catch to surface up errors.
      this.options.settings.callGlobalError(error);
      return;
    }

    this.triggerAfterRenderEvent();
  },

  triggerAfterRenderEvent () {
    const contextData = this.createAfterEventContext();
    this.trigger('afterRender', contextData);
  },

  handleFormNameChange () {
    this.render();
  },

  handleAfterError (error = {}) {
    const contextData = this.createAfterEventContext();
    const errorContextData = {
      xhr: error,
      errorSummary: error.responseJSON && error.responseJSON.errorSummary,
    };
    // TODO: need some enhancement after https://github.com/okta/okta-idx-js/pull/27
    // OKTA-318062
    this.trigger('afterError', contextData, errorContextData);
  },

  createAfterEventContext () {
    const formName = this.options.appState.get('currentFormName');
    const authenticatorType = this.options.appState.get('authenticatorType');
    const methodType = this.options.appState.get('authenticatorMethodType');
    const isPasswordRecoveryFlow = this.options.appState.get('isPasswordRecoveryFlow');

    const v1ControllerClassName = getV1ClassName(
      formName,
      authenticatorType,
      methodType,
      isPasswordRecoveryFlow,
    );

    const eventData = {
      controller: v1ControllerClassName,
      formName,
    };

    if (authenticatorType) {
      eventData.authenticatorType = authenticatorType;
    }
    if (methodType && authenticatorType !== methodType) {
      eventData.methodType = methodType;
    }

    return eventData;
  },

  handleSwitchForm (formName) {
    // trigger formname change to change view
    this.options.appState.set('currentFormName', formName);
  },

  handleIdxResponse (response) {
    const { rawIdxState } = response;
    if (!IonResponseHelper.hasFormErrors(rawIdxState)) {
      this.handleIdxSuccess(response);
    } else {
      throw rawIdxState;
    }
  },

  handleInvokeAction (actionPath = '') {
    const idx = this.options.appState.get('idx');
    if (idx['neededToProceed'].find(item => item.name === actionPath)) {
      idx.proceed(actionPath, {})
        .then(this.handleIdxResponse.bind(this))
        .catch(error => {
          this.showFormErrors(this.formView.model, error);
        });
      return;
    }

    const actionFn = idx['actions'][actionPath];

    if (_.isFunction(actionFn)) {
      // TODO: OKTA-243167
      // 1. what's the approach to show spinner indicating API in fligh?
      actionFn()
        .then(this.handleIdxResponse.bind(this))
        .catch(error => {
          this.showFormErrors(this.formView.model, error);
        });
    } else {
      this.options.settings.callGlobalError(`Invalid action selected: ${actionPath}`);
      this.showFormErrors(this.formView.model, 'Invalid action selected.');
    }
  },

  handleSaveForm (model) {
    const formName = model.get('formName');

    const idx = this.options.appState.get('idx');
    if (!idx['neededToProceed'].find(item => item.name === formName)) {
      this.options.settings.callGlobalError(`Cannot find http action for "${formName}".`);
      this.showFormErrors(this.formView.model, 'Cannot find action to proceed.');
      return;
    }

    this.toggleFormButtonState(true);
    model.trigger('request');
    idx.proceed(formName, model.toJSON())
      .then(this.handleIdxResponse.bind(this))
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
      })
      .finally(() => {
        this.toggleFormButtonState(false);
      });
  },

  showFormErrors (model, error) {
    model.trigger('clearFormError');
    if (!error) {
      error = 'FormController - unknown error found';
      this.options.settings.callGlobalError(error);
    }

    if(IonResponseHelper.isIonErrorResponse(error)) {
      const convertedErrors = IonResponseHelper.convertFormErrors(error);
      const showBanner = convertedErrors.responseJSON.errorCauses.length ? false : true;
      model.trigger('error', model, convertedErrors, showBanner);
    } else if (error.errorSummary) {
      model.trigger('error', model, {responseJSON: error}, true);
    } else {
      model.trigger('error', model, {responseJSON: {errorSummary: String(error)}}, true);
    }
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
    const button = this.$el.find('.o-form-button-bar .button');
    button.toggleClass('link-button-disabled', disabled);
  },

});
