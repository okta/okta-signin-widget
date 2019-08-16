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

  var getUserAgentName = function () {
    return navigator.userAgent;
  };
  var userAgentContainsSafari = function () {
    return /safari/i.test(getUserAgentName());
  };
  var isIOS = function () {
    return /(iPad|iPhone|iPod)/i.test(getUserAgentName());
  };
  var isIOSWebView = function () {
    return isIOS() && !userAgentContainsSafari();
  };

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
      var that = this;
      var response = this.options.appState.get('lastAuthResponse');
      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere({
        provider: this.options.provider,
        factorType: this.options.factorType
      });
      this.model.set('stateToken', response.stateToken);
      this.model.set('provider', this.options.provider);
      this.model.set('factorType', this.options.factorType);

      // If extension is being used
      if (factor.get('_links').extension) {
        // Figure out if browser indicates xhr call, if so the extension will not pick it up and we need to do regular browser request
        if (!isIOSWebView()) {
          if (this.settings.get('useMock')) {
            window.location.href = factor.get('_links').extension.href.replace('/api/v1', '') + '&OktaAuthorizationProviderExtension=' + this.settings.get('mockDeviceFactorEnrollmentResponseJwt');
          } else {
            window.location.href = factor.get('_links').extension.href.replace('/api/v1', '');
          }
          return;
        }
        let headers;
        if (this.settings.get('useMock')) {
          headers = {'Authorization': 'OktaAuthorizationProviderExtension ' + this.settings.get('mockDeviceFactorEnrollmentResponseJwt')};
        } else {
          headers = {'Authorization': 'OktaAuthorizationProviderExtension <valueToBeReplacedByExtension>'};
        }
        // Let the call be intercepted, populated and returned back
        $.get({
          url: factor.get('_links').extension.href,
          headers: headers // Included to trigger CORS acceptance for the actual request that's being modified
        }).done(data => {
          that.model.url = factor.get('_links').enroll.href;
          that.model.set('profile', {
            devicePostureJwt: data.devicePostureJwt
          });
          that.model.save()
            .done(data => {
              this.options.appState.trigger('change:transaction', this.options.appState, { data });
            });
        });
        return;
      }

      var nonce = factor.get('nonce');

      this.model.url = response._embedded.factors[0]._links.enroll.href;

      if (this.settings.get('useMock')) {
        this.mockLoopback(this, nonce);
        return;
      }

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
