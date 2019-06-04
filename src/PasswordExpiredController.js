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
  'util/Enums',
  'util/FormType',
  'util/ValidationUtil',
  'util/FactorUtil',
  'util/Util',
  'views/expired-password/Footer',
  'views/shared/TextBox'
],
function (Okta, FormController, Enums, FormType, ValidationUtil, FactorUtil, Util, Footer, TextBox) {

  var _ = Okta._;

  return FormController.extend({
    className: 'password-expired',
    Model: {
      props: {
        oldPassword: ['string', true],
        newPassword: ['string', true],
        confirmPassword: ['string', true]
      },
      validate: function () {
        return ValidationUtil.validatePasswordMatch(this);
      },
      save: function () {
        this.trigger('save');
        return this.doTransaction(function (transaction) {
          return transaction.changePassword({
            oldPassword: this.get('oldPassword'),
            newPassword: this.get('newPassword')
          });
        });
      }
    },
    Form: {
      save: _.partial(Okta.loc, 'password.expired.submit', 'login'),
      title: function () {
        var expiringSoon = this.options.appState.get('isPwdExpiringSoon'),
            numDays = this.options.appState.get('passwordExpireDays');
        if (expiringSoon && numDays > 0) {
          return Okta.loc('password.expiring.title', 'login', [numDays]);
        }
        else if (expiringSoon && numDays === 0) {
          return Okta.loc('password.expiring.today', 'login');
        }
        else if (expiringSoon) {
          return Okta.loc('password.expiring.soon', 'login');
        }
        else {
          return this.settings.get('brandName') ?
            Okta.loc('password.expired.title.specific', 'login', [this.settings.get('brandName')]) :
            Okta.loc('password.expired.title.generic', 'login');
        }
      },
      subtitle: function () {
        if (this.options.appState.get('isPwdExpiringSoon')) {
          return this.settings.get('brandName') ?
            Okta.loc('password.expiring.subtitle.specific', 'login', [this.settings.get('brandName')]) :
            Okta.loc('password.expiring.subtitle.generic', 'login');
        }

        var policy = this.options.appState.get('policy');
        if (!policy) {
          return;
        }

        return FactorUtil.getPasswordComplexityDescription(policy);
      },
      formChildren: function () {
        return [
          FormType.Input({
            'label-top': true,
            label: Okta.loc('password.oldPassword.placeholder', 'login'),
            explain: Util.createInputExplain(
              'password.oldPassword.tooltip',
              'password.oldPassword.placeholder',
              'login'),
            'explain-top': true,
            name: 'oldPassword',
            input: TextBox,
            type: 'password'
          }),
          FormType.Divider(),
          FormType.Input({
            className: 'margin-btm-5',
            'label-top': true,
            label: Okta.loc('password.newPassword.placeholder', 'login'),
            explain: Util.createInputExplain(
              'password.newPassword.tooltip',
              'password.newPassword.placeholder',
              'login'),
            'explain-top': true,
            name: 'newPassword',
            input: TextBox,
            type: 'password'
          }),
          FormType.Input({
            'label-top': true,
            label: Okta.loc('password.confirmPassword.placeholder', 'login'),
            explain: Util.createInputExplain(
              'password.confirmPassword.tooltip',
              'password.confirmPassword.placeholder',
              'login'),
            'explain-top': true,
            name: 'confirmPassword',
            input: TextBox,
            type: 'password'
          })
        ];
      }
    },
    Footer: Footer,

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
