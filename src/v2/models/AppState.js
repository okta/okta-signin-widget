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
    currentFormName: 'string', // default to first form from Remediation
  },

  derived: {
    remediation: {
      deps: ['currentState'],
      fn: function (currentState = {}) {
        return Array.isArray(currentState.remediation) ? currentState.remediation : [];
      },
    },
    factorEmail: {
      deps: ['factor'],
      fn: function (factor = {}) {
        return factor.profile && factor.profile.email;
      },
    },
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
      // whenever nothing found from remediation (either wrong formName, or remediation is empty),
      // assume fall back to terminal state.
      currentViewState = this.get('currentState').terminal[0];
    }

    return currentViewState;
  },

  setIonResponse (resp) {
    if (!_.isEmpty(resp.currentState.remediation)) {
      resp.currentFormName = resp.currentState.remediation[0].name;
    } else {
      resp.currentFormName = null;
    }

    // Inject default terminal state for fall back.
    if (_.isEmpty(resp.currentState.terminal)) {
      resp.currentState.terminal = [
        {
          name: 'terminal',
          value: [],
          uiSchema: [],
        }
      ];
    }
    this.set(resp);
  },
});

// Keep track of stateMachine with this special model. Similar to Appstate.js
