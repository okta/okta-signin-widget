/*!
 * Copyright (c) 2018-2019, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'views/enroll-factors/Footer'
],
function (Okta, FormController) {

  const $ = Okta.$;
  const _ = Okta._;

  return FormController.extend({

    className: 'device-probe',

    Model: {
      url: '',
      props: {
        stateToken: 'string',
        provider: 'string',
        factorType: 'string',
        profile: 'object'
      },
    },

    Form: {
      noButtonBar: true,
    },

    initialize: function () {
      this.model.url = this.settings.get('baseUrl') + '/api/v1/authn/factors';
      this.model.set('stateToken', this.options.appState.get('lastAuthResponse').stateToken);
      this.model.set('provider', 'OKTA');
      this.model.set('factorType', 'device_posture');

      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere({
        provider: this.options.provider,
        factorType: this.options.factorType
      });

      var nonce = factor.get('nonce');
      var that = this;
      // mock
      that.doLoopback('5000', nonce)
        .fail(() => {
          that.doLoopback('5002', nonce)
            .fail(() => {
              that.doLoopback('5004', nonce)
                .fail(() => {
                  that.doLoopback('5006', nonce)
                    .fail(() => {
                      that.doLoopback('5008', nonce)
                        .done(data => {
                          that.model.set('profile', {
                            devicePostureJwt: data.jwt
                          });
                          that.model.save()
                            .done(data => {
                              this.options.appState.trigger('change:transaction', this.options.appState, { data });
                            });
                        });
                    });
                });
            });
        });

      // POC
      // this.doLoopback('41236')
      //     .done(data => {
      //         this.model.set('profile', {
      //           devicePostureJwt: data.jwt
      //         });
      //         this.model.save()
      //           .done(data => {
      //             this.options.appState.trigger('change:transaction', this.options.appState, { data });
      //           });
      //       });
    },

    doLoopback: function (port, nonce) {
      return $.post({
        // mock
        url: `/loopback/factorEnrollChallenge/${port}`,
        // POC
        // url: `http://localhost:${port}`,
        method: 'POST',
        data: JSON.stringify({
          requestType: 'factorEnrollChallenge',
          nonce: nonce,
        }),
        contentType: 'application/json',
      });
    }

  });

});
