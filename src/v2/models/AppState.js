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

import { _, Model } from 'okta';
import Logger from 'util/Logger';

export default Model.extend({

  local: {
    introspectSuccess: 'object', // only set during introspection
    introspectError: 'object', // only set during introspection

    factor: 'object',      // optional
    user: 'object',        // optional
    currentFormName: 'string',
    idx: 'object',
    remediations: 'array',
    __previousResponse: 'object'
  },

  derived: {
    authenticatorProfile: {
      // While we're moving toward `authenticator` platform, but still
      // need to support `factor` for certain period.
      // Could remove `factor` after it's deprecated completely.
      deps: ['currentAuthenticator', 'authenticatorEnrollment', 'factor'],
      fn (currentAuthenticator = {}, authenticatorEnrollment = {}, factor = {}) {
        return currentAuthenticator.profile
          || authenticatorEnrollment.profile
          || factor.profile
          || {};
      },
    },
    authenticatorType: {
      deps: ['currentAuthenticator', 'authenticatorEnrollment', 'factor'],
      fn (currentAuthenticator = {}, authenticatorEnrollment = {}, factor = {}) {
        return currentAuthenticator.type
          || authenticatorEnrollment.type
          || factor.factorType
          || '';
      },
    },
    showSignoutLink: {
      deps: ['idx'],
      fn: function (idx = {}) {
        const invalidSignOutSteps = ['IDENTIFY', 'ENROLL', 'SUCCESS'];
        // hide signout for IDENTIFY, ENROLL & SUCCESS step
        return idx.actions
          && _.isFunction(idx.actions.cancel) && !invalidSignOutSteps.includes(idx.context.step);
      },
    },
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

    let currentViewState;
    if (!_.isEmpty(this.get('remediations'))) {
      currentViewState = this.get('remediations').filter(r => r.name === currentFormName)[0];
    }

    if (!currentViewState) {
      if (currentFormName) {
        Logger.warn(`Cannot find view state for form ${currentFormName}. Fall back to terminal state.`);
      }

      currentViewState = this.get('terminal');
    }

    return currentViewState;
  },

  setIonResponse (idxResp) {
    // Don't re-render view if new response is same as last.
    // Usually happening at polling and pipeline doesn't proceed to next step.
    // expiresAt will be different for each response, hence compare objects without that property
    if (_.isEqual(_.omit(idxResp.rawIdxState, 'expiresAt'), _.omit(this.get('__previousResponse'), 'expiresAt'))) {
      return;
    }

    // `currentFormName` is default to first form of remediation object or nothing.
    idxResp.currentFormName = null;

    if (idxResp.neededToProceed && idxResp.rawIdxState.remediation) {
      idxResp.currentFormName = idxResp.rawIdxState.remediation.value[0].name;
    }

    if (idxResp.rawIdxState.success) {
      idxResp.currentFormName = idxResp.rawIdxState.success.name;
    }

    // default terminal state for fall back
    //TODO: This is a FailSafe, it needs to be removed later by this Jira: OKTA-300044
    if (idxResp.context.terminal && _.isEmpty(idxResp.context.terminal.value)) {
      idxResp.terminal = {
        name: 'terminal',
        value: [],
        uiSchema: [],
      };
    }

    // default terminal state for fall back
    if (idxResp.context.messages) {
      idxResp.terminal = {
        name: 'terminal',
        value: idxResp.context.messages.value.length ? idxResp.context.messages.value : [],
        uiSchema: [],
      };
    }
    //clear appState before setting new values
    this.clear({silent: true});
    // set new app state properties
    this.set(idxResp);
    // reset idx
    this.set('idx', idxResp);
    this.set('__previousResponse', idxResp.rawIdxState);

    // broadcast idxResponseUpdated to re-render the view
    this.trigger('idxResponseUpdated', idxResp);
  }

});

// Keep track of stateMachine with this special model. Similar to Appstate.js
