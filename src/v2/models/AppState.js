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

    currentState: 'object',
    factor: 'object',      // optional
    user: 'object',        // optional
    currentFormName: 'string',
  },

  derived: {
    remediation: {
      deps: ['currentState'],
      fn (currentState = {}) {
        return Array.isArray(currentState.remediation) ? currentState.remediation : [];
      },
    },
    factorProfile: {
      deps: ['factor'],
      fn (factor = {}) {
        return factor.profile || {};
      },
    },
    factorType: {
      deps: ['factor'],
      fn (factor = {}) {
        return factor.factorType;
      },
    },
    currentStep: {
      deps: ['currentState'],
      fn: function (currentState = {}) {
        return currentState.step && currentState.step.toLowerCase();
      },
    },
    showSignoutLink: {
      deps: ['currentState'],
      fn: function (currentState = {}) {
        const invalidSignOutSteps = ['IDENTIFY', 'ENROLL', 'SUCCESS'];
        // hide signout for IDENTIFY, ENROLL & SUCCESS step
        return _.isFunction(currentState.cancel) && !invalidSignOutSteps.includes(currentState.step);
      },
    },
  },

  hasRemediationForm (formName) {
    return this.get('currentState').remediation.filter(v => v.name === formName).length === 1;
  },

  getCurrentViewState () {
    const currentFormName = this.get('currentFormName');

    let currentViewState;
    if (!_.isEmpty(this.get('remediation'))) {
      currentViewState = this.get('remediation').filter(r => r.name === currentFormName)[0];
    }

    if (!currentViewState) {
      if (currentFormName) {
        Logger.warn(`Cannot find view state for form ${currentFormName}. Fall back to terminal state.`);
      }

      currentViewState = this.get('terminal');
    }

    return currentViewState;
  },

  setIonResponse (resp) {
    // Don't re-render view if new response is same as last.
    // Usually happening at polling and pipeline doesn't proceed to next step.
    // expiresAt will be different for each response, hence compare objects without that property
    if (_.isEqual(_.omit(resp.__rawResponse, 'expiresAt'), _.omit(this.get('__rawResponse'), 'expiresAt'))) {
      return;
    }

    // `currentFormName` is default to first form of remediation object or nothing.
    resp.currentFormName = null;

    if (!_.isEmpty(resp.currentState.remediation)) {
      resp.currentFormName = resp.currentState.remediation[0].name;
    }

    // default terminal state for fall back
    if (_.isEmpty(resp.terminal)) {
      resp.terminal = {
        name: 'terminal',
        value: [],
        uiSchema: [],
      };
    }

    this.set(resp);

    // broadcast idxResponseUpdated to re-render the view
    this.trigger('idxResponseUpdated', resp);
  }

});

// Keep track of stateMachine with this special model. Similar to Appstate.js
