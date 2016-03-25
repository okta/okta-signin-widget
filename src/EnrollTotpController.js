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
  'util/FactorUtil',
  'util/FormController',
  'util/FormType',
  'util/RouterUtil',
  'util/StoreLinks',
  'views/enroll-factors/BarcodeView',
  'views/enroll-factors/Footer'
],
function (Okta, FactorUtil, FormController, FormType,
  RouterUtil, StoreLinks, BarcodeView, Footer) {

  var _ = Okta._;

  var showWhenDeviceTypeSelected = {
    '__deviceType__': function (val) {
      return val !== undefined;
    }
  };

  var AppDownloadInstructionsView = Okta.View.extend({
    attributes: { 'data-se': 'app-download-instructions' },
    className: 'app-download-instructions',
    template: '\
      <p class="instructions-title">{{title}}</p>\
      <span class="app-logo {{appIcon}}"></span>\
      <p class="instructions">{{{appStoreLinkText}}}</p>\
    ',
    initialize: function () {
      this.listenTo(this.model, 'change:__deviceType__', this.render);
    },
    getTemplateData: function () {
      var appStoreLink, appIcon, appStoreName;
      var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
      appStoreName = StoreLinks.STORE[this.model.get('__deviceType__')];
      if (this.model.get('__provider__') === 'GOOGLE') {
        appStoreLink = StoreLinks.GOOGLE[this.model.get('__deviceType__')];
        appIcon = 'google-auth-38';
      } else {
        appStoreLink = StoreLinks.OKTA[this.model.get('__deviceType__')];
        appIcon = 'okta-verify-38';
      }
      return {
        title: Okta.loc('enroll.totp.installApp', 'login', [factorName]),
        appStoreLinkText: Okta.loc('enroll.totp.downloadApp',
          'login', [appStoreLink, factorName, appStoreName]),
        appIcon: appIcon
      };
    }
  });

  var EnrollTotpController = FormController.extend({
    className: 'enroll-totp',
    Model: function () {
      return {
        local: {
          '__deviceType__': 'string',
          '__factorType__': ['string', false, this.options.factorType],
          '__provider__': ['string', false, this.options.provider]
        },
        save: function () {
          return this.doTransaction(function(transaction) {
            var factor = _.findWhere(transaction.factors, {
              factorType: this.get('__factorType__'),
              provider: this.get('__provider__')
            });
            return factor.enroll();
          });
        }
      };
    },

    Form: {
      title: function () {
        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
        return Okta.loc('enroll.totp.title', 'login', [factorName]);
      },
      subtitle: Okta.loc('enroll.totp.selectDevice', 'login'),
      autoSave: true,
      noButtonBar: true,
      attributes: { 'data-se': 'step-device-type' },

      formChildren: function () {
        var inputOptions = {
          APPLE: '',
          ANDROID: ''
        };
        if (this.settings.get('features.windowsVerify') && this.model.get('__provider__') === 'OKTA') {
          inputOptions.WINDOWS = '';
        } else if (this.model.get('__provider__') === 'GOOGLE') {
          inputOptions.BLACKBERRY = '';
        }

        var children = [
          FormType.Input({
            name: '__deviceType__',
            type: 'radio',
            options: inputOptions,
            className: 'device-type-input'
          }),

          FormType.Divider({showWhen: showWhenDeviceTypeSelected}),

          FormType.View({
            View: AppDownloadInstructionsView,
            showWhen: showWhenDeviceTypeSelected
          }),

          FormType.Toolbar({
            noCancelButton: true,
            save: Okta.loc('oform.next', 'login'),
            showWhen: showWhenDeviceTypeSelected
          })
        ];

        return children;
      }
    },

    Footer: Footer

  });

  return EnrollTotpController;

});
