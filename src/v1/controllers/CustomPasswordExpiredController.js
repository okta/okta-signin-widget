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

import { _, loc, internal } from '@okta/courage';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import Footer from 'v1/views/expired-password/Footer';
const { Util } = internal.util;
export default FormController.extend({
  className: 'custom-password-expired',
  Model: {},
  Form: {
    noButtonBar: true,
    title: function() {
      const expiringSoon = this.options.appState.get('isPwdExpiringSoon');
      const numDays = this.options.appState.get('passwordExpireDays');

      if (expiringSoon && numDays > 0) {
        return loc('password.expiring.title', 'login', [numDays]);
      } else if (expiringSoon && numDays === 0) {
        return loc('password.expiring.today', 'login');
      } else if (expiringSoon) {
        return loc('password.expiring.soon', 'login');
      } else {
        return this.settings.get('brandName')
          ? loc('password.expired.title.specific', 'login', [this.settings.get('brandName')])
          : loc('password.expired.title.generic', 'login');
      }
    },
    subtitle: function() {
      if (this.options.appState.get('isPwdExpiringSoon')) {
        return this.settings.get('brandName')
          ? loc('password.expiring.soon.subtitle.specific', 'login', [this.settings.get('brandName')])
          : loc('password.expiring.soon.subtitle.generic', 'login');
      }

      return loc('password.expired.custom.subtitle', 'login');
    },
    formChildren: function() {
      return [
        FormType.Button({
          title: _.partial(loc, 'password.expired.custom.submit', 'login', [
            this.options.appState.get('passwordExpiredWebsiteName'),
          ]),
          className: 'button button-primary button-wide',
          attributes: { 'data-se': 'custom-button' },
          click: function() {
            Util.redirect(this.options.appState.get('passwordExpiredLinkUrl'));
          },
        }),
      ];
    },
  },
  Footer: Footer,
});
