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

define([
  'okta'
],
function (Okta) {

  // Keep track of stateMachine with this special model. Similar to Appstate.js
  var _ = Okta._;

  return Okta.Model.extend({
    local: {
      baseUrl: 'string',
      remediationSuccess: 'object',
      remediationFailure: 'object',
      introspectSuccess: 'object', // only set during introspection
      introspectError: 'object', // only set during introspection
      username: 'string',
      flashError: 'object',
      beaconType: 'string',
      deviceFingerprint: 'string', // valid only once
      typingPattern: 'string',
      // Note: languageCode is special in that it is shared between Settings
      // and AppState. Settings is the *configured* language, and is static.
      // AppState is the dynamic language state - it can be changed via a
      // language picker, etc.
      languageCode: ['string', true],
      disableUsername: ['boolean', false, false],
      ionResponse: 'object',
      currentState: 'object'
    },

    derived: {
      'formName': {
        deps: ['currentState'],
        fn: function (currentState) {
          if (currentState && currentState.remediation) {
            return currentState.remediation[0].name;
          }
        }
      },
      'formSchema': {
        deps: ['currentState'],
        fn: function (currentState) {
          if (currentState && currentState.remediation) {
            return currentState.remediation[0].value;
          }
        }
      },
      'factorType': {
        deps: ['currentState'],
        fn: function (currentState) {
          if (currentState && currentState.data && currentState.data.factor) {
            return currentState.data.factor.value.factorType;
          }
        }
      },
    },

    parse: function (options) {
      this.settings = options.settings;
      return _.extend(
        _.omit(options, 'settings'),
        { languageCode: this.settings.get('languageCode' )}
      );
    }
  });

});
