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
],
function (Okta, Util, FormController, BaseLoginModel, FormType, Spinner) {

  const $ = Okta.$;
  const _ = Okta._;

  return FormController.extend({

    className: 'device-probe',

    Model: {
      url: '',
      props: {
        stateToken: 'string',
        devicePostureJwt: 'string'
      },
      save: function () {
        let appState = this.options.appState;
        return this.startTransaction(function () {
          appState.trigger('loading', true);
          let data = {
            stateToken: this.get('stateToken'),
            devicePostureJwt: this.get('devicePostureJwt')
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
      subtitle: 'Enrolling in device posture factor',
      formChildren: function () {
        let result = [];
        result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));
        return result;
      }
    },

    initialize: function () {
      this.options.appState.trigger('loading', false);
      this.model.trigger('spinner:show');
      let factors = this.options.appState.get('factors');
      let factor = factors.findWhere({
        provider: this.options.provider,
        factorType: this.options.factorType
      });

      let bindingArray = Util.createBindingList(factor.get('deviceEnrollment').binding);
      this._enrollUsingNextBinding(bindingArray, factor);
    },

    _enrollUsingNextBinding: function (bindingArray, factor) {
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

      if (binding === undefined) {
        alert('No more bindings to try for factor enrollment');
      } else if (binding === Util.getBindings().LOOPBACK) {
        if (!Util.isWindows()) {
          console.warn('Attempting loopback for OS' + Util.getOS());
        }
        this._enrollUsingLoopback(bindingArray, factor);
      } else if (binding === Util.getBindings().UNIVERSAL_LINK) {
        if (!Util.isIOS()) {
          console.warn('Attempting universal link for OS' + Util.getOS());
        }
        this._enrollUsingAsyncLink({ method: Util.getBindings().UNIVERSAL_LINK }, bindingArray, factor);
      } else if (binding === Util.getBindings().EXTENSION) {
        if (!Util.isIOS() && !Util.isMac()) {
          console.warn('Attempting extension for OS' + Util.getOS());
        }
        this._enrollUsingExtension(factor);
      } else if (binding === Util.getBindings().CUSTOM_URI) {
        if (!Util.isWindows()) {
          console.warn('Attempting custom uri for OS' + Util.getOS());
        }
        this._enrollUsingAsyncLink({ method: Util.getBindings().CUSTOM_URI }, bindingArray, factor);
      } else {
        alert('Invalid binding mechanism retrieved from the server!');
      }
    },

    _enrollUsingExtension: function (factor) {
      // Seems like web view does not indicate xhr calls, so we can trigger extension as if it was a regular browser request
      // Note also that Office365 native app does not seem to support regular requests during login, so needs to use xhr requests
      if (Util.isIOSWebView()) {
        this._enrollmentUsingExtensionViaXhr(factor);
      } else {
        this._enrollmentUsingExtensionViaFormPost(factor);
      }
    },

    _enrollmentUsingExtensionViaXhr: function (factor) {
      let response = this.options.appState.get('lastAuthResponse');
      this.model.url = factor.get('_links').extension.href.replace('/idx', '/api/v1/idx');
      this.model.set('stateToken', response.stateToken);
      this.model.set('devicePostureJwt', this.settings.get('useMock') ? this.settings.get('mockDeviceFactorEnrollmentResponseJwt') : '<dummyValue>');
      this.model.save();
    },

    _enrollmentUsingExtensionViaFormPost: function (factor) {
      let response = this.options.appState.get('lastAuthResponse');
      const options = {
        stateToken: response.stateToken,
        devicePostureJwt: this.settings.get('useMock') ? this.settings.get('mockDeviceFactorEnrollmentResponseJwt') : '<dummyValue>'
      };
      Util.formPost(factor.get('_links').extension.href, options);
    },

    _enrollUsingLoopback: function (bindingArray, factor) {
      let baseUrl = 'http://localhost:';
      let deviceEnrollmentId = undefined;
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/loopback/factorEnrollChallenge/';
      }
      if (factor.get('deviceEnrollment')) {
        deviceEnrollmentId = factor.get('deviceEnrollment').deviceEnrollmentId;
      }
      let options = {
        context: this,
        baseUrl: baseUrl,
        requestType: 'userEnroll',
        port: 41236,
        nonce: factor.get('nonce'),
        domain: this.settings.get('baseUrl'),
        deviceEnrollmentId: deviceEnrollmentId,
        maxAttempts: 5
      };
      let fn = function (data) {
        if (data && data.status === 'FAILED') {
          this._enrollUsingNextBinding(bindingArray, factor);
          return;
        }
        let response = this.options.appState.get('lastAuthResponse');
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
        model.url = response._embedded.factors[0]._links.enroll.href;
        model.set('stateToken', response.stateToken);
        model.set('provider', this.options.provider);
        model.set('factorType', this.options.factorType);
        model.set('profile', {
          devicePostureJwt: data.jwt
        });
        model.save = function () {
          let appState = this.options.appState;
          return this.startTransaction(function () {
            appState.trigger('loading', true);
            let data = {
              stateToken: this.get('stateToken'),
              provider: this.get('provider'),
              factorType: this.get('factorType'),
              profile: this.get('profile')
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

    _enrollUsingAsyncLink: function (opt, bindingArray, factor) {
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
        baseUrl = 'http://localhost:3000/asyncLink/factorEnrollment';
      }
      let pollingUrl = this.settings.get('baseUrl') + '/api/v1/authn/introspect';
      let options = {
        context: this,
        baseUrl: baseUrl,
        pollingUrl: pollingUrl,
        postbackUrl: this.settings.get('baseUrl') + '/api/v1/authn/factors',
        requestType: 'userEnroll',
        status: response.status,
        nonce: factor.get('nonce'),
        stateToken: response.stateToken,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 10,
        useMock: this.settings.get('useMock')
      };
      let fn = function (data) {
        if (data && data.status === 'FAILED') {
          this._enrollUsingNextBinding(bindingArray, factor);
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
    }

  });

});
