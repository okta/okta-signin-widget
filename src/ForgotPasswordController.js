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

import hbs from 'handlebars-inline-precompile';

define([
  'okta',
  'util/FormController',
  'util/Enums',
  'util/FormType',
  'util/ValidationUtil',
  'util/Util',
  'views/shared/ContactSupport',
  'views/shared/TextBox'
],
function (Okta, FormController, Enums, FormType, ValidationUtil, Util, ContactSupport, TextBox) {

  var _ = Okta._;
  var noFactorsError = Okta.View.extend({
    template: hbs`
      <div class="okta-form-infobox-error infobox infobox-error" role="alert">
        <span class="icon error-16"></span>
        <p>{{i18n code="password.forgot.noFactorsEnabled" bundle="login"}}</p>
      </div>
    `
  });

  var Footer = Okta.View.extend({
    template: hbs('\
      {{#unless hideBackToSignInForReset}}\
        <a href="#" class="link help js-back" data-se="back-link">\
          {{i18n code="goback" bundle="login"}}\
        </a>\
      {{/unless}}\
      {{#if helpSupportNumber}}\
      <a href="#" class="link goto js-contact-support">\
        {{i18n code="mfa.noAccessToEmail" bundle="login"}}\
      </a>\
      {{/if}}\
    '),
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
      return {
        hideBackToSignInForReset: this.settings.get('features.hideBackToSignInForReset'),
        helpSupportNumber: this.settings.get('helpSupportNumber')
      };
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
        factorType: ['string', true]
      },
      validate: function () {
        return ValidationUtil.validateUsername(this);
      },
      save: function () {
        var self = this;
        var relayState = this.settings.get('relayState');
        this.startTransaction(function (authClient) {
          return authClient.forgotPassword({
            username: self.settings.transformUsername(self.get('username'), Enums.FORGOT_PASSWORD),
            factorType: self.get('factorType'),
            relayState: relayState
          });
        })
          .catch(function () {
          //need empty fail handler on model to display errors on form
          });
      }
    },
    Form: {
      noButtonBar: true,
      title: _.partial(Okta.loc, 'password.reset', 'login'),
      formChildren: function () {
        /*eslint complexity: [2, 9] max-statements: [2, 23] */
        var smsEnabled = this.settings.get('features.smsRecovery');
        var callEnabled = this.settings.get('features.callRecovery');
        var emailEnabled = this.settings.get('features.emailRecovery');
        var noFactorsEnabled = !(smsEnabled || callEnabled || emailEnabled);
        var formChildren = [];

        if (noFactorsEnabled) {
          this.add(noFactorsError, '.o-form-error-container');
        }
        else {
          formChildren.push(FormType.Input({
            label: Okta.loc('password.forgot.email.or.username.placeholder', 'login'),
            'label-top': true,
            explain: Util.createInputExplain(
              'password.forgot.email.or.username.tooltip',
              'password.forgot.email.or.username.placeholder',
              'login'),
            'explain-top': true,
            name: 'username',
            input: TextBox,
            inputId: 'account-recovery-username',
            type: 'text',
            inlineValidation: false
          }));
          if (smsEnabled || callEnabled) {
            formChildren.push(FormType.View({
              View: Okta.View.extend({
                template: hbs('\
                  <p class="mobile-recovery-hint">\
                    {{i18n code="recovery.mobile.hint" bundle="login" arguments="mobileFactors"}}\
                  </p>'),
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
          if (smsEnabled) {
            this.$el.addClass('forgot-password-sms-enabled');
            formChildren.push(this.createRecoveryFactorButton('sms-button', 'password.forgot.sendText',
              Enums.RECOVERY_FACTOR_TYPE_SMS, this));
            this.setDefaultFactorType(Enums.RECOVERY_FACTOR_TYPE_SMS);
          }
          if (callEnabled) {
            this.$el.addClass('forgot-password-call-enabled');
            formChildren.push(this.createRecoveryFactorButton('call-button', 'password.forgot.call',
              Enums.RECOVERY_FACTOR_TYPE_CALL, this));
            this.setDefaultFactorType(Enums.RECOVERY_FACTOR_TYPE_CALL);
          }
          if (emailEnabled) {
            this.$el.addClass('forgot-password-email-enabled');
            formChildren.push(this.createRecoveryFactorButton('email-button', 'password.forgot.sendEmail',
              Enums.RECOVERY_FACTOR_TYPE_EMAIL, this));
            this.setDefaultFactorType(Enums.RECOVERY_FACTOR_TYPE_EMAIL);
          }
        }

        return formChildren;
      },
      initialize: function () {

        this.listenTo(this.state, 'contactSupport', function () {
          this.add(ContactSupport, '.o-form-error-container');
        });

        this.listenTo(this, 'save', function () {
          this.options.appState.set('username', this.model.get('username'));
          this.model.save();
        });
      },
      setDefaultFactorType: function (factorType) {
        if (_.isEmpty(this.model.get('factorType'))) {
          this.model.set('factorType', factorType);
        }
      },
      createRecoveryFactorButton: function (className, labelCode, factorType, form) {
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
    Footer: Footer,

    initialize: function () {
      this.options.appState.unset('username');
    }
  });

});
