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
          return this.settings.getAuthClient().current
            .getFactorByTypeAndProvider(this.get('__factorType__'), this.get('__provider__'))
            .enrollFactor()
            .fail(_.bind(function (err) {
              this.trigger('error', this, err.xhr);
            }, this));
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
