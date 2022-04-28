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

import { _, loc } from 'okta';
import FactorUtil from 'util/FactorUtil';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import Util from 'util/Util';
import ValidationUtil from 'v1/util/ValidationUtil';
import FooterSignout from 'v1/views/shared/FooterSignout';
import PasswordRequirements from 'v1/views/shared/PasswordRequirements';
import TextBox from 'v1/views/shared/TextBox';
export default FormController.extend({
  className: 'password-reset',
  Model: {
    props: {
      newPassword: ['string', true],
      confirmPassword: ['string', true],
    },
    validate: function() {
      return ValidationUtil.validatePasswordMatch(this);
    },
    save: function() {
      this.trigger('save');
      const self = this;

      return this.doTransaction(function(transaction) {
        return transaction.resetPassword({
          newPassword: self.get('newPassword'),
        });
      });
    },
  },
  Form: {
    save: _.partial(loc, 'password.reset', 'login'),
    title: function() {
      return this.settings.get('brandName')
        ? loc('password.reset.title.specific', 'login', [this.settings.get('brandName')])
        : loc('password.reset.title.generic', 'login');
    },
    subtitle: function() {
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
          className: 'margin-btm-5',
          label: loc('password.newPassword.placeholder', 'login'),
          'label-top': true,
          explain: Util.createInputExplain('password.newPassword.tooltip', 'password.newPassword.placeholder', 'login'),
          'explain-top': true,
          name: 'newPassword',
          input: TextBox,
          type: 'password',
          autoComplete: 'new-password',
        }),
        FormType.Input({
          label: loc('password.confirmPassword.placeholder', 'login'),
          'label-top': true,
          explain: Util.createInputExplain(
            'password.confirmPassword.tooltip',
            'password.confirmPassword.placeholder',
            'login'
          ),
          'explain-top': true,
          name: 'confirmPassword',
          input: TextBox,
          type: 'password',
          autoComplete: 'new-password',
        }),
      ]);
      return children;
    },
  },

  initialize: function() {
    this.listenTo(this.form, 'save', function() {
      const creds = {
        username: this.options.appState.get('userEmail'),
        password: this.model.get('newPassword'),
      };

      this.settings.processCreds(creds).then(_.bind(this.model.save, this.model));
    });

    if (!this.settings.get('features.hideBackToSignInForReset')) {
      this.addFooter(FooterSignout);
    }
  },
});
