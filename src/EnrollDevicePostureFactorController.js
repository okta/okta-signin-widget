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
      var response = this.options.appState.get('lastAuthResponse');
      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere({
        provider: this.options.provider,
        factorType: this.options.factorType
      });

      // If GET, it means we're using extension
      if (_.indexOf(factor.get('_links').enroll.hints.allow, 'GET') >= 0) {
        if (this.settings.get('useMock')) {
          window.location.href = factor.get('_links').enroll.href + '&OktaAuthorizationProviderExtension=' + this.settings.get('mockDeviceFactorEnrollmentResponseJwt');
        } else {
          window.location.href = factor.get('_links').enroll.href;
        }
        return;
      }

      this.model.set('stateToken', response.stateToken);
      this.model.set('provider', this.options.provider);
      this.model.set('factorType', this.options.factorType);

      var nonce = factor.get('nonce');

      this.model.url = response._embedded.factors[0]._links.enroll.href;

      if (this.settings.get('useMock')) {
        this.mockLoopback(this, nonce);
        return;
      }

      var that = this;
      that.doLoopback('http://localhost:', '41236', nonce)
        .done(data => {
          that.model.set('profile', {
            devicePostureJwt: data.jwt
          });
          that.model.save()
            .done(data => {
              this.options.appState.trigger('change:transaction', this.options.appState, { data });
            });
        });
    },

    mockLoopback: function (that, nonce) {
      var baseUrl = '/loopback/factorEnrollChallenge/';
      that.doLoopback(baseUrl, '5000', nonce)
        .fail(() => {
          that.doLoopback(baseUrl, '5002', nonce)
            .fail(() => {
              that.doLoopback(baseUrl, '5004', nonce)
                .fail(() => {
                  that.doLoopback(baseUrl, '5006', nonce)
                    .fail(() => {
                      that.doLoopback(baseUrl, '5008', nonce)
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
    },

    doLoopback: function (baseUrl, port, nonce) {
      return $.post({
        url: baseUrl + `${port}`,
        method: 'POST',
        data: JSON.stringify({
          requestType: 'userEnroll',
          nonce: nonce,
        }),
        contentType: 'application/json',
      });
    }

  });

});
