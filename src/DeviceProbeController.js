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
      var nonce = this.options.appState.attributes.transaction.probeInfo.nonce;
      var signals = this.options.appState.attributes.transaction.probeInfo.signals;
      var forceInstall = this.options.appState.attributes.transaction.probeInfo.forceInstall;
      var authenticatorDownloadLinks = this.options.appState.attributes.transaction.probeInfo.authenticatorDownloadLinks;

      var challenge = {
        signals: signals,
        nonce: nonce
      }

      // Attempt to probe via loopback
      var port = 5000;
      for (port; port < 5100; port+=10) {
        var url = 'localhost:' + port;
        Okta.$.post(url, challenge)
          .done( function (data) {
            console.log('Received from device: ')
            console.log(data);
          });
        // If success, return
      }

      // if device challenge response not successfully received
      if (forceInstall) {
        // Make widget bounce you to app store, use authenticatorDownloadLinks
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
