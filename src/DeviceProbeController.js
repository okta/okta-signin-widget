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
        let appState = this.options.appState;
        return this.startTransaction(function () {
          appState.trigger('loading', true);
          let data = {
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
        let result = [];
        result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));
        return result;
      }
    },
  
    initialize: function () {
      this.options.appState.trigger('loading', false);
      this.model.trigger('spinner:show');
      this._performNextBinding(this._getNextBinding());
    },

    _probeUsingLoopback: function () {
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
      let fn = function (data) {
        if (data && data.status === 'FAILED') {
          this._performNextBinding(this._getNextBinding(Util.getBindings().LOOPBACK));
          return;
        }
        this.model.url = response._links.next.href;
        this.model.set('stateToken', response.stateToken);
        this.model.set('challengeResponse', data.jwt);
        this.model.save();
      };
      Util.performLoopback(options, fn);
    },

    _probeUsingAsyncLink: function (opt) {
      let response = this.options.appState.get('lastAuthResponse');
      let baseUrl = '';
      if (opt.method === Util.getBindings().UNIVERSAL_LINK) {
        baseUrl = Util.getUniversalLinkPrefix();
      } else if (opt.method === Util.getBindings().CUSTOM_URI) {
        baseUrl = Util.getCustomUriPrefix();
      } else {
        alert('Invalid invocation for async linking');
      }
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/asyncLink/deviceProbe';
      }
      let pollingUrl = this.settings.get('baseUrl') + '/api/v1/authn/introspect';
      let options = {
        context: this,
        baseUrl: baseUrl,
        pollingUrl: pollingUrl,
        requestType: 'deviceChallenge',
        postbackUrl: this.settings.get('baseUrl') + '/api/v1/authn/probe/verify',
        status: response.status,
        nonce: response._embedded.probeInfo.nonce,
        stateToken: response.stateToken,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 10,
        useMock: this.settings.get('useMock')
      };
      let fn = function (data) {
        if (data && data.status === 'FAILED') {
          this._performNextBinding(this._getNextBinding(Util.getBindings().UNIVERSAL_LINK));
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
          let appState = this.options.appState;
          return this.startTransaction(function () {
            appState.trigger('loading', true);
            let data = {
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
      Util.performAsyncLink(options, fn);
    },

    _getNextBinding: function (previousBinding) {
      if (previousBinding === Util.getBindings().LOOPBACK) {
        if (Util.isIOS() || Util.isMac()) {
          alert('No more bindings to try for device probing');
          return '';
        } else if (Util.isWindows()) {
          return Util.getBindings().CUSTOM_URI;
        } else {
          alert('Invalid next binding for OS: ' + Util.getOS() + ' when previous binding was ' + previousBinding);
        }
      }
      if (previousBinding === Util.getBindings().UNIVERSAL_LINK) {
        if (Util.isIOS() || Util.isMac()) {
          console.log('No more bindings to try');
          return '';
        } else {
          alert('Invalid next binding for OS: ' + Util.getOS() + ' when previous binding was ' + previousBinding);
        }
      }
      if (previousBinding === Util.getBindings().CUSTOM_URI) {
        if (Util.isWindows()) {
          console.log('No more bindings to try');
          return '';
        } else {
          alert('Invalid next binding for OS: ' + Util.getOS() + ' when previous binding was ' + previousBinding);
        }
      }
      // No previous binding, let's attempt the most likely to succeed based on OS
      if (Util.isIOS() || Util.isMac()) {
        return Util.getBindings().UNIVERSAL_LINK;
      } else if (Util.isWindows()) {
        return Util.getBindings().LOOPBACK;
      } else {
        alert('Unsupported OS: ' + Util.getOS());
      }
    },

    _performNextBinding: function (binding) {
      if (binding === Util.getBindings().LOOPBACK) {
        this._probeUsingLoopback();
      } else if (binding === Util.getBindings().UNIVERSAL_LINK) {
        this._probeUsingAsyncLink({ method: Util.getBindings().UNIVERSAL_LINK });
      } else if (binding === Util.getBindings().CUSTOM_URI) {
        this._probeUsingAsyncLink({ method: Util.getBindings().CUSTOM_URI });
      }
    }

  });
});
