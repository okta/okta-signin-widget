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
  'models/BaseLoginModel'
],
function (Okta, Util, FormController, BaseLoginModel) {

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
      this.model.save()
        .done(function (data) {
          this.options.appState.trigger('change:transaction', this.options.appState, { data });
        }.bind(this));
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
        this.model.save()
          .done(function (data) {
            this.options.appState.trigger('change:transaction', this.options.appState, { data });
          }.bind(this));
      };
      Util.performLoopback(options, successFn);
    },

    _enrollUsingUniversalLink: function (factor) {
      let response = this.options.appState.get('lastAuthResponse');
      let baseUrl = 'http://universal.link';
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
        model.save()
          .done(function (data) {
            this.options.appState.trigger('change:transaction', this.options.appState, {data});
          }.bind(this));
      };
      Util.performUniversalLink(options, successFn);
    }

  });

});
