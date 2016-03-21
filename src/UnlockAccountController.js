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
  'views/shared/ContactSupport'
],
function (Okta, FormController, Enums, FormType, ContactSupport) {

  var Footer = Okta.View.extend({
    template: '\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="goback" bundle="login"}}\
      </a>\
      {{#if helpSupportNumber}}\
      <a href="#" class="link goto js-contact-support">\
        {{i18n code="mfa.noAccessToEmail" bundle="login"}}\
      </a>\
      {{/if}}\
    ',
    className: 'auth-footer',
    events: {
      'click .js-back' : function (e) {
        e.preventDefault();
        this.back();
      },
      'click .js-contact-support': function (e) {
        e.preventDefault();
        this.state.trigger('contactSupport');
        this.$('.js-contact-support').hide();
      }
    },
    getTemplateData: function () {
      return this.settings.pick('helpSupportNumber');
    },
    back: function () {
      this.state.set('navigateDir', Enums.DIRECTION_BACK);
      this.options.appState.trigger('navigate', '');
    }
  });

  return FormController.extend({
    className: 'account-unlock',
    Model: {
      props: {
        username: ['string', true],
        factorType: ['string', true, Enums.RECOVERY_FACTOR_TYPE_EMAIL]
      },
      save: function () {
        var self = this;
        return this.startTransaction(function (authClient) {
          return authClient.unlockAccount({
            username: self.settings.transformUsername(self.get('username'), Enums.UNLOCK_ACCOUNT),
            factorType: self.get('factorType')
          });
        })
        .fail(function () {
          self.set('factorType', Enums.RECOVERY_FACTOR_TYPE_EMAIL);
        });
      }
    },
    Form: {
      autoSave: true,
      save: Okta.loc('account.unlock.sendEmail', 'login'),
      title: Okta.loc('account.unlock.title', 'login'),
      formChildren: [
        FormType.Input({
          placeholder: Okta.loc('account.unlock.email.or.username.placeholder', 'login'),
          name: 'username',
          type: 'text',
          params: {
            innerTooltip: Okta.loc('account.unlock.email.or.username.tooltip', 'login'),
            icon: 'person-16-gray'
          }
        })
      ],
      initialize: function () {
        var form = this;

        this.listenTo(this, 'save', function () {
          this.options.appState.set('username', this.model.get('username'));
        });

        if (this.settings.get('features.smsRecovery')) {
          this.$el.addClass('forgot-password-sms-enabled');
          this.addButton({
            attributes: { 'data-se': 'sms-button'},
            type: 'button',
            className: 'button-primary sms-button',
            text: Okta.loc('account.unlock.sendText', 'login'),
            action: function () {
              form.clearErrors();
              if (this.model.isValid()) {
                this.model.set('factorType', Enums.RECOVERY_FACTOR_TYPE_SMS);
                form.trigger('save', this.model);
              }
            }
          }, { prepend: true });
        }

        this.listenTo(this.state, 'contactSupport', function () {
          this.add(ContactSupport, '.o-form-error-container');
        });
      }
    },
    Footer: Footer
  });

});
