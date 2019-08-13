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

export default Model.extend({

  local: {
    introspectSuccess: 'object', // only set during introspection
    introspectError: 'object', // only set during introspection

    currentState: 'object',
    factor: 'object',      // optional
    user: 'object',        // optional
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
    isTerminalState: {
      deps: ['terminal'],
      fn: function (terminal) {
        return !_.isEmpty(terminal);
      },
    },
  },

  getCurrentViewState () {
    if (!_.isEmpty(this.get('remediation'))) {
      return this.get('remediation')[0];
    } else if (!_.isEmpty(this.get('terminal'))) {
      return this.get('terminal');
    } else {
      return {
        name: 'terminal'
      };
    }
  },

  setIonResponse (resp) {
    // Don't re-render view if new response is same as last.
    // Usually happening at polling use case when `state` is not updated yet.
    if (_.isEqual(resp.__rawResponse, this.get('__rawResponse'))) {
      return;
    }
    this.set(resp);
  }

});

// Keep track of stateMachine with this special model. Similar to Appstate.js
