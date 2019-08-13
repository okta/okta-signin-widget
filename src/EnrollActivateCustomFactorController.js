/*!
 * Copyright (c) 2019-2020, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'models/Factor',
  'util/FormType',
  'EnrollCustomFactorController',
  'views/mfa-verify/HtmlErrorMessageView',
],
function (Okta, Factor, FormType, EnrollCustomFactorController, HtmlErrorMessageView) {

  var { Util } = Okta.internal.util;

  return EnrollCustomFactorController.extend({
    Model: {
      local: {
        provider: 'string',
        factorType: 'string'
      },
      save: function () {
        return this.manageTransaction(() => {
          var url = this.appState.get('enrollCustomFactorRedirectUrl');
          if(url !== null) {
            Util.redirect(url);
          }
        });
      }
    },

    Form: function () {
      var factor = new Factor.Model(this.options.appState.get('factor'), this.toJSON());
      var vendorName = factor.get('vendorName');
      var subtitle = Okta.loc('enroll.customFactor.subtitle', 'login', [vendorName]);
      var saveText = Okta.loc('enroll.customFactor.save', 'login');
      return {
        autoSave: true,
        title: vendorName,
        subtitle: subtitle,
        save: saveText,
        formChildren: function () {
          var result = [];
          if (this.options.appState.get('isFactorResultFailed')) {
            result.push(
              FormType.View(
                { View: new HtmlErrorMessageView(
                  { message: this.options.appState.get('factorResultErrorMessage') }) },
                { selector: '.o-form-error-container'}
              )
            );
          }
          return result;
        }
      };
    },
  });

});
