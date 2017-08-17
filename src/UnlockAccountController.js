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
  'views/shared/ContactSupport',
  'views/shared/TextBox'
],
function (Okta, FormController, Enums, FormType, ValidationUtil, ContactSupport, TextBox) {

  var _ = Okta._;
  var noFactorsError = '<div class="okta-form-infobox-error infobox infobox-error" role="alert">\
    <span class="icon error-16"></span>\
    <p>{{i18n code="account.unlock.noFactorsEnabled" bundle="login"}}</p>\
  </div>';

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
      validate: function () {
        return ValidationUtil.validateUsername(this);
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
        });
      }
    },
    Form: {
      noButtonBar: true,
      title: _.partial(Okta.loc, 'account.unlock.title', 'login'),
      formChildren: function () {
        var smsEnabled = this.settings.get('features.smsRecovery');
        var emailEnabled = this.settings.get('features.emailRecovery');
        var noFactorsEnabled = !(smsEnabled || emailEnabled);
        var formChildren = [];
        var form = this;

        if(noFactorsEnabled) {
          this.trigger('noFactorsEnabled');
        }
        else {
          formChildren.push(FormType.Input({
            placeholder: Okta.loc('account.unlock.email.or.username.placeholder', 'login'),
            name: 'username',
            input: TextBox,
            type: 'text',
            params: {
              innerTooltip: Okta.loc('account.unlock.email.or.username.tooltip', 'login'),
              icon: 'person-16-gray'
            }
          }));
          if (smsEnabled) {
            formChildren.push(FormType.View({View: '\
              <p class="sms-hint">\
                {{i18n code="recovery.sms.hint" bundle="login"}}\
              </p>\
            '}));
            this.$el.addClass('forgot-password-sms-enabled');
            formChildren.push(this.addRecoveryFactorButton('sms-button', 'account.unlock.sendText',
              Enums.RECOVERY_FACTOR_TYPE_SMS, form));
          }
          if(emailEnabled) {
            this.$el.addClass('forgot-password-email-enabled');
            formChildren.push(this.addRecoveryFactorButton('email-button', 'account.unlock.sendEmail',
              Enums.RECOVERY_FACTOR_TYPE_EMAIL, form));
          }
        }

        return formChildren;
      },
      initialize: function () {

        this.listenTo(this, 'save', function () {
          this.options.appState.set('username', this.model.get('username'));
          this.model.save();
        });

        this.listenTo(this, 'noFactorsEnabled', function() {
          this.add(noFactorsError, '.o-form-error-container');
        });

        this.listenTo(this.state, 'contactSupport', function () {
          this.add(ContactSupport, '.o-form-error-container');
        });
      },
      addRecoveryFactorButton: function (className, labelCode, factorType, form) {
        return FormType.Button({
          attributes: { 'data-se': className},
          className: 'button button-primary button-wide ' + className,
          title: Okta.loc(labelCode, 'login'),
          click: function () {
            form.clearErrors();
            if (this.model.isValid()) {
              this.model.set('factorType', factorType);
              form.trigger('save', this.model);
            }
          }
        });
      }
    },
    Footer: Footer
  });

});
