/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
    className: 'forgot-password',
    Model: {
      props: {
        username: ['string', true],
        factorType: ['string', true, Enums.RECOVERY_FACTOR_TYPE_EMAIL]
      },
      save: function () {
        var self = this;
        this.startTransaction(function(authClient) {
          return authClient.forgotPassword({
            username: self.get('username'),
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
      save: Okta.loc('password.forgot.sendEmail', 'login'),
      title: Okta.loc('password.reset', 'login'),
      formChildren: [
        FormType.Input({
          placeholder: Okta.loc('password.forgot.email.or.username.placeholder', 'login'),
          name: 'username',
          type: 'text',
          params: {
            innerTooltip: Okta.loc('password.forgot.email.or.username.tooltip', 'login'),
            icon: 'person-16-gray'
          }
        })
      ],
      initialize: function () {
        var form = this;
        if (this.settings.get('features.smsRecovery')) {
          this.$el.addClass('forgot-password-sms-enabled');
          this.addButton({
            attributes: { 'data-se': 'sms-button'},
            type: 'button',
            className: 'button-primary sms-button',
            text: Okta.loc('password.forgot.sendText', 'login'),
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

        this.listenTo(this, 'save', function () {
          this.options.appState.set('username', this.model.get('username'));
        });
      }
    },
    Footer: Footer,

    initialize: function () {
      this.options.appState.unset('username');
    }
  });

});
