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
      this.model.url = this.settings.get('baseUrl') + '/api/v1/authn/probe/verify';
      this.model.set('stateToken', this.options.appState.get('lastAuthResponse').stateToken);

      // mock
      this.doLoopback('5000')
        .fail(() => {
          this.doLoopback('5002')
            .fail(() => {
              this.doLoopback('5004')
                .fail(() => {
                  this.doLoopback('5006')
                    .fail(() => {
                      this.doLoopback('5008')
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

      // // POC
      // this.doLoopback('41236')
      // .done(data => {
      //   console.log('------', data);
      //   this.model.set('challengeResponse', data.jwt);
      //   this.model.save();
      // });
    },

    doLoopback: function (port) {
      return $.post({
        // mock
        url: `/loopback/deviceProbe/${port}`,
        // POC
        // url: `http://localhost:${port}`,
        method: 'POST',
        data: JSON.stringify({
          requestType: 'deviceProbeChallenge',
          nonce: this.options.appState.get('lastAuthResponse')._embedded.probeInfo.nonce,
        }),
        contentType: 'application/json',
      });
    }
  });
});
