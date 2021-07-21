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
import { FORMS, TERMINAL_FORMS, FORM_NAME_TO_OPERATION_MAP } from '../ion/RemediationConstants';
import Util from '../../util/Util';
import sessionStorageHelper from '../client/sessionStorageHelper';
import { clearTransactionMeta } from '../client';

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

  handleAfterError(error = {}) {
    const contextData = this.createAfterEventContext();
    const errorContextData = {
      xhr: error,
      errorSummary: error.responseJSON && error.responseJSON.errorSummary,
    };
    // TODO: need some enhancement after https://github.com/okta/okta-idx-js/pull/27
    // OKTA-318062
    this.trigger('afterError', contextData, errorContextData);
  },

  createAfterEventContext() {
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

    const eventData = {
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

  handleInvokeAction(actionPath = '') {
    const idx = this.options.appState.get('idx');

    if (actionPath === 'cancel') {
      clearTransactionMeta(this.options.settings);
      sessionStorageHelper.removeStateHandle();
      this.options.appState.clearAppStateCache();
    }

    if (idx['neededToProceed'].find(item => item.name === actionPath)) {
      idx.proceed(actionPath, {})
        .then(this.handleIdxSuccess.bind(this))
        .catch(error => {
          this.showFormErrors(this.formView.model, error);
        });
      return;
    }

    const actionFn = idx['actions'][actionPath];

    if (_.isFunction(actionFn)) {
      // TODO: OKTA-243167 what's the approach to show spinner indicating API in flight?
      actionFn()
        .then(this.handleIdxSuccess.bind(this))
        .catch(error => {
          this.showFormErrors(this.formView.model, error);
        });
    } else {
      this.options.settings.callGlobalError(`Invalid action selected: ${actionPath}`);
      this.showFormErrors(this.formView.model, 'Invalid action selected.');
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
      this.showFormErrors(this.formView.model, 'Cannot find action to proceed.');
      return;
    }

    // Submit request to idx endpoint
    idx.proceed(formName, modelJSON)
      .then((resp) => {
        const onSuccess = this.handleIdxSuccess.bind(this, resp);

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

  showFormErrors(model, error) {
    model.trigger('clearFormError');
    if (!error) {
      error = 'FormController - unknown error found';
      this.options.settings.callGlobalError(error);
    }
    let errorObj;
    if (IonResponseHelper.isIonErrorResponse(error)) {
      errorObj = IonResponseHelper.convertFormErrors(error);
    } else if (error.errorSummary) {
      errorObj = { responseJSON: error };
    }
    model.trigger('error', model, errorObj || { responseJSON: { errorSummary: String(error) } }, true);
  },

  handleIdxSuccess: function(idxResp) {
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
  toggleFormButtonState: function(disabled) {
    const button = this.$el.find('.o-form-button-bar .button');
    button.toggleClass('link-button-disabled', disabled);
  },

});
