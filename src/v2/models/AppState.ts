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

import { Model, ModelProperty } from '@okta/courage';
import Logger from 'util/Logger';
import {
  FORMS_WITHOUT_SIGNOUT,
  FORMS_WITH_STATIC_BACK_LINK,
  FORMS_FOR_VERIFICATION,
  AUTHENTICATOR_KEY,
  FORMS,
} from '../ion/RemediationConstants';
import { createOVOptions } from '../ion/ui-schema/ion-object-handler';
import { _ } from '../mixins/mixins';
import { executeHooksBefore, executeHooksAfter } from 'util/Hooks';
import Settings from 'models/Settings';
import Hooks from 'models/Hooks';
import { RecoverableError } from 'util/OAuthErrors';
import { IdxRemediation } from '@okta/okta-auth-js';
import BrowserFeatures from 'util/BrowserFeatures';

const UNKNOWN_USER_I8N_KEY = "idx.unknown.user";
/**
 * Keep track of stateMachine with this special model. Similar to `src/models/AppState.js`
 */

const local: Record<string, ModelProperty> = {
  user: 'object',        // optional
  currentFormName: 'string',
  lastIdentifier: 'string',
  idx: 'object',
  remediations: 'array',
  dynamicRefreshInterval: 'number',
  deviceFingerprint: 'string',
  hooks: 'object' // instance of models/Hooks
};

const derived: Record<string, ModelProperty> = {
  authenticatorProfile: {
    deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment'],
    fn(currentAuthenticator = { profile: undefined }, currentAuthenticatorEnrollment = { profile: undefined }) {
      return currentAuthenticator.profile
        || currentAuthenticatorEnrollment.profile
        || {};
    },
  },
  authenticatorKey: {
    deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment'],
    fn(currentAuthenticator = { key: undefined }, currentAuthenticatorEnrollment = { key: undefined }) {
      return currentAuthenticator.key
        || currentAuthenticatorEnrollment.key
        || '';
    },
  },
  authenticatorMethodType: {
    deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment'],
    fn(currentAuthenticator = { methods: undefined }, currentAuthenticatorEnrollment = { methods: undefined }) {
      return currentAuthenticator.methods && currentAuthenticator.methods[0].type
        || currentAuthenticatorEnrollment.methods && currentAuthenticatorEnrollment.methods[0].type
        || '';
    },
  },
  isPasswordRecovery: {
    deps: ['recoveryAuthenticator'],
    fn: function(recoveryAuthenticator = { type: undefined }) {
      return recoveryAuthenticator?.type === 'password';
    }
  }
};

export type AppStateProps = typeof local & typeof derived;

export default class AppState extends Model {
  settings: Settings;
  hooks: Hooks;
  
  constructor(attributes, options) {
    super(attributes, options);
    this.settings = options.settings;
    this.hooks = options.hooks;
  }

  get<A extends Backbone._StringKey<AppStateProps>>(attributeName: A): any {
    return Model.prototype.get.call(this, attributeName);
  }

  preinitialize(...args) {
    this.local = local;
    this.derived = derived;
    Model.prototype.preinitialize.apply(this, args);
  }

  isIdentifierOnlyView() {
    return !this.get('remediations')?.find(({ name }) => name === 'identify')
      ?.uiSchema?.find(({ name }) => name === 'credentials.passcode');
  }

  hasRemediationObject(formName) {
    return this.get('idx').neededToProceed.find((remediation) => remediation.name === formName);
  }

  hasActionObject(actionName) {
    return !!this.get('idx')?.actions?.[actionName];
  }

  getRemediationAuthenticationOptions(formName) {
    const form = this.hasRemediationObject(formName);
    if (!form) {
      return [];
    }
    const authenticator = form.value.find((value) => value.name === 'authenticator');
    let authenticatorOptions = authenticator?.options || [];
    // OV is a special case, so process OV options
    authenticatorOptions = [...authenticatorOptions]; //clone it since we are changing it for OV
    createOVOptions(authenticatorOptions);
    return authenticatorOptions;
  }

  getActionByPath(actionPath) {
    const paths = actionPath.split('.');
    let targetObject;
    if (paths.length === 1) {
      targetObject = this.get('idx').actions;
    } else {
      targetObject = this.get(paths.shift());
    }
    // Limitation
    // At the time of writting, action only lives in first level of state objects.
    const actionName = paths.shift();
    if (targetObject && _.isFunction(targetObject[actionName])) {
      return targetObject[actionName];
    } else {
      return null;
    }
  }

  getCurrentViewState() {
    const currentFormName = this.get('currentFormName');

    if (!currentFormName) {
      return;
    }

    // didn't expect `remediations` is empty. See `setIonResponse`.
    const currentViewState = this.get('remediations').filter(r => r.name === currentFormName)[0];

    if (!currentViewState) {
      Logger.error('Panic!!');
      Logger.error(`\tCannot find view state for form ${currentFormName}.`);
      const allFormNames = this.get('remediations').map(r => r.name);
      Logger.error(`\tAll available form names: ${allFormNames}`);
    }

    return currentViewState;
  }

  /**
   * Returns ui schema of the form field from current view state
   * @param {string} fieldName
   * @returns {}
   */
  getSchemaByName(fieldName) {
    const currentViewState = this.getCurrentViewState();
    if(currentViewState) {
      const uiSchema = currentViewState.uiSchema;
      return uiSchema.find(({ name }) => name === fieldName);
    }
  }

  /**
   * Returns the displayName of the authenticator
   * @returns {string}
   */
  getAuthenticatorDisplayName() {
    const currentAuthenticator = this.get('currentAuthenticator') || {};
    const currentAuthenticatorEnrollment = this.get('currentAuthenticatorEnrollment') || {};

    // For enrollment and certain verification flows, the currentAuthenticator object will be present.
    // If not, we're likely in a traditional verify/challenge flow.
    return currentAuthenticator.displayName || currentAuthenticatorEnrollment.displayName;
  }

  /**
   * Checks to see if we're in an authenticator challenge flow.
   * @returns {boolean}
   */
  isAuthenticatorChallenge() {
    const currentFormName = this.get('currentFormName');
    return FORMS_FOR_VERIFICATION.includes(currentFormName);
  }

  shouldReRenderView(transformedResponse) {
    if (transformedResponse?.idx?.hasFormError) {
      return false;
    }

    const previousRawState = this.has('idx') ? this.get('idx').rawIdxState : null;

    const identicalResponse = _.isEqual(
      _.nestedOmit(transformedResponse.idx.rawIdxState, ['expiresAt', 'refresh', 'stateHandle', 'headers']),
      _.nestedOmit(previousRawState, ['expiresAt', 'refresh', 'stateHandle', 'headers']));

    if (identicalResponse) {
      this.set('dynamicRefreshInterval', this.getRefreshInterval(transformedResponse));
    }

    return this._isReRenderRequired(identicalResponse, transformedResponse, previousRawState);
  }

  getRefreshInterval(transformedResponse) {
    // Only polling refresh interval has changed in the response,
    // make sure to update the correct poll view's refresh value
    const currentFormName = this.get('currentFormName');
    const currentViewState = transformedResponse.remediations.filter(r => r.name === currentFormName)[0];
    // Get new refresh interval for either: remediations, authenticator, or authenticator enrollment
    return currentViewState.refresh ||
      transformedResponse.currentAuthenticatorEnrollment?.poll?.refresh ||
      transformedResponse.currentAuthenticator?.poll?.refresh;
  }

  // Sign Out link will be displayed in the footer of a form, unless:
  // - widget configuration set hideSignOutLinkInMFA or mfaOnlyFlow to true
  // - cancel remediation form is not present in the response
  // - form is part of our list FORMS_WITHOUT_SIGNOUT
  shouldShowSignOutLinkInCurrentForm(hideSignOutLinkInMFA) {
    const idxActions = this.get('idx') && this.get('idx').actions;
    const currentFormName = this.get('currentFormName');

    return !hideSignOutLinkInMFA
      && _.isFunction(idxActions?.cancel)
      && !FORMS_WITHOUT_SIGNOUT.includes(currentFormName);
  }

  containsMessageWithI18nKey(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }
    const messagesObjs = this.get('messages');
    return messagesObjs && Array.isArray(messagesObjs.value)
      && messagesObjs.value.some(messagesObj => _.contains(keys, messagesObj.i18n?.key));
  }

  containsMessageStartingWithI18nKey(keySubStr) {
    const messagesObjs = this.get('messages');
    return messagesObjs && Array.isArray(messagesObjs.value)
      && messagesObjs.value.some(messagesObj => messagesObj.i18n?.key.startsWith(keySubStr));
  }

  clearAppStateCache() {
    // clear appState before setting new values
    const attrs = {};
    for (const key in this.attributes) {
      if (key !== 'currentFormName' && key !== 'lastIdentifier') {
        attrs[key] = void 0;
      }
    }
    this.set(attrs, Object.assign({}, { unset: true, silent: true }));
    // clear cache for derived props.
    this.trigger('cache:clear');
  }

  chooseRemediation(transformedResponse): IdxRemediation | undefined {
    if (_.isEmpty(transformedResponse.remediations)) {
      return;
    }

    const firstRemediation = transformedResponse.remediations[0];

    // Special case: Okta Verify: show select enrollment channel instead of QR code on mobile
    if (firstRemediation.name === 'enroll-poll'
      && this.get('authenticatorKey') === AUTHENTICATOR_KEY.OV
      && (BrowserFeatures.isAndroid() || BrowserFeatures.isIOS())
      && transformedResponse.currentAuthenticator?.contextualData?.selectedChannel === 'qrcode'
    ) {
        return transformedResponse.remediations.find(r => r.name === 'select-enrollment-channel')
    }

    // Default case: return the first remediation in the list
    return firstRemediation;
  }

  async setIonResponse(transformedResponse) {
    const doRerender = this.shouldReRenderView(transformedResponse);
    this.clearAppStateCache();
    // set new app state properties
    this.set(transformedResponse);

    if (doRerender) {
      const remediation = this.chooseRemediation(transformedResponse);
      let currentFormName = null;
      if (remediation) {
        currentFormName = remediation.name;
      } else {
        Logger.error('Panic!!');
        Logger.error('\tNo remediation found.');
        Logger.error('\tHere is the entire response');
        Logger.error(JSON.stringify(transformedResponse, null, 2));
      }

      const hook = this.hooks?.getHook(currentFormName); // may be undefined
      await executeHooksBefore(hook);
  
      this.unset('currentFormName', { silent: true });
      // make sure change `currentFormName` is last step.
      // change `currentFormName` will re-render FormController,
      // which may depend on other derived properties hence
      // those derived properties must be re-computed before
      // re-rendering controller.
      this.set({ currentFormName });

      await executeHooksAfter(hook);
    }
  }

  setNonIdxError(error: RecoverableError<any>) {
    this.set('remediations', [{ name: FORMS.TERMINAL }]);
    this.set('messages', { value: [
      {
        message: error.errorDetails.errorSummary,
        class: 'ERROR'
      }
    ]})
    this.set('currentFormName', FORMS.TERMINAL);
  }

  getUser() {
    return this.get('user');
  }

  _isReRenderRequired(identicalResponse, transformedResponse, previousRawState) {
    let reRender = true;

    const isPreviousStateError = this.get('idx')?.hasFormError;
    if (isPreviousStateError && this._isChallengeAuthenticatorPoll(transformedResponse, previousRawState)) {
      reRender = false;
    }

    if (identicalResponse) {
      /**
       * returns false: When new response is same as last.
       * usually happens during polling when pipeline doesn't proceed to next step.
       * expiresAt will be different for each response, hence compare objects without that property
       */
      reRender = false;
      if (this.get('currentFormName') === 'poll') {
        /**
         * returns true: We want to force reRender when currentForm is poll because request has to reinitiate
         * based on new refresh and UI has to reflect new timer.
         * We dont technical poll here we just make a request after the specified refresh time each time
         * we get a new response.
         */
        reRender = true;
      } else if (FORMS_WITH_STATIC_BACK_LINK.includes(this.get('currentFormName'))) {
        /**
         * returns true: We want to force reRender if you go back to selection screen from challenge or enroll screen
         * and re-select the same authenticator for challenge. In this case also new response will be identical
         * to the old response.
         */
        reRender = true;
      } else if (this.containsMessageWithI18nKey(UNKNOWN_USER_I8N_KEY)) {
        /**
         * Need to re-render or else form will be stuck in saving mode.
         * This message is a form warning that can result in identical responses if the user enters the same
         * username as the one in the last message warning.
         */
        reRender = true;
      }
    }

    return reRender;
  }

  /**
   * This is to account for the edge case introduced by this issue: OKTA-419210. With the current idx remediations,
   * there's no good way to generalize this as the backend handles the authenticators for phone, sms and 
   * email differently. Although not ideal, we have to keep this check in for now until we find a better solution.
   */
  _isChallengeAuthenticatorPoll(transformedResponse, previousRawState) {
    const isSameExceptMessages = _.isEqual(
      _.nestedOmit(transformedResponse.idx.rawIdxState, ['expiresAt', 'refresh', 'stateHandle', 'headers']),
      _.nestedOmit(previousRawState, ['expiresAt', 'refresh', 'stateHandle', 'messages', 'headers']));

    const isChallengeAuthenticator = this.get('currentFormName') === 'challenge-authenticator';
    const isCurrentAuthenticatorEmail = this.get('currentAuthenticatorEnrollment')?.key === AUTHENTICATOR_KEY.EMAIL;

    return isSameExceptMessages && isChallengeAuthenticator && isCurrentAuthenticatorEmail;
  }
}
