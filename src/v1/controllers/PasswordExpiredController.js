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

import { _, loc } from '@okta/courage';
import FactorUtil from 'util/FactorUtil';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import Util from 'util/Util';
import ValidationUtil from 'v1/util/ValidationUtil';
import Footer from 'v1/views/expired-password/Footer';
import PasswordRequirements from 'v1/views/shared/PasswordRequirements';
import TextBox from 'v1/views/shared/TextBox';

export default FormController.extend({
  className: 'password-expired',
  Model: {
    props: {
      oldPassword: ['string', true],
      newPassword: ['string', true],
      confirmPassword: ['string', true],
    },
    validate: function() {
      return ValidationUtil.validatePasswordMatch(this);
    },
    save: function() {
      this.trigger('save');
      return this.doTransaction(function(transaction) {
        return transaction.changePassword({
          oldPassword: this.get('oldPassword'),
          newPassword: this.get('newPassword'),
        });
      });
    },
  },
  Form: {
    save: _.partial(loc, 'password.expired.submit', 'login'),
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
          ? loc('password.expiring.subtitle.specific', 'login', [this.settings.get('brandName')])
          : loc('password.expiring.subtitle.generic', 'login');
      }

      const policy = this.options.appState.get('policy');

      if (!policy || this.settings.get('features.showPasswordRequirementsAsHtmlList')) {
        return;
      }

      return FactorUtil.getPasswordComplexityDescription(policy);
    },
    parseErrorMessage: function(responseJSON) {
      const policy = this.options.appState.get('policy');

      if (!!policy && this.settings.get('features.showPasswordRequirementsAsHtmlList')) {
        /*
          - This is a specific case where don't want to repeat the requirements again in the error message, since this
            is already shown in the description. The description as bullet-points itself should give an indication
            of the requirements.
          - We cannot check for error code this in this case, as the error code is shared between
            requirements not met message, common password message, etc. So error summary is the only differentiating
            factor. Replace the password requirements string with empty string in this case.
        */
        responseJSON = FactorUtil.removeRequirementsFromError(responseJSON, policy);
      }
      return responseJSON;
    },
    formChildren: function() {
      let children = [];

      if (this.settings.get('features.showPasswordRequirementsAsHtmlList')) {
        children.push(
          FormType.View({
            View: new PasswordRequirements({ policy: this.options.appState.get('policy') }),
          })
        );
      }

      children = children.concat([
        FormType.Input({
          'label-top': true,
          label: loc('password.oldPassword.placeholder', 'login'),
          explain: Util.createInputExplain('password.oldPassword.tooltip', 'password.oldPassword.placeholder', 'login'),
          'explain-top': true,
          name: 'oldPassword',
          input: TextBox,
          type: 'password',
        }),
        FormType.Divider(),
        FormType.Input({
          className: 'margin-btm-5',
          'label-top': true,
          label: loc('password.newPassword.placeholder', 'login'),
          explain: Util.createInputExplain('password.newPassword.tooltip', 'password.newPassword.placeholder', 'login'),
          'explain-top': true,
          name: 'newPassword',
          input: TextBox,
          type: 'password',
        }),
        FormType.Input({
          'label-top': true,
          label: loc('password.confirmPassword.placeholder', 'login'),
          explain: Util.createInputExplain(
            'password.confirmPassword.tooltip',
            'password.confirmPassword.placeholder',
            'login'
          ),
          'explain-top': true,
          name: 'confirmPassword',
          input: TextBox,
          type: 'password',
        }),
      ]);

      return children;
    },
  },
  Footer: Footer,

  initialize: function() {
    this.listenTo(this.form, 'save', function() {
      const creds = {
        username: this.options.appState.get('userEmail'),
        password: this.model.get('newPassword'),
      };

      this.settings.processCreds(creds).then(_.bind(this.model.save, this.model));
    });
  },
});
