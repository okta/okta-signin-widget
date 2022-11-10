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
import FormController from 'v1/util/FormController';
import ValidationUtil from 'v1/util/ValidationUtil';
import Footer from 'v1/views/enroll-factors/Footer';
import TextBox from 'v1/views/shared/TextBox';
export default FormController.extend({
  className: 'enroll-password',
  Model: {
    props: {
      password: ['string', true],
      confirmPassword: ['string', true],
    },
    validate: function() {
      return ValidationUtil.validateFieldsMatch(
        this,
        'password',
        'confirmPassword',
        loc('password.enroll.error.match', 'login')
      );
    },
    save: function() {
      return this.doTransaction(function(transaction) {
        const factor = _.findWhere(transaction.factors, {
          factorType: 'password',
          provider: 'OKTA',
        });

        return factor.enroll({
          profile: {
            password: this.get('password'),
          },
        });
      });
    },
  },

  Form: {
    autoSave: true,
    title: _.partial(loc, 'enroll.password.setup', 'login'),
    inputs: function() {
      return [
        {
          label: loc('mfa.challenge.password.placeholder', 'login'),
          'label-top': true,
          className: 'o-form-fieldset o-form-label-top auth-passcode',
          name: 'password',
          input: TextBox,
          type: 'password',
        },
        {
          label: loc('password.confirmPassword.placeholder', 'login'),
          'label-top': true,
          className: 'o-form-fieldset o-form-label-top auth-passcode',
          name: 'confirmPassword',
          input: TextBox,
          type: 'password',
        },
      ];
    },
  },
  Footer: Footer,
});
