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
  'util/FormType',
  'views/enroll-factors/Footer',
  'views/mfa-verify/HtmlErrorMessageView'
],
function (Okta, FormController, FormType,
  Footer, HtmlErrorMessageView) {

  return FormController.extend({
    className: 'enroll-totp',
    Model: function () {
      return {
        local: {
          '__deviceType__': 'string',
          '__factorType__': ['string', false, this.options.factorType],
          '__provider__': ['string', false, this.options.provider]
        }
      };
    },
    Form: {
      title: function () {
        //var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
        return Okta.loc('enroll.totp.title', 'login', ['Entrust']);
      },
      noButtonBar: true,
      attributes: { 'data-se': 'restrict-enroll' },

      formChildren: function () {
        const children = [
          FormType.View({
            View: new HtmlErrorMessageView({ message: Okta.loc('enroll.hotp.restricted', 'login') }),
          }),
        ];

        return children;
      }
    },

    Footer: Footer

  });

});
