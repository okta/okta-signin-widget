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

  const $ = Okta.$;
  const _ = Okta._;

  return FormController.extend({

    className: 'device-posture',

    Model: {
      url: '',
      props: {
        stateToken: 'string',
      }
    },

    Form: {
      noButtonBar: true,
      title: 'Signing in',
      subtitle: 'Verifying device posture factor',
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

      if (!this._isStatusFactorRequired(response)) {
        return;
      }
      this._selectFactor(response).done(this._verifyFactor.bind(this));
    },

    _isStatusFactorRequired: function (response) {
      let isFactorRequired = response.status === 'FACTOR_REQUIRED';
      if (!isFactorRequired) {
        console.log('Error! The status was not FACTOR_REQUIRED when it should have been!');
      }
      return isFactorRequired;
    },

    _selectFactor: function (response) {
      this.model.set('stateToken', response.stateToken);
      this.model.url = response._embedded.factors[0]._links.verify.href;
      return this.model.save();
    },

    _verifyFactor: function (data) {
      this.options.appState.setAuthResponse(data);
      let response = this.options.appState.get('lastAuthResponse');

      let bindingArray = Util.createBindingList(response._embedded.factor._embedded.binding);
      this._verifyUsingNextBinding(bindingArray, response);
    },

    _verifyUsingNextBinding: function (bindingArray, response) {
      let bindingHint  = this.options.appState.get('device_probe_binding_hint');
      let indexBindingHint = -1;
      let binding = undefined;
      if (bindingHint !== undefined) { // find index of binding based on hint provided by device probing
        indexBindingHint =  bindingArray.findIndex(function (binding) {
          return binding === bindingHint;
        });
      }

      if (indexBindingHint >= 0) { /*First pick binding based on hint provided by device probing.*/
        binding = bindingHint;
        bindingArray.splice(indexBindingHint, 1);
      } else { // If hint is not provided, pick the first binding in bindingArray
        binding = bindingArray.shift();
      }

      //let binding = bindingArray.shift();
      if (binding === undefined) {
        alert('No more bindings to try for factor verification');
      } else if (binding === Util.getBindings().LOOPBACK) {
        if (!Util.isWindows()) {
          console.warn('Attempting loopback for OS' + Util.getOS());
        }
        this._verifyUsingLoopback(bindingArray, response);
      } else if (binding === Util.getBindings().UNIVERSAL_LINK) {
        if (!Util.isIOS()) {
          console.warn('Attempting universal link for OS' + Util.getOS());
        }
        this._verifyUsingAsyncLink({ method: Util.getBindings().UNIVERSAL_LINK }, bindingArray, response);
      } else if (binding === Util.getBindings().EXTENSION) {
        if (!Util.isIOS() && !Util.isMac()) {
          console.warn('Attempting extension for OS' + Util.getOS());
        }
        this._verifyUsingExtension(response);
      } else if (binding === Util.getBindings().CUSTOM_URI) {
        if (!Util.isWindows()) {
          console.warn('Attempting custom uri for OS' + Util.getOS());
        }
        this._verifyUsingAsyncLink({ method: Util.getBindings().CUSTOM_URI }, bindingArray, response);
      } else {
        alert('Invalid binding mechanism retrieved from the server!');
      }
    },

    _verifyUsingExtension: function (response) {
      // Seems like web view does not indicate xhr calls, so we can trigger extension as if it was a regular browser request
      // Note also that Office365 native app does not seem to support regular requests during login, so needs to use xhr requests
      if (Util.isIOSWebView()) {
        this._verificationUsingExtensionViaXhr(response);
      } else {
        this._verificationUsingExtensionViaFormPost(response);
      }
    },

    _verificationUsingExtensionViaFormPost: function (response) {
      const options = {
        stateToken: response.stateToken,
        devicePostureJwt: this.settings.get('useMock') ? this.settings.get('mockDeviceFactorChallengeResponseJwt') : '<dummyValue>'
      };
      Util.formPost(response._links.extension.href, options);
    },

    _verificationUsingExtensionViaXhr: function (response) {
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
      model.url = response._links.extension.href.replace('/idx', '/api/v1/idx');
      model.set('devicePostureJwt', this.settings.get('useMock') ? this.settings.get('mockDeviceFactorChallengeResponseJwt') : '<dummyValue>');
      model.set('stateToken', response.stateToken);
      model.set('factorId', response._embedded.factor.id);
      model.save = function () {
        var appState = this.options.appState;
        return this.startTransaction(function () {
          appState.trigger('loading', true);
          let data = {
            stateToken: this.get('stateToken'),
            devicePostureJwt: this.get('devicePostureJwt'),
            factorId: this.get('factorId')
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
    },

    _verifyUsingLoopback: function (bindingArray, response) {
      let baseUrl = 'http://localhost:';
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/loopback/factorVerifyChallenge/';
      }
      let options = {
        context: this,
        baseUrl: baseUrl,
        requestType: 'userChallenge',
        port: 41236,
        nonce: response._embedded.factor._embedded.challenge.nonce,
        credentialId: response._embedded.factor.profile.credentialId,
        factorId: response._embedded.factor.id,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 5
      };
      let fn = function (data) {
        let response = this.options.appState.get('lastAuthResponse');
        if (data && data.status === 'FAILED') {
          this._verifyUsingNextBinding(bindingArray, response);
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
        model.url = response._links.next.href;
        model.set('devicePostureJwt', data.jwt);
        model.set('stateToken', response.stateToken);
        model.save = function () {
          let appState = this.options.appState;
          return this.startTransaction(function () {
            appState.trigger('loading', true);
            var data = {
              stateToken: this.get('stateToken'),
              devicePostureJwt: this.get('devicePostureJwt'),
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
      Util.performLoopback(options, fn);
    },

    _verifyUsingAsyncLink: function (opt, bindingArray, response) {
      let baseUrl = '';
      if (opt.method === Util.getBindings().UNIVERSAL_LINK) {
        baseUrl = Util.getUniversalLinkPrefix();
      } else if (opt.method === Util.getBindings().CUSTOM_URI) {
        baseUrl = Util.getCustomUriPrefix();
      } else {
        alert('Invalid invocation for async linking');
      }
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/asyncLink/factorVerification';
      }
      let pollingUrl = this.settings.get('baseUrl') + '/api/v1/authn/introspect';
      let options = {
        context: this,
        baseUrl: baseUrl,
        pollingUrl: pollingUrl,
        postbackUrl: this.settings.get('baseUrl') + '/api/v1/authn/factors/' + response._embedded.factor.id + '/verify',
        requestType: 'userChallenge',
        status: response.status,
        nonce: response._embedded.factor._embedded.challenge.nonce,
        stateToken: response.stateToken,
        credentialId: response._embedded.factor.profile.credentialId,
        factorId: response._embedded.factor.id,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 10,
        useMock: this.settings.get('useMock')
      };
      let fn = function (data) {
        let response = this.options.appState.get('lastAuthResponse');
        if (data && data.status === 'FAILED') {
          this._verifyUsingNextBinding(bindingArray, response);
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

      if (opt.method === Util.getBindings().UNIVERSAL_LINK) {
        this.add(Okta.createButton({
          attributes: { },
          className: 'button',
          title: 'Click to Verify Factor',
          click: function click() {
            Util.performAsyncLink(options, fn);
          }}));
      } else {
        Util.performAsyncLink(options, fn);
      }
    }

  });
});