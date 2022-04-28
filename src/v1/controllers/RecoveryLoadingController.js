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

import FormController from 'v1/util/FormController';
export default FormController.extend({
  className: 'recovery-loading',

  Model: {},
  Form: {
    noButtonBar: true,
  },

  initialize: function(options) {
    const self = this;

    return this.model
      .startTransaction(function(authClient) {
        return authClient.verifyRecoveryToken({
          recoveryToken: options.token,
        });
      })
      .catch(function() {
        self.options.appState.trigger('loading', false);
        self.options.appState.trigger('removeLoading');
      });
  },

  preRender: function() {
    this.options.appState.trigger('loading', true);
  },

  trapAuthResponse: function() {
    this.options.appState.trigger('loading', false);
    return false;
  },
});
