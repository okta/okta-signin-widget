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
  'util/FormController'
], function (Okta, FormController) {

  const $ = Okta.$;
  const _ = Okta._;

  return FormController.extend({

    className: 'device-probe',

    Model: {
      url: '',
      props: {
        stateToken: 'string',
        challengeResponse: 'string'
      },
    },

    Form: {
      noButtonBar: true,
    },
  
    initialize: function () {
      var response = this.options.appState.get('lastAuthResponse');
      this.model.set('stateToken', response.stateToken);

      this.model.url = response._links.next.href;
      var nonce = response._embedded.probeInfo.nonce;

      if (this.settings.get('useMock')) {
        this.mockLoopback(nonce);
        return;
      }

      this.doLoopback('http://localhost:', '41236', nonce)
        .done(data => {
          this.model.set('challengeResponse', data.jwt);
          this.model.save()
            .done(data => {
              this.options.appState.trigger('change:transaction', this.options.appState, { data });
            });
        });
    },

    mockLoopback: function (nonce) {
      var baseUrl = '/loopback/deviceProbe/';
      this.doLoopback(baseUrl, '5000', nonce)
        .fail(() => {
          this.doLoopback(baseUrl, '5002', nonce)
            .fail(() => {
              this.doLoopback(baseUrl, '5004', nonce)
                .fail(() => {
                  this.doLoopback(baseUrl, '5006', nonce)
                    .fail(() => {
                      this.doLoopback(baseUrl, '5008', nonce)
                        .done(data => {
                          this.model.set('challengeResponse', data.jwt);
                          this.model.save()
                            .done(data => {
                              this.options.appState.trigger('change:transaction', this.options.appState, { data });
                            });
                        });
                    });
                });
            });
        });
    },

    doLoopback: function (baseUrl, port, nonce) {
      return $.post({
        url: baseUrl + `${port}`,
        method: 'POST',
        data: JSON.stringify({
          requestType: 'deviceChallenge',
          nonce: nonce,
        }),
        contentType: 'application/json',
      });
    }
  });
});
