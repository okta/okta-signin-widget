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

define(['okta', 'util/FormController'], function (Okta, FormController) {

  return FormController.extend({
    className: 'device-probe',

    Model: {},

    Form: {
      noButtonBar: true
    },

    preRender: function () {
      this.options.appState.trigger('loading', true);
      var deviceChallenges = this.options.appState.attributes.transaction.probing.deviceChallenges;
      var forceInstall = this.options.appState.attributes.transaction.probing.useExternalHelper;
      var deviceEnrollmentId = '';
      var challengeResponse = '';
      var success = false;
      if (deviceChallenges.length !== 0) {
        var i;
        for (i = 0; i < deviceChallenges.length; i++) {
          var deviceChallenge = deviceChallenges[i];
          deviceEnrollmentId = deviceChallenge.deviceEnrollmentId;
          var nonce = deviceChallenge.nonce;
          var signals = deviceChallenge.signals;
          var bindingDetailsText = deviceChallenge.bindingDetails;
          var bindingDetails = JSON.parse(bindingDetailsText);
          var binding = bindingDetails.binding;
          var port = bindingDetails.ports;
          if (binding === 'loopback server') {
            // Make xhr request
            var url = 'http://localhost';
            if (port) {
              url += ':' + port;
            }
            var data = {
              signals: signals,
              nonce: nonce
            }
            Okta.$.post(url, data)
              .done( function (data) {
                console.log('Received from device: ')
                console.log(data);
              });
          }


        }
        // For each device challenge, probe the device
        // If success, set device enrollment id
        // If success, set challenge response
        success = true;
      }

      // if device challenge response not successfully received
      if (!success && forceInstall) {
        // Make widget bounce you to app store
      }

      var token = this.options.token;
      this.model.startTransaction(function (authClient) {
        return authClient.tx.resume({
          stateToken: token,
          deviceEnrollmentId: deviceEnrollmentId,
          challengeResponse: challengeResponse
        });
      });
    },

    remove: function () {
      // this.options.appState.trigger('loading', false);
      // return FormController.prototype.remove.apply(this, arguments);
    }

  });
});
