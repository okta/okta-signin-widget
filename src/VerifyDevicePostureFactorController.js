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
  'models/BaseLoginModel',
], function (Okta, FormController, BaseLoginModel) {

  const $ = Okta.$;
  const _ = Okta._;

  return FormController.extend({
    className: 'device-posture',

    Model: {
      url: '',
      props: {
        stateToken: 'string',
      },
    },

    Form: {
      noButtonBar: true,
    },

    initialize: function () {
      var response = this.options.appState.get('lastAuthResponse');
      var status = response.status;
      var that = this;

      this.model.set('stateToken', response.stateToken);
      if (status === 'FACTOR_REQUIRED') {
        this.model.url = this.settings.get('baseUrl') + `/api/v1/authn/factors/${response._embedded.factors[0].id}/verify`;
        this.model.save()
          .done(data => {
            that.options.appState.setAuthResponse(data);
            var response = that.options.appState.get('lastAuthResponse');
            that.model.url = that.settings.get('baseUrl') + `/api/v1/authn/factors/${response._embedded.factor.id}/verify`;
            var nonce = response._embedded.factor._embedded.challenge.nonce;
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
                                var Model = BaseLoginModel.extend(_.extend({
                                  parse: function (attributes) {
                                    this.settings = attributes.settings;
                                    this.appState = attributes.appState;
                                    return _.omit(attributes, ['settings', 'appState']);
                                  }
                                }, _.result(this, 'Model')));
                                that.model = new Model({
                                  settings: that.settings,
                                  appState: that.options.appState
                                }, { parse: true });
                                that.model.url = that.settings.get('baseUrl') + `/api/v1/authn/factors/${response._embedded.factor.id}/verify`;
                                that.model.set('devicePostureJwt', data.jwt);
                                that.model.set('stateToken', response.stateToken);
                                that.model.save()
                                  .done(data => {
                                    that.options.appState.trigger('change:transaction', that.options.appState, {data});
                                  });
                              });
                          });
                      });
                  });
              });
            // // POC
            // this.doLoopback('5008')
            //   .done(data => {
            //       var Model = BaseLoginModel.extend(_.extend({
            //         parse: function (attributes) {
            //           this.settings = attributes.settings;
            //           this.appState = attributes.appState;
            //           return _.omit(attributes, ['settings', 'appState']);
            //         }
            //       }, _.result(this, 'Model')));
            //       that.model = new Model({
            //         settings: that.settings,
            //         appState: that.options.appState
            //       }, { parse: true });
            //       that.model.url = that.settings.get('baseUrl') + `/api/v1/authn/factors/${response._embedded.factor.id}/verify`;
            //       that.model.set('devicePostureJwt', data.jwt);
            //       that.model.set('stateToken', response.stateToken);
            //       that.model.save()
            //         .done(data => {
            //           that.options.appState.trigger('change:transaction', that.options.appState, {data});
            //         });
            //   });
          });
      } else if (status === 'FACTOR_CHALLENGE') {
        console.log('Error! Ended up in FACTOR_CHALLENGE without being in FACTOR_REQUIRED first, do not mess around like that');
      }
    },

    doLoopback: function (port, nonce) {
      return $.post({
        url: `/loopback/factorVerify/${port}`,
        // POC
        // url: `http://localhost:${port}`,
        method: 'POST',
        data: JSON.stringify({
          requestType: 'deviceFactorChallenge',
          nonce: nonce,
        }),
        contentType: 'application/json',
      });
    },

  });
});