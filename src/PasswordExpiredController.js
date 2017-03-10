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
  'views/shared/TextBox'
],
function (Okta, FormController, Enums, FormType, ValidationUtil, FactorUtil, TextBox) {

  var _ = Okta._;

  var Footer = Okta.View.extend({
    template: '\
      {{#if passwordWarn}}\
        <a href="#" class="link help js-skip" data-se="skip-link">\
          {{i18n code="password.expiring.later" bundle="login"}}\
        </a>\
      {{/if}}\
      <a href="#" class="link help goto js-signout" data-se="signout-link">{{i18n code="signout" bundle="login"}}</a>\
    ',
    className: 'auth-footer clearfix',
    events: {
      'click .js-signout' : function (e) {
        e.preventDefault();
        var self = this;
        this.model.doTransaction(function (transaction) {
          return transaction.cancel();
        })
        .then(function () {
          self.state.set('navigateDir', Enums.DIRECTION_BACK);
          self.options.appState.trigger('navigate', '');
        });
      },
      'click .js-skip' : function (e) {
        e.preventDefault();
        this.model.doTransaction(function (transaction) {
          return transaction.skip();
        });
      }
    },
    getTemplateData: function () {
      return {passwordWarn: this.options.appState.get('isPwdExpiringSoon')};
    }
  });

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
        return this.doTransaction(function(transaction) {
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
        else {
          return Okta.loc('password.expired.title', 'login');
        }
      },
      subtitle: function () {
        if (this.options.appState.get('isPwdExpiringSoon')) {
          return Okta.loc('password.expiring.subtitle', 'login');
        }

        var policy = this.options.appState.get('policy');
        if (!policy || !policy.complexity) {
          return;
        }

        return FactorUtil.getPasswordComplexityDescription(policy.complexity);
      },
      formChildren: function () {
        return [
          FormType.Input({
            'label-top': true,
            label: false,
            placeholder: Okta.loc('password.oldPassword.placeholder', 'login'),
            name: 'oldPassword',
            input: TextBox,
            type: 'password',
            params: {
              innerTooltip: Okta.loc('password.oldPassword.tooltip', 'login'),
              icon: 'credentials-16'
            }
          }),
          FormType.Divider(),
          FormType.Input({
            'label-top': true,
            label: false,
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
            'label-top': true,
            label: false,
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
    Footer: Footer,

    initialize: function () {
      this.listenTo(this.form, 'save', function () {
        var processCreds = this.settings.get('processCreds');
        if (!_.isFunction(processCreds)) {
          this.model.save();
        } else {
          var creds = {
            username: this.options.appState.get('userEmail'),
            password: this.model.get('newPassword')
          };
          if (processCreds.length === 2) {
            processCreds(creds, _.bind(this.model.save, this.model));
          } else {
            processCreds(creds);
            this.model.save();
          }
        }
      });
    }

  });

});
