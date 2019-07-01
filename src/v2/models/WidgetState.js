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

    initialize: function (){
      // add listeners
      var setRemediationHandler = _.bind(function (transaction) {
        this.set('remediationSuccess', transaction);
      }, this);
      var remediationErrorHandler = _.bind(function (err) {
        this.set('remediationFailure', err);
      }, this);

      // Events to set the remediation attributes on the widget state.
      this.listenTo(this, 'setRemediationSuccess', setRemediationHandler);
      this.listenTo(this, 'setRemediationFailure', remediationErrorHandler);

    },

    local: {
      baseUrl: 'string',
      lastAuthResponse: ['object', true, {}],
      remediationSuccess: 'object',
      remediationFailure: 'object',
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
    },

    setAuthResponse: function (res) {
      // TODO set WidgetState.policy based on API response
      // TODO set WidgetState.factors based on API response
      this.set('lastAuthResponse', res);
    },

    derived: {
      'isSuccessResponse': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'SUCCESS';
        }
      },
      'remediation': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (res && res.remediation) {
            return res.remediation;
          }
        }
      },
      'formSchema': {
        deps: ['remediation'],
        fn: function (remediation) {
          if (remediation && remediation[0]) {
            return remediation[0].value;
          }
        }
      },
      'uiSchema': {
        deps: ['remediation'],
        fn: function (remediation) {
          if (remediation && remediation[0]) {
            return remediation[0].uiSchema;
          }
        }
      },
      'isFactorRequired': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'FACTOR_REQUIRED';
        }
      },
      'isProfileRequired': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'PROFILE_REQUIRED';
        }
      },
      'isFactorEnroll': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'FACTOR_ENROLL';
        }
      },
      'isFactorChallenge': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'FACTOR_CHALLENGE';
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
