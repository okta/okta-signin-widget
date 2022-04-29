/* eslint-disable max-depth */
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
  className: 'refresh-auth-state',

  Model: {},

  Form: {
    noButtonBar: true,
  },

  preRender: function() {
    const appState = this.options.appState;
    const token = this.options.token;

    this.model.startTransaction(function(authClient) {
      appState.trigger('loading', true);
      if (token) {
        return authClient.tx.introspect({
          stateToken: token,
        });
      }

      // get stateToken from cookie
      // currently only applies to old pipeline
      if (authClient.tx.exists()) {
        return authClient.tx.resume();
      }

      appState.trigger('navigate', '');
    });
  },

  remove: function() {
    this.options.appState.trigger('loading', false);
    return FormController.prototype.remove.apply(this, arguments);
  },
});
