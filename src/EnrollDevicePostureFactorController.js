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
        provider: 'string',
        factorType: 'string',
        profile: 'object'
      },
      save: function () {
        var appState = this.options.appState;
        return this.startTransaction(function () {
          appState.trigger('loading', true);
          var data = {
            stateToken: this.get('stateToken'),
            provider: this.get('provider'),
            factorType: this.get('factorType'),
            profile: this.get('profile'),
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
        var result = [];
        result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));
        return result;
      }
    },

    initialize: function () {
      this.options.appState.trigger('loading', false);
      this.model.trigger('spinner:show');
      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere({
        provider: this.options.provider,
        factorType: this.options.factorType
      });

      let useLoopback = factor.get('deviceEnrollment').binding === 'LOOPBACK';

      // If extension is being used
      if (factor.get('_links').extension) {
        this._enrollUsingExtension(factor);
      } else if (useLoopback) { // If loopback is being used
        this._enrollUsingLoopback(factor);
      } else { // If universal link is being used
        this._enrollUsingUniversalLink(factor);
      }
    },

    _enrollUsingExtension: function (factor) {
      // Seems like web view does not indicate xhr calls, so we can trigger extension as if it was a regular browser request
      // Note also that Office365 native app does not seem to support regular requests during login, so needs to use xhr requests
      if (Util.isIOSWebView()) {
        this._initiateEnrollmentUsingExtensionViaXhr(factor);
      } else {
        this._initiateEnrollmentUsingExtensionViaRegularRequests(factor);
      }
    },

    _initiateEnrollmentUsingExtensionViaXhr: function (factor) {
      let headers;
      if (this.settings.get('useMock')) {
        headers = {'Authorization': 'OktaAuthorizationProviderExtension ' + this.settings.get('mockDeviceFactorEnrollmentResponseJwt')};
      } else {
        headers = {'Authorization': 'OktaAuthorizationProviderExtension <valueToBeReplacedByExtension>'};
      }
      // Let the call be intercepted, populated and returned back
      $.get({
        url: factor.get('_links').extension.href,
        headers: headers, // Included to trigger CORS acceptance for the actual request that's being modified by the extension
        crossDomain: true // Included for force jQuery to omit the header indicating this is an XHR call
      }).done(function (data) {
        this._enrollUsingExtensionViaXhr(data, factor);
      }.bind(this));
    },

    _enrollUsingExtensionViaXhr: function (data, factor) {
      let response = this.options.appState.get('lastAuthResponse');
      this.model.url = factor.get('_links').enroll.href;
      this.model.set('stateToken', response.stateToken);
      this.model.set('provider', this.options.provider);
      this.model.set('factorType', this.options.factorType);
      this.model.set('profile', {
        devicePostureJwt: data.devicePostureJwt
      });
      this.model.save();
    },

    _initiateEnrollmentUsingExtensionViaRegularRequests: function (factor) {
      if (this.settings.get('useMock')) {
        window.location.href = factor.get('_links').extension.href.replace('/api/v1', '') + '&OktaAuthorizationProviderExtension=' + this.settings.get('mockDeviceFactorEnrollmentResponseJwt');
      } else {
        window.location.href = factor.get('_links').extension.href.replace('/api/v1', '');
      }
    },

    _enrollUsingLoopback: function (factor) {
      let baseUrl = 'http://localhost:';
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/loopback/factorEnrollChallenge/';
      }
      let options = {
        context: this,
        baseUrl: baseUrl,
        requestType: 'userEnroll',
        port: 41236,
        nonce: factor.get('nonce'),
        domain: this.settings.get('baseUrl'),
        maxAttempts: 5
      };
      var successFn = function (data) {
        if (data.status === 'FAILED') {
          alert('Factor Enrollment failed using loopback!');
          return;
        }
        var response = this.options.appState.get('lastAuthResponse');
        this.model.url = response._embedded.factors[0]._links.enroll.href;
        this.model.set('stateToken', response.stateToken);
        this.model.set('provider', this.options.provider);
        this.model.set('factorType', this.options.factorType);
        this.model.set('profile', {
          devicePostureJwt: data.jwt
        });
        this.model.save();
      };
      Util.performLoopback(options, successFn);
    },

    _enrollUsingUniversalLink: function (factor) {
      let response = this.options.appState.get('lastAuthResponse');
      let baseUrl = Util.getUniversalLinkPrefix();
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/universalLink/factorEnrollment';
      }
      var pollingUrl = this.settings.get('baseUrl') + '/api/v1/authn/introspect';
      let options = {
        context: this,
        baseUrl: baseUrl,
        pollingUrl: pollingUrl,
        status: response.status,
        nonce: factor.get('nonce'),
        stateToken: response.stateToken,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 10
      };
      var successFn = function (data) {
        if (data.status === 'FAILED') {
          alert('Factor Enrollment failed using universal link!');
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
