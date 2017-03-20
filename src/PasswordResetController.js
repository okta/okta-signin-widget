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

define([
  'okta',
  'util/FormController',
  'util/FormType',
  'util/ValidationUtil',
  'util/FactorUtil',
  'views/shared/FooterSignout',
  'views/shared/TextBox'
],
function (Okta, FormController, FormType, ValidationUtil, FactorUtil, FooterSignout, TextBox) {

  var _ = Okta._;

  return FormController.extend({
    className: 'password-reset',
    Model: {
      props: {
        newPassword: ['string', true],
        confirmPassword: ['string', true]
      },
      validate: function () {
        return ValidationUtil.validatePasswordMatch(this);
      },
      save: function () {
        var self = this;
        return this.doTransaction(function(transaction) {
          return transaction
          .resetPassword({
            newPassword: self.get('newPassword')
          });
        });
      }
    },
    Form: {
      save: _.partial(Okta.loc, 'password.reset', 'login'),
      title: _.partial(Okta.loc, 'password.reset.title', 'login'),
      subtitle: function () {
        var policy = this.options.appState.get('policy');
        if (!policy || !policy.complexity) {
          return;
        }

        return FactorUtil.getPasswordComplexityDescription(policy.complexity);
      },
      formChildren: function () {
        return [
          FormType.Input({
            placeholder: Okta.loc('password.newPassword.placeholder', 'login'),
            name: 'newPassword',
            input: TextBox,
            type: 'password',
            params: {
              innerTooltip: Okta.loc('password.newPassword.tooltip', 'login'),
              icon: 'credentials-16'
            }
          }),
          FormType.Input({
            placeholder: Okta.loc('password.confirmPassword.placeholder', 'login'),
            name: 'confirmPassword',
            input: TextBox,
            type: 'password',
            params: {
              innerTooltip: Okta.loc('password.confirmPassword.tooltip', 'login'),
              icon: 'credentials-16'
            }
          })
        ];
      }
    },
    Footer: FooterSignout,

    initialize: function () {
      this.listenTo(this.form, 'save', function () {
        var creds = {
          username: this.options.appState.get('userEmail'),
          password: this.model.get('newPassword')
        };
        this.settings.processCreds(creds)
        .then(_.bind(this.model.save, this.model));
      });
    }

  });

});
