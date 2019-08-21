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

      var useLoopback = response._embedded.factor._embedded.binding === 'LOOPBACK';

      setTimeout(function () {
        // If extension is being used
        if (response._links.extension) {
          this._verifyUsingExtension(response);
        } else if (useLoopback) { // If loopback is being used
          this._verifyUsingLoopback(response);
        } else { // If universal link is being used
          this._verifyUsingUniversalLink(response);
        }
      }.bind(this), 3000);
    },

    _verifyUsingExtension: function (response) {
      // Seems like web view does not indicate xhr calls, so we can trigger extension as if it was a regular browser request
      // Note also that Office365 native app does not seem to support regular requests during login, so needs to use xhr requests
      if (Util.isIOSWebView()) {
        this._initiateVerificationUsingExtensionViaXhr(response);
      } else {
        this._initiateVerificationUsingExtensionViaRegularRequests(response);
      }
    },

    _initiateVerificationUsingExtensionViaRegularRequests: function (response) {
      if (this.settings.get('useMock')) {
        window.location.href = response._links.extension.href.replace('/api/v1', '') + '&OktaAuthorizationProviderExtension=' + this.settings.get('mockDeviceFactorChallengeResponseJwt');
      } else {
        window.location.href = response._links.extension.href.replace('/api/v1', '');
      }
    },

    _initiateVerificationUsingExtensionViaXhr: function (response) {
      let headers;
      if (this.settings.get('useMock')) {
        headers = {'Authorization': 'OktaAuthorizationProviderExtension ' + this.settings.get('mockDeviceFactorChallengeResponseJwt')};
      } else {
        headers = {'Authorization': 'OktaAuthorizationProviderExtension <valueToBeReplacedByExtension>'};
      }
      // Let the call be intercepted, populated and returned back
      $.get({
        url: response._links.extension.href,
        headers: headers, // Included to trigger CORS acceptance for the actual request that's being modified by the extension
        crossDomain: true // Included for force jQuery to omit the header indicating this is an XHR call
      }).done(function (data) {
        this._verifyUsingExtensionViaXhr(data, response);
      }.bind(this));
    },

    _verifyUsingExtensionViaXhr: function (data, response) {
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
      model.set('devicePostureJwt', data.devicePostureJwt);
      model.set('stateToken', response.stateToken);
      model.save = function () {
        var appState = this.options.appState;
        return this.startTransaction(function () {
          appState.trigger('loading', true);
          let data = {
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
    },

    _verifyUsingLoopback: function (response) {
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
      var successFn = function (data) {
        if (data.status === 'FAILED') {
          alert('Factor Verification failed using loopback!');
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
        let response = this.options.appState.get('lastAuthResponse');
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
      Util.performLoopback(options, successFn);
    },

    _verifyUsingUniversalLink: function (response) {
      let baseUrl = 'http://universal.link';
      if (this.settings.get('useMock')) {
        baseUrl = 'http://localhost:3000/universalLink/factorVerification';
      }
      var pollingUrl = this.settings.get('baseUrl') + '/api/v1/authn/introspect';
      let options = {
        context: this,
        baseUrl: baseUrl,
        pollingUrl: pollingUrl,
        status: response.status,
        nonce: response._embedded.factor._embedded.challenge.nonce,
        stateToken: response.stateToken,
        credentialId: response._embedded.factor.profile.credentialId,
        factorId: response._embedded.factor.id,
        domain: this.settings.get('baseUrl'),
        maxAttempts: 10
      };
      var successFn = function (data) {
        if (data.status === 'FAILED') {
          alert('Factor Verification failed using universal link!');
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
      Util.performUniversalLink(options, successFn);
    }

  });
});