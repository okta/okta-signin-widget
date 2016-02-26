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
  'util/CountryUtil',
  'util/FormController',
  'util/FormType',
  'util/RouterUtil'
],
function (Okta, CountryUtil, FormController, FormType, RouterUtil) {

  // Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
  // in network connection lost errors in Safari and IE.
  var PUSH_INTERVAL = 6000;

  var Footer = Okta.View.extend({
    template: '\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="oform.back" bundle="login"}}\
      </a>\
    ',
    className: 'auth-footer',
    events: {
      'click .js-back' : function (e) {
        e.preventDefault();
        this.back();
      }
    },
    back: function() {
      var url = RouterUtil.createActivateFactorUrl(this.options.appState.get('activatedFactorProvider'),
          this.options.appState.get('activatedFactorType'), 'manual');
      this.options.appState.trigger('navigate', url);
    }
  });

  var emailSentForm = {
    title: Okta.loc('enroll.totp.enrollViaEmail.title', 'login'),
    noButtonBar: true,
    attributes: { 'data-se': 'sent-email-activation-link' },
    formChildren: [
      FormType.View({
        View: Okta.View.extend({
          template: '\
            <p>{{i18n code="enroll.totp.enrollViaEmail.msg" bundle="login"}}</p>\
            <p class="email-address">{{email}}</p>\
          ',
          getTemplateData: function () {
            return {email: this.options.appState.get('userEmail')};
          }
        })
      })
    ]
  };

  var smsSentForm = {
    title: Okta.loc('enroll.totp.enrollViaSms.title', 'login'),
    noButtonBar: true,
    attributes: { 'data-se': 'sent-sms-activation-link' },
    formChildren: [
      FormType.View({
        View: Okta.View.extend({
          template: '\
            <p>{{i18n code="enroll.totp.enrollViaSms.msg" bundle="login"}}</p>\
            <p class="phone-number">{{phoneNumber}}</p>\
          ',
          getTemplateData: function () {
            return {phoneNumber: this.model.get('fullPhoneNumber')};
          }
        })
      })
    ]
  };

  return FormController.extend({
    className: 'enroll-activation-link-sent',
    Model: function () {
      return {
        local: {
          countryCode: ['string', false, this.options.appState.get('userCountryCode')],
          phoneNumber: ['string', false, this.options.appState.get('userPhoneNumber')],
          '__factorType__': ['string', false, this.options.factorType],
          '__provider__': ['string', false, this.options.provider]
        },
        derived: {
          countryCallingCode: {
            deps: ['countryCode'],
            fn: function (countryCode) {
              return '+' + CountryUtil.getCallingCodeForCountry(countryCode);
            }
          },
          fullPhoneNumber: {
            deps: ['countryCallingCode', 'phoneNumber'],
            fn: function (countryCallingCode, phoneNumber) {
              return countryCallingCode + phoneNumber;
            }
          }
        }
      };
    },

    Form: function () {
      var activationType = this.options.appState.get('factorActivationType');
      switch (activationType) {
      case 'SMS':
        return smsSentForm;
      case 'EMAIL':
        return emailSentForm;
      default:
        throw new Error('Unknown activation option: ' + activationType);
      }
    },

    Footer: Footer,

    initialize: function () {
      this.pollForEnrollment();
    },

    remove: function () {
      var authClient = this.settings.getAuthClient().current;
      if (authClient.stopEnrollFactorPoll) {
        authClient.stopEnrollFactorPoll();
      }
      return FormController.prototype.remove.apply(this, arguments);
    },

    pollForEnrollment: function () {
      var self = this;
      self.settings.getAuthClient().current
        .startEnrollFactorPoll(PUSH_INTERVAL)
        .fail(function (err) {
          self.model.trigger('error', self.model, err.xhr);
        });
    },

    trapAuthResponse: function () {
      if (this.options.appState.get('isWaitingForActivation')) {
        this.pollForEnrollment();
        return true;
      }
    }
  });

});
