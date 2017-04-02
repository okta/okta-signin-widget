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
    className: 'forgot-password',
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
        this.startTransaction(function(authClient) {
          return authClient.forgotPassword({
            username: self.settings.transformUsername(self.get('username'), Enums.FORGOT_PASSWORD),
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
      save: _.partial(Okta.loc, 'password.forgot.sendEmail', 'login'),
      title: _.partial(Okta.loc, 'password.reset', 'login'),
      formChildren: function () {
        var formChildren = [
          FormType.Input({
            placeholder: Okta.loc('password.forgot.email.or.username.placeholder', 'login'),
            name: 'username',
            input: TextBox,
            type: 'text',
            params: {
              innerTooltip: Okta.loc('password.forgot.email.or.username.tooltip', 'login'),
              icon: 'person-16-gray',
              required: true
            }
          })
        ];
        var smsEnabled = this.settings.get('features.smsRecovery');
        var callEnabled = this.settings.get('features.callRecovery');
        if (smsEnabled || callEnabled) {
          formChildren.push(FormType.View({
            View: Okta.View.extend({
              template: '\
                <p class="mobile-recovery-hint">\
                  {{i18n code="recovery.mobile.hint" bundle="login" arguments="mobileFactors"}}\
                </p>',
              getTemplateData: function () {
                var mobileFactors;
                if (smsEnabled && callEnabled) {
                  mobileFactors = Okta.loc('recovery.smsOrCall');
                }
                else if (callEnabled) {
                  mobileFactors = Okta.loc('recovery.call');
                }
                else {
                  mobileFactors = Okta.loc('recovery.sms');
                }
                return { mobileFactors : mobileFactors };
              }
            })
          }));
        }

        return formChildren;
      },
      initialize: function () {
        var form = this;

        if (this.settings.get('features.callRecovery')) {
          this.$el.addClass('forgot-password-call-enabled');
          this.addRecoveryFactorButton('call-button', 'password.forgot.call',
            Enums.RECOVERY_FACTOR_TYPE_CALL, form);
        }
        if (this.settings.get('features.smsRecovery')) {
          this.$el.addClass('forgot-password-sms-enabled');
          this.addRecoveryFactorButton('sms-button', 'password.forgot.sendText',
            Enums.RECOVERY_FACTOR_TYPE_SMS, form);
        }

        this.listenTo(this.state, 'contactSupport', function () {
          this.add(ContactSupport, '.o-form-error-container');
        });

        this.listenTo(this, 'save', function () {
          this.options.appState.set('username', this.model.get('username'));
        });
      },
      addRecoveryFactorButton: function (className, labelCode, factorType, form) {
        this.addButton({
          attributes: { 'data-se': className},
          type: 'button',
          className: 'button-primary ' + className,
          text: Okta.loc(labelCode, 'login'),
          action: function () {
            form.clearErrors();
            if (this.model.isValid()) {
              this.model.set('factorType', factorType);
              form.trigger('save', this.model);
            }
          }
        }, { prepend: true });
      }
    },
    Footer: Footer,

    initialize: function () {
      this.options.appState.unset('username');
    }
  });

});
