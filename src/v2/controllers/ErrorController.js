/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { loc, View } from 'okta';
import ErrorCodes from 'util/ErrorCodes';
import BaseLoginModel from '../models/BaseLoginModel';
import BaseLoginController from './BaseLoginController';
export default BaseLoginController.extend({
  className: 'error-controller',
  initialize: function (options) {
    this.options = options || {};
    this.model = new BaseLoginModel({
      settings: this.settings,
      appState: this.options.appState,
    });
    const error = this.options.appState.get('flashError');

    if (error && error.errorCode === ErrorCodes.INVALID_TOKEN_EXCEPTION) {
      this.addErrorMessage(loc('error.expired.session', 'login'));
    } else {
      this.addErrorMessage('Widget bootstrapped with no stateToken');
    }
  },
  addErrorMessage: function (err) {
    this.$el.find('.error-message').remove();
    const ErrorControllererrorView = View.extend({
      template: '<p class="error-message">{{msg}}</p>',
      getTemplateData: function () {
        const msg = err;

        return {
          msg: msg,
        };
      },
    });

    this.add(ErrorControllererrorView);
  },
});
