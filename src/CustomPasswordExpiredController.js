/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'views/expired-password/Footer'
],
function (Okta, FormController, FormType, Footer) {

  var _ = Okta._;
  var { Util } = Okta.internal.util;

  return FormController.extend({
    className: 'custom-password-expired',
    Model: {},
    Form: {
      noButtonBar: true,
      title: function () {
        var expiringSoon = this.options.appState.get('isPwdExpiringSoon'),
            numDays = this.options.appState.get('passwordExpireDays');
        if (expiringSoon && numDays > 0) {
          return Okta.loc('password.expiring.title', 'login', [numDays]);
        }
        else if (expiringSoon && numDays === 0) {
          return Okta.loc('password.expiring.today', 'login');
        }
        else if (expiringSoon) {
          return Okta.loc('password.expiring.soon', 'login');
        }
        else {
          return Okta.loc('password.expired.title', 'login');
        }
      },
      subtitle: function () {
        if (this.options.appState.get('isPwdExpiringSoon')) {
          return Okta.loc('password.expiring.subtitle', 'login') + ' ' +
                 Okta.loc('password.expired.custom.subtitle', 'login');
        }

        return Okta.loc('password.expired.custom.subtitle', 'login');
      },
      formChildren: function () {
        return [
          FormType.Button({
            title: _.partial(Okta.loc, 'password.expired.custom.submit', 'login',
                            [this.options.appState.get('passwordExpiredWebsiteName')]),
            className: 'button button-primary button-wide',
            attributes: {'data-se': 'custom-button'},
            click: function () {
              Util.redirect(this.options.appState.get('passwordExpiredLinkUrl'));
            }
          })
        ];
      }
    },
    Footer: Footer
  });

});
