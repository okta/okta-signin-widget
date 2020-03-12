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
  'util/CountryUtil',
  'util/FormController',
  'util/FormType',
  'util/RouterUtil'
],
function (Okta, CountryUtil, FormController, FormType, RouterUtil) {

  var _ = Okta._;

  // Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
  // in network connection lost errors in Safari and IE.
  var PUSH_INTERVAL = 6000;

  var Footer = Okta.View.extend({
    template: hbs('\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="oform.back" bundle="login"}}\
      </a>\
    '),
    className: 'auth-footer',
    events: {
      'click .js-back' : function (e) {
        e.preventDefault();
        this.back();
      }
    },
    back: function () {
      var url = RouterUtil.createActivateFactorUrl(this.options.appState.get('activatedFactorProvider'),
        this.options.appState.get('activatedFactorType'), 'manual');
      this.options.appState.trigger('navigate', url);
    }
  });

  var emailSentForm = {
    title: _.partial(Okta.loc, 'enroll.totp.enrollViaEmail.title', 'login'),
    noButtonBar: true,
    attributes: { 'data-se': 'sent-email-activation-link' },
    formChildren: [
      FormType.View({
        View: Okta.View.extend({
          template: hbs('\
            <p>{{i18n code="enroll.totp.enrollViaEmail.msg" bundle="login"}}</p>\
            <p class="email-address">{{email}}</p>\
          '),
          getTemplateData: function () {
            return {email: this.options.appState.get('userEmail')};
          }
        })
      })
    ]
  };

  var smsSentForm = {
    title: _.partial(Okta.loc, 'enroll.totp.enrollViaSms.title', 'login'),
    noButtonBar: true,
    attributes: { 'data-se': 'sent-sms-activation-link' },
    formChildren: [
      FormType.View({
        View: Okta.View.extend({
          template: hbs('\
            <p>{{i18n code="enroll.totp.enrollViaSms.msg" bundle="login"}}</p>\
            <p class="phone-number">{{phoneNumber}}</p>\
          '),
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
      return FormController.prototype.remove.apply(this, arguments);
    },

    pollForEnrollment: function () {
      return this.model.doTransaction(function (transaction) {
        return transaction.poll(PUSH_INTERVAL);
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
