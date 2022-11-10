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

import { _, loc } from '@okta/courage';
import Enums from 'util/Enums';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
export default FormController.extend({
  className: 'account-unlock-email-sent',
  Model: function() {
    return {
      local: {
        userFullName: ['string', false, this.options.appState.get('userFullName')],
      },
    };
  },

  Form: {
    title: _.partial(loc, 'account.unlock.emailSent.title', 'login'),
    subtitle: function() {
      const username = this.options.appState.get('username');

      return loc('account.unlock.emailSent.desc', 'login', [username]);
    },
    noButtonBar: true,
    attributes: { 'data-se': 'unlock-email-sent' },
    formChildren: function() {
      return [
        FormType.Button({
          title: loc('goback', 'login'),
          className: 'button button-primary button-wide',
          attributes: { 'data-se': 'back-button' },
          click: function() {
            this.state.set('navigateDir', Enums.DIRECTION_BACK);
            this.options.appState.trigger('navigate', '');
          },
        }),
      ];
    },
  },

  initialize: function(options) {
    this.settings.callGlobalSuccess(Enums.UNLOCK_ACCOUNT_EMAIL_SENT, {
      username: options.appState.get('username'),
    });
  },
});
