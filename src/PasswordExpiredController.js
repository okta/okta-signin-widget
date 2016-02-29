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
  'util/FormType'
],
function (Okta, FormController, Enums, FormType) {

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
        if (this.get('newPassword') !== this.get('confirmPassword')) {
          return {
            confirmPassword: Okta.loc('password.error.match', 'login')
          };
        }
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
      save: Okta.loc('password.expired.submit', 'login'),
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
      },
      formChildren: [
        FormType.Input({
          'label-top': true,
          label: false,
          placeholder: Okta.loc('password.oldPassword.placeholder', 'login'),
          name: 'oldPassword',
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
          type: 'password',
          params: {
            innerTooltip: Okta.loc('password.confirmPassword.tooltip', 'login'),
            icon: 'credentials-16'
          }
        })
      ]
    },
    Footer: Footer,

    initialize: function () {
      this.listenTo(this.form, 'save', function () {
        var processCreds = this.settings.get('processCreds');
        if (_.isFunction(processCreds)) {
          processCreds({
            username: this.options.appState.get('userEmail'),
            password: this.model.get('newPassword')
          });
        }
        this.model.save();
      });
    }

  });

});
