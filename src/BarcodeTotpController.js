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
  'views/enroll-factors/BarcodeView',
  'views/enroll-factors/Footer'
],
function (Okta, FactorUtil, FormController, FormType, RouterUtil, BarcodeView, Footer) {

  return FormController.extend({
    className: 'barcode-totp',
    Model: function () {
      return {
        local: {
          '__factorType__': ['string', false, this.options.factorType],
          '__provider__': ['string', false, this.options.provider]
        }
      };
    },

    Form: {
      title: function () {
        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
        return Okta.loc('enroll.totp.title', 'login', [factorName]);
      },
      subtitle: Okta.loc('mfa.scanBarcode', 'login'),
      save: Okta.loc('oform.next', 'login'),
      noCancelButton: true,
      attributes: { 'data-se': 'step-scan' },
      className: 'barcode-scan',

      formChildren: [
        FormType.View({View: BarcodeView})
      ]
    },

    Footer: Footer,

    initialize: function () {
      this.listenTo(this.form, 'save', function () {
        var url = RouterUtil.createActivateFactorUrl(this.model.get('__provider__'),
          this.model.get('__factorType__'), 'activate');
        this.options.appState.trigger('navigate', url);
      });
    }
  });

});
