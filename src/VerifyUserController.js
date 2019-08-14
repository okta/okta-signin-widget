/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'okta',
  'util/FormController',
  'util/RouterUtil'
], function (Okta, FormController, RouterUtil) {

  const $ = Okta.$;
  const _ = Okta._;

  return FormController.extend({
    className: 'device-posture',

    Model: {},

    Form: {
      noButtonBar: true,
    },
  
    initialize: function () {

      $.post({
        url: `https://rain.okta1.com/api/v1/authn/factors/${this.options.appState.get('factors').getDefaultFactor().get('id')}/verify`,
        data: JSON.stringify({
          stateToken: this.options.appState.get('transaction').data.stateToken
        }),
        contentType: 'application/json'
      })
      .done(() => {
        return $.ajax({
          // mock
          // url: `/loopback/41236`,
          // // POC
          url: 'http://localhost:41236',
          method: 'POST',
          data: {
            requestType: 'deviceChallenge',
            nonce: this.options.appState.attributes.transaction.probeInfo.nonce,
          }
        });
      })
      .done(data => {
        return $.post({
          url: `https://rain.okta1.com/api/v1/authn/factors/${this.options.appState.get('factors').getDefaultFactor().get('id')}/verify`,
          data: JSON.stringify({
            stateToken: this.options.appState.get('transaction').data.stateToken,
            devicePostureJwt: data.jwt,
          }),
          contentType: 'application/json'
        })
      });
  });
});
