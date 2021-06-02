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

import { Model } from 'okta';
import Logger from 'util/Logger';
import {
  FORMS_WITHOUT_SIGNOUT,
  FORMS_WITH_STATIC_BACK_LINK,
  FORMS_FOR_VERIFICATION,
} from '../ion/RemediationConstants';
import { _ } from '../mixins/mixins';

/**
 * Keep track of stateMachine with this special model. Similar to `src/models/AppState.js`
 */
export default Model.extend({

  local: {
    introspectSuccess: 'object', // only set during introspection
    introspectError: 'object', // only set during introspection
    user: 'object',        // optional
    currentFormName: 'string',
    idx: 'object',
    remediations: 'array',
    dynamicRefreshInterval: 'number',
    deviceFingerprint: 'string',
  },

  derived: {
    authenticatorProfile: {
      deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment'],
      fn(currentAuthenticator = {}, currentAuthenticatorEnrollment = {}) {
        return currentAuthenticator.profile
          || currentAuthenticatorEnrollment.profile
          || {};
      },
    },
    authenticatorKey: {
      deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment'],
      fn(currentAuthenticator = {}, currentAuthenticatorEnrollment = {}) {
        return currentAuthenticator.key
          || currentAuthenticatorEnrollment.key
          || '';
      },
    },
    authenticatorMethodType: {
      deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment'],
      fn(currentAuthenticator = {}, currentAuthenticatorEnrollment = {}) {
        return currentAuthenticator.methods && currentAuthenticator.methods[0].type
          || currentAuthenticatorEnrollment.methods && currentAuthenticatorEnrollment.methods[0].type
          || '';
      },
    },
    isPasswordRecovery: {
      deps: ['recoveryAuthenticator'],
      fn: function(recoveryAuthenticator = {}) {
        return recoveryAuthenticator?.type === 'password';
      }
    },
  },

  isIdentifierOnlyView() {
    return !this.get('remediations')?.find(({name}) => name === 'identify')
      ?.uiSchema?.find(({name}) => name === 'credentials.passcode');
  },

  hasRemediationObject(formName) {
    return this.get('idx').neededToProceed.find((remediation) => remediation.name === formName);
  },

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
  },

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
  },

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
  },

  /**
   * Checks to see if we're in an authenticator challenge flow.
   * @returns {boolean}
   */
  isAuthenticatorChallenge() {
    const currentFormName = this.get('currentFormName');
    return FORMS_FOR_VERIFICATION.includes(currentFormName);
  },

  shouldReRenderView(transformedResponse) {
    const previousRawState = this.has('idx') ? this.get('idx').rawIdxState : null;

    const identicalResponse = _.isEqual(
      _.nestedOmit(transformedResponse.idx.rawIdxState, ['expiresAt', 'refresh', 'stateHandle']),
      _.nestedOmit(previousRawState, ['expiresAt', 'refresh', 'stateHandle']));
    const isSameRefreshInterval = _.isEqual(
      _.nestedOmit(transformedResponse.idx.rawIdxState, ['expiresAt', 'stateHandle']),
      _.nestedOmit(previousRawState, ['expiresAt', 'stateHandle']));

    if (identicalResponse && !isSameRefreshInterval) {
      this.set('dynamicRefreshInterval', this.getRefreshInterval(transformedResponse));
    }

    let reRender = true;

    if (identicalResponse) {
      /**
       * returns false: When new response is same as last.
       * usually happens during polling when pipeline doesn't proceed to next step.
       * expiresAt will be different for each response, hence compare objects without that property
       */
      reRender = false;
    }

    if (identicalResponse && this.get('currentFormName') === 'poll') {
      /**
       * returns true: We want to force reRender when currentForm is poll because request has to reinitiate
       * based on new refresh and UI has to reflect new timer.
       * We dont technical poll here we just make a request after the specified refresh time each time
       * we get a new response.
       */
      reRender = true;
    }

    if (identicalResponse && FORMS_WITH_STATIC_BACK_LINK.includes(this.get('currentFormName'))) {
      /**
       * returns true: We want to force reRender if you go back to selection screen from challenge or enroll screen
       * and re-select the same authenticator for challenge. In this case also new response will be identical
       * to the old response.
       */
      reRender = true;
    }
    return reRender;
  },

  getRefreshInterval(transformedResponse) {
    // Only polling refresh interval has changed in the response,
    // make sure to update the correct poll view's refresh value
    const currentFormName = this.get('currentFormName');
    const currentViewState = transformedResponse.remediations.filter(r => r.name === currentFormName)[0];
    // Get new refresh interval for either: remediations, authenticator, or authenticator enrollment
    return currentViewState.refresh ||
      transformedResponse.currentAuthenticatorEnrollment?.poll?.refresh ||
      transformedResponse.currentAuthenticator?.poll?.refresh;
  },

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
  },

  containsMessageWithI18nKey(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }
    const messagesObjs = this.get('messages');
    return messagesObjs && Array.isArray(messagesObjs.value)
      && messagesObjs.value.some(messagesObj => _.contains(keys, messagesObj.i18n?.key));
  },

  containsMessageStartingWithI18nKey(keySubStr) {
    const messagesObjs = this.get('messages');
    return messagesObjs && Array.isArray(messagesObjs.value)
      && messagesObjs.value.some(messagesObj => messagesObj.i18n?.key.startsWith(keySubStr));
  },

  clearAppStateCache() {
    // clear appState before setting new values
    this.clear({ silent: true });
    // clear cache for derived props.
    this.trigger('cache:clear');
  },

  setIonResponse(transformedResponse) {
    if (!this.shouldReRenderView(transformedResponse)) {
      return;
    }

    // `currentFormName` is default to first form of remediations or nothing.
    let currentFormName = null;
    if (!_.isEmpty(transformedResponse.remediations)) {
      currentFormName = transformedResponse.remediations[0].name;
    } else {
      Logger.error('Panic!!');
      Logger.error('\tNo remediation found.');
      Logger.error('\tHere is the entire response');
      Logger.error(JSON.stringify(transformedResponse, null, 2));
    }

    this.clearAppStateCache();

    // set new app state properties
    this.set(transformedResponse);

    // make sure change `currentFormName` is last step.
    // change `currentFormName` will re-render FormController,
    // which may depend on other derived properties hence
    // those derived properties must be re-computed before
    // re-rendering controller.
    this.set({ currentFormName });
  }

});
