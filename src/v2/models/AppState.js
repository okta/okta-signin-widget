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

import { _, Model } from 'okta';
import Logger from 'util/Logger';
import { FORMS_WITHOUT_SIGNOUT, FORMS_WITH_STATIC_BACK_LINK,
  FORMS_FOR_VERIFICATION } from '../ion/RemediationConstants';

/**
 * Keep track of stateMachine with this special model. Similar to `src/models/AppState.js`
 */
export default Model.extend({

  local: {
    introspectSuccess: 'object', // only set during introspection
    introspectError: 'object', // only set during introspection

    factor: 'object',      // optional
    user: 'object',        // optional
    currentFormName: 'string',
    idx: 'object',
    remediations: 'array',
  },

  derived: {
    authenticatorProfile: {
      // While we're moving toward `authenticator` platform, but still
      // need to support `factor` for certain period.
      // Could remove `factor` after it's deprecated completely.
      deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment', 'factor'],
      fn (currentAuthenticator = {}, currentAuthenticatorEnrollment = {}, factor = {}) {
        return currentAuthenticator.profile
          || currentAuthenticatorEnrollment.profile
          || factor.profile
          || {};
      },
    },
    authenticatorType: {
      deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment', 'factor'],
      fn (currentAuthenticator = {}, currentAuthenticatorEnrollment = {}, factor = {}) {
        return currentAuthenticator.type
          || currentAuthenticatorEnrollment.type
          || factor.factorType
          || '';
      },
    },
    authenticatorMethodType: {
      deps: ['currentAuthenticator', 'currentAuthenticatorEnrollment',],
      fn (currentAuthenticator = {}, currentAuthenticatorEnrollment = {}) {
        return currentAuthenticator.methods && currentAuthenticator.methods[0].type
          || currentAuthenticatorEnrollment.methods && currentAuthenticatorEnrollment.methods[0].type
          || '';
      },
    },
    isPasswordRecovery: {
      deps: ['recoveryAuthenticator'],
      fn: function (recoveryAuthenticator = {}) {
        return recoveryAuthenticator?.type === 'password';
      }
    }
  },

  hasRemediationObject (formName) {
    return this.get('idx').neededToProceed.find((remediation) => remediation.name === formName);
  },

  getActionByPath (actionPath) {
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

  getCurrentViewState () {
    const currentFormName = this.get('currentFormName');

    if (!currentFormName) {
      return;
    }

    // didn't expect `remediations` is empty. See `setIonResponse`.
    const currentViewState = this.get('remediations').filter(r => r.name === currentFormName)[0];

    if (!currentViewState ) {
      Logger.error('Panic!!');
      Logger.error(`\tCannot find view state for form ${currentFormName}.`);
      const allFormNames = this.get('remediations').map(r => r.name);
      Logger.error(`\tAll available form names: ${allFormNames}`);
    }

    return currentViewState;
  },

  shouldReRenderView (transformedResponse) {
    const previousRawState = this.has('idx') ? this.get('idx').rawIdxState : null;
    const identicalResponse = _.isEqual(_.omit(transformedResponse.idx.rawIdxState, 'expiresAt'),
      _.omit(previousRawState, 'expiresAt') );
    let reRender = true;

    if (identicalResponse) {
      /**
       * returns false: When new response is same as last.
       * usually happens during polling when pipeline doesn't proceed to next step.
       * expiresAt will be different for each response, hence compare objects without that property
       */
      reRender = false;
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

  // Sign Out link will be displayed in the footer of a form, unless
  // - widget config hideSignOutLinkInMFA=true or mfaOnlyFlow=true
  // and form is for identity verification (FORMS_FOR_VERIFICATION)
  // - cancel remediation form is not present in the response
  // - form is part of our list FORMS_WITHOUT_SIGNOUT
  shouldShowSignOutLinkInCurrentForm (hideSignOutLinkInMFA) {
    const idxActions = this.get('idx') && this.get('idx').actions;
    const currentFormName = this.get('currentFormName');
    const hideSignOutConfigOverride = hideSignOutLinkInMFA
      && FORMS_FOR_VERIFICATION.includes(currentFormName);

    return !hideSignOutConfigOverride
      && _.isFunction(idxActions?.cancel)
      && !FORMS_WITHOUT_SIGNOUT.includes(currentFormName);
  },

  setIonResponse (transformedResponse) {
    if (!this.shouldReRenderView(transformedResponse)){
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

    // clear appState before setting new values
    this.clear({silent: true});
    // clear cache for derived props.
    this.trigger('cache:clear');

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
