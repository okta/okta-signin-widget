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

import { _, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
export default FormController.extend({
  className: 'password-reset-email-sent',
  Model: function() {
    return {
      local: {
        userFullName: ['string', false, this.options.appState.get('userFullName')],
      },
    };
  },

  Form: {
    title: _.partial(loc, 'password.forgot.emailSent.title', 'login'),
    subtitle: function() {
      const username = this.options.appState.get('username');

      return loc('password.forgot.emailSent.desc', 'login', [username]);
    },
    noButtonBar: true,
    attributes: { 'data-se': 'pwd-reset-email-sent' },
    formChildren: function() {
      let children = [
        FormType.View({
          View: View.extend({
            template: hbs(
              '\
              <span class="accessibility-text" role="status">{{alert}}</span>\
              '
            ),
            getTemplateData: function() {
              return { alert: loc('password.forgot.emailSent.title', 'login') };
            },
          }),
        }),
      ];

      if (!this.settings.get('features.hideBackToSignInForReset')) {
        children.push(
          FormType.Button({
            title: loc('goback', 'login'),
            className: 'button button-primary button-wide',
            attributes: { 'data-se': 'back-button' },
            click: function() {
              const self = this;

              return this.model
                .doTransaction(function(transaction) {
                  return transaction.cancel();
                })
                .then(function() {
                  self.state.set('navigateDir', Enums.DIRECTION_BACK);
                  self.options.appState.trigger('navigate', '');
                });
            },
          })
        );
      }

      return children;
    },
  },

  initialize: function(options) {
    this.settings.callGlobalSuccess(Enums.FORGOT_PASSWORD_EMAIL_SENT, {
      username: options.appState.get('username'),
    });
  },
});
