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
  'util/FormController'
], function (Okta, Util, FormController) {

  const $ = Okta.$;
  const _ = Okta._;

  return FormController.extend({

    className: 'device-probe',

    Model: {
      url: '',
      props: {
        stateToken: 'string',
        challengeResponse: 'string'
      },
    },

    Form: {
      noButtonBar: true,
    },
  
    initialize: function () {
      let response = this.options.appState.get('lastAuthResponse');
      let baseUrl = 'http://localhost:';
      if (this.settings.get('useMock')) {
        baseUrl = '/loopback/deviceProbe/';
      }
      let options = {
        context: this,
        baseUrl: baseUrl,
        requestType: 'deviceChallenge',
        port: 41236,
        nonce: response._embedded.probeInfo.nonce,
        maxAttempts: 5
      };
      var successFn = function (data) {
        this.model.url = response._links.next.href;
        this.model.set('stateToken', response.stateToken);
        this.model.set('challengeResponse', data.jwt);
        this.model.save()
          .done(function (data) {
            this.options.appState.trigger('change:transaction', this.options.appState, { data });
          }.bind(this));
      };
      Util.performLoopback(options, successFn);
    }

  });
});
