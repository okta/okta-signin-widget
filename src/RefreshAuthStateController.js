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

define(['okta', 'util/FormController'], function (Okta, FormController) {

  return FormController.extend({
    className: 'refresh-auth-state',

    Model: {},

    Form: {
      noButtonBar: true
    },

    preRender: function () {
      var token = this.options.token;
      var appState = this.options.appState;
      this.model.startTransaction(function(authClient) {
        if (token) {
          appState.trigger('loading', true);
          return authClient.tx.resume({
            stateToken: token
          });
        }

        if (authClient.tx.exists()) {
          appState.trigger('loading', true);
          return authClient.tx.resume();
        }

        appState.trigger('navigate', '');
      });
    },

    remove: function () {
      this.options.appState.trigger('loading', false);
      return FormController.prototype.remove.apply(this, arguments);
    }

  });
});
