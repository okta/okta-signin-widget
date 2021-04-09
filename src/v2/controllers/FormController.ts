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
import { _, Controller, loc } from 'okta';
import ViewFactory from '../view-builder/ViewFactory';
import IonResponseHelper from '../ion/IonResponseHelper';
import { getV1ClassName } from '../ion/ViewClassNamesFactory';
import { FORMS, TERMINAL_FORMS, FORM_NAME_TO_OPERATION_MAP } from '../ion/RemediationConstants';
import Util from '../../util/Util';
import sessionStorageHelper from '../client/sessionStorageHelper';
import { HttpResponse } from '@okta/okta-auth-js';

export interface ContextData {
  controller: string;
  formName: string;
  authenticatorKey?: string;
  methodType?: string;
}

export interface ErrorContextData {
  xhr: HttpResponse;
  errorSummary?: string;
}

export default Controller.extend({
  className: 'form-controller',

  appStateEvents: {
    'change:currentFormName': 'handleFormNameChange',
    'afterError': 'handleAfterError',
    'invokeAction': 'handleInvokeAction',
    'saveForm': 'handleSaveForm',
    'switchForm': 'handleSwitchForm',
  },

  preRender() {
    this.removeChildren();
  },

  postRender() {
    const currentViewState = this.options.appState.getCurrentViewState();
    // TODO: add comments regarding when `currentViewState` would be null?
    if (!currentViewState) {
      return;
    }

    this.clearMetadata();

    const TheView = ViewFactory.create(
      currentViewState.name,
      this.options.appState.get('authenticatorKey'),
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

  clearMetadata() {
    const formName = this.options.appState.get('currentFormName');
    // TODO: OKTA-392835 shall not clear state handle at terminal page
    if (TERMINAL_FORMS.includes(formName)) {
      sessionStorageHelper.removeStateHandle();
    }
  },

  triggerAfterRenderEvent() {
    const contextData = this.createAfterEventContext();
    this.trigger('afterRender', contextData);
  },

  handleFormNameChange() {
    this.render();
  },

  handleAfterError(error: HttpResponse) {
    const contextData = this.createAfterEventContext();
    const errorContextData: ErrorContextData = {
      xhr: error,
      errorSummary: error.responseJSON && error.responseJSON.errorSummary,
    };
    // TODO: need some enhancement after https://github.com/okta/okta-idx-js/pull/27
    // OKTA-318062
    this.trigger('afterError', contextData, errorContextData);
  },

  createAfterEventContext(): ContextData {
    const formName = this.options.appState.get('currentFormName');
    const authenticatorKey = this.options.appState.get('authenticatorKey');
    const methodType = this.options.appState.get('authenticatorMethodType');
    const isPasswordRecoveryFlow = this.options.appState.get('isPasswordRecoveryFlow');

    const v1ControllerClassName = getV1ClassName(
      formName,
      authenticatorKey,
      methodType,
      isPasswordRecoveryFlow,
    );

    const eventData: ContextData = {
      controller: v1ControllerClassName,
      formName,
    };

    if (authenticatorKey) {
      eventData.authenticatorKey = authenticatorKey;
    }
    if (methodType) {
      eventData.methodType = methodType;
    }

    return eventData;
  },

  handleSwitchForm(formName) {
    // trigger formName change to change view
    if (this.options.appState.get('messages')) {
      // Clear messages before calling switch form.
      // If a form has errors sent form API inside messages
      // and user hits back to factors list which triggers switchForm,
      // those error will show up on another screen that gets rendered after switchForm
      this.options.appState.unset('messages');
    }
    this.options.appState.set('currentFormName', formName);
  },

  handleInvokeAction(actionPath = '', actionParams = {}) {
    const idx = this.options.appState.get('idx');

    if (actionPath === 'cancel') {
      this.options.settings.getAuthClient().idx.clearTransactionMeta();
      sessionStorageHelper.removeStateHandle();
      this.options.appState.clearAppStateCache();
    }

    if (idx['neededToProceed'].find(item => item.name === actionPath)) {
      idx.proceed(actionPath, {})
        .then(this.handleIdxResponse.bind(this))
        .catch(error => {
          this.showFormErrors(this.formView.model, error, this.formView.form);
        });
      return;
    }

    const actionFn = idx['actions'][actionPath];

    if (_.isFunction(actionFn)) {
      // TODO: OKTA-243167 what's the approach to show spinner indicating API in flight?
      actionFn(actionParams)
        .then((resp) => {
          if (actionPath === 'cancel' && this.options.settings.get('useInteractionCodeFlow')) {
            // In this case we need to restart login flow and recreate transaction meta
            // that will be used in interactionCodeFlow function
            this.options.appState.trigger('restartLoginFlow');
          } else {
            this.handleIdxResponse(resp);
          }
        })
        .catch(error => {
          this.showFormErrors(this.formView.model, error, this.formView.form);
        });
    } else {
      this.options.settings.callGlobalError(`Invalid action selected: ${actionPath}`);
      this.showFormErrors(this.formView.model, 'Invalid action selected.', this.formView.form);
    }
  },

  handleSaveForm(model) {
    const formName = model.get('formName');

    // Toggle Form saving status (e.g. disabling save button, etc)
    this.toggleFormButtonState(true);
    model.trigger('request');

    // Use full page redirection if necessary
    if (model.get('useRedirect')) {
      // Clear when navigates away from SIW page, e.g. success, IdP Authenticator.
      // Because SIW sort of finished its current /transaction/
      sessionStorageHelper.removeStateHandle();

      const currentViewState = this.options.appState.getCurrentViewState();
      Util.redirectWithFormGet(currentViewState.href);
      return;
    }

    // Run hook: transform the user name (a.k.a identifier)
    const modelJSON = this.transformIdentifier(formName, model);

    // Error out when this is not a remediation form. Unexpected Exception.
    const idx = this.options.appState.get('idx');
    if (!this.options.appState.hasRemediationObject(formName)) {
      this.options.settings.callGlobalError(`Cannot find http action for "${formName}".`);
      this.showFormErrors(this.formView.model, 'Cannot find action to proceed.', this.formView.form);
      return;
    }

    // Submit request to idx endpoint
    idx.proceed(formName, modelJSON)
      .then((resp) => {
        const onSuccess = this.handleIdxResponse.bind(this, resp);

        if (formName === FORMS.ENROLL_PROFILE) {
          // call registration (aka enroll profile) hook
          this.settings.postRegistrationSubmit(modelJSON?.userProfile?.email, onSuccess, (error) => {
            model.trigger('error', model, {
              responseJSON: error,
            });
          });
        } else {
          onSuccess();
        }
      }).catch(error => {
        if (error.stepUp) {
          // Okta server responds 401 status code with WWW-Authenticate header and new remediation
          // so that the iOS/MacOS credential SSO extension (Okta Verify) can intercept
          // the response reaches here when Okta Verify is not installed
          // we need to return an idx object so that
          // the SIW can proceed to the next step without showing error
          this.handleIdxResponse(error);
        } else {
          this.showFormErrors(model, error, this.formView.form);
        }
      })
      .finally(() => {
        this.toggleFormButtonState(false);
      });
  },

  transformIdentifier(formName, model) {
    const modelJSON = model.toJSON();
    if (Object.prototype.hasOwnProperty.call(modelJSON, 'identifier')) {
      // The callback function is passed two arguments:
      // 1) username: The name entered by the user
      // 2) operation: The type of operation the user is trying to perform:
      //      - PRIMARY_AUTH
      //      - FORGOT_PASSWORD
      //      - UNLOCK_ACCOUNT
      const operation = FORM_NAME_TO_OPERATION_MAP[formName];
      modelJSON.identifier = this.settings.transformUsername(modelJSON.identifier, operation);
    }
    return modelJSON;
  },

  /**
   * @param model current form model
   * @param error any errors after user action
   * @param form current form
   * Handle errors that get displayed right after any user action. After such form errors widget doesn't
   * reload or re-render, but updates the AppSate with latest remediation.
   */
  showFormErrors(model, error, form) {
    /* eslint max-statements: [2, 22] */
    let errorObj;
    let idxStateError;
    let showErrorBanner = true;
    model.trigger('clearFormError');
    
    if (!error) {
      error = 'FormController - unknown error found';
      this.options.settings.callGlobalError(error);
    }

    if(error?.rawIdxState) {
      idxStateError = error;
      error = error.rawIdxState;
    }

    if (IonResponseHelper.isIonErrorResponse(error)) {
      errorObj = IonResponseHelper.convertFormErrors(error);
    } else if (error.errorSummary) {
      errorObj = { responseJSON: error };
    } else {
      Util.logConsoleError(error);
      errorObj = { responseJSON: { errorSummary: loc('error.unsupported.response', 'login')}};
    }

    if(_.isFunction(form?.showCustomFormErrorCallout)) {
      showErrorBanner = !form.showCustomFormErrorCallout(errorObj);
    }

    // show error before updating app state.
    model.trigger('error', model, errorObj, showErrorBanner);
    idxStateError = Object.assign({}, idxStateError, {hasFormError: true});

    // TODO OKTA-408410: Widget should update the state on every new response. It should NOT do selective update.
    // For eg 429 rate-limit errors, we have to skip updating idx state, because error response is not an idx response.
    if (Array.isArray(idxStateError?.neededToProceed) && idxStateError?.neededToProceed.length) {
      this.handleIdxResponse(idxStateError);
    }
  },

  handleIdxResponse: function(idxResp) {
    this.options.appState.trigger('updateAppState', idxResp);
  },

  /**
   * SignIn widget has its own (hacky) way to customize the button disabled state:
   * adding `link-button-disabled` despite the name was intend only to disable
   * `link-button`.
   * Instead of doing decent refactor, we want to follow the convention for now.
   *
   * @param {boolean} disabled whether add extra disable CSS class.
   */
  toggleFormButtonState: function(disabled) {
    const button = this.$el.find('.o-form-button-bar .button');
    button.toggleClass('link-button-disabled', disabled);
  },
});
