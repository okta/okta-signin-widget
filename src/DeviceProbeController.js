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

/*eslint no-console: [0] */
/*eslint max-len: [0]*/
/*eslint max-statements: [0]*/
/*eslint max-depth: [0]*/
define([
  'okta',
  'util/Util',
  'util/FormController',
  'models/BaseLoginModel',
  'util/FormType',
  'views/shared/Spinner'
], function (Okta, Util, FormController, BaseLoginModel, FormType, Spinner) {

  const _ = Okta._;
  const $ = Okta.$;

  return FormController.extend({

    className: 'device-probe',

    Model: {
      url: '',
      props: {
        stateToken: 'string',
        challengeResponse: 'string'
      },
      save: function () {
        var appState = this.options.appState;
        return this.startTransaction(function () {
          appState.trigger('loading', true);
          var data = {
            stateToken: this.get('stateToken'),
            challengeResponse: this.get('challengeResponse'),
          };
          return $.post({
            url: this.url,
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
          }).done(function (data) {
            this.options.appState.trigger('change:transaction', this.options.appState, { data });
          }.bind(this));
        });
      }
    },

    Form: {
      noButtonBar: true,
      title: 'Signing in',
      subtitle: 'Probing for device context',
      formChildren: function () {
        var result = [];
        result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));
        return result;
      }
    },
  
    initialize: function () {
      this.options.appState.trigger('loading', false);
      this.model.trigger('spinner:show');
      let response = this.options.appState.get('lastAuthResponse');
      let baseUrl = 'http://localhost:';
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/loopback/deviceProbe/';
      }
      let options = {
        context: this,
        baseUrl: baseUrl,
        requestType: 'deviceChallenge',
        port: 41236,
        nonce: response._embedded.probeInfo.nonce,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 5
      };
      var successFn = function (data) {
        if (data.status === 'FAILED') {
          this._probeUsingUniversalLink();
          return;
        }
        this.model.url = response._links.next.href;
        this.model.set('stateToken', response.stateToken);
        this.model.set('challengeResponse', data.jwt);
        this.model.save();
      };
      Util.performLoopback(options, successFn);
    },

    _probeUsingUniversalLink: function () {
      let response = this.options.appState.get('lastAuthResponse');
      let baseUrl = Util.getUniversalLinkPrefix();
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/universalLink/deviceProbe';
      }
      var pollingUrl = this.settings.get('baseUrl') + '/api/v1/authn/introspect';
      let options = {
        context: this,
        baseUrl: baseUrl,
        pollingUrl: pollingUrl,
        status: response.status,
        nonce: response._embedded.probeInfo.nonce,
        stateToken: response.stateToken,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 10
      };
      var successFn = function (data) {
        if (data.status === 'FAILED') {
          alert('Device Probing failed!');
          return;
        }
        let Model = BaseLoginModel.extend(_.extend({
          parse: function (attributes) {
            this.settings = attributes.settings;
            this.appState = attributes.appState;
            return _.omit(attributes, ['settings', 'appState']);
          }
        }, _.result(this, 'Model')));
        let model = new Model({
          settings: this.settings,
          appState: this.options.appState
        }, { parse: true });
        model.url = this.settings.get('baseUrl') + '/api/v1/authn';
        model.set('stateToken', response.stateToken);
        model.save = function () {
          var appState = this.options.appState;
          return this.startTransaction(function () {
            appState.trigger('loading', true);
            var data = {
              stateToken: this.get('stateToken'),
            };
            return $.post({
              url: this.url,
              method: 'POST',
              data: JSON.stringify(data),
              contentType: 'application/json',
            }).done(function (data) {
              this.options.appState.trigger('change:transaction', this.options.appState, { data });
            }.bind(this));
          });
        }.bind(model);
        model.save();
      };
      Util.performUniversalLink(options, successFn);
    }

  });
});
