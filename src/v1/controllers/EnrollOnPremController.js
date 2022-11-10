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
import FormType from 'v1/util/FormType';
import Util from 'util/Util';
import Footer from 'v1/views/enroll-factors/Footer';
import TextBox from 'v1/views/shared/TextBox';

function isRSA(provider) {
  return provider === 'RSA';
}

function getClassName(provider) {
  return isRSA(provider) ? 'enroll-rsa' : 'enroll-onprem';
}

export default FormController.extend({
  className: function() {
    return getClassName(this.options.provider);
  },
  Model: function() {
    const provider = this.options.provider;
    const factors = this.options.appState.get('factors');
    const factor = factors.findWhere(_.pick(this.options, 'provider', 'factorType'));
    const profile = factor.get('profile');
    const credentialId = profile && profile.credentialId ? profile.credentialId : '';

    return {
      props: {
        credentialId: ['string', true, credentialId],
        passCode: ['string', true],
        factorId: 'string',
      },
      save: function() {
        return this.doTransaction(function(transaction) {
          const factor = _.findWhere(transaction.factors, {
            factorType: 'token',
            provider: provider,
          });

          return factor.enroll({
            passCode: this.get('passCode'),
            profile: { credentialId: this.get('credentialId') },
          });
        });
      },
    };
  },

  Form: function() {
    const provider = this.options.provider;
    const factors = this.options.appState.get('factors');
    const factor = factors.findWhere(_.pick(this.options, 'provider', 'factorType'));
    const vendorName = factor.get('vendorName');
    const title = isRSA(provider) ? loc('factor.totpHard.rsaSecurId', 'login') : vendorName;

    return {
      title: title,
      noButtonBar: true,
      autoSave: true,
      className: getClassName(provider),
      initialize: function() {
        this.listenTo(this.model, 'error', (source, error) => {
          if (error && error.status === 409) {
            // 409 means we are in change pin, so we should clear out answer input
            this.$('.o-form-input-name-passCode input').val('');
            this.$('.o-form-input-name-passCode input').trigger('change');
            this.$('.o-form-input-name-passCode input').focus();
          }
        });
      },
      formChildren: [
        FormType.Input({
          label: loc('enroll.onprem.username.placeholder', 'login', [vendorName]),
          'label-top': true,
          explain: Util.createInputExplain(
            'enroll.onprem.username.tooltip',
            'enroll.onprem.username.placeholder',
            'login',
            [vendorName],
            [vendorName]
          ),
          'explain-top': true,
          name: 'credentialId',
          input: TextBox,
          type: 'text',
        }),
        FormType.Input({
          label: loc('enroll.onprem.passcode.placeholder', 'login', [vendorName]),
          'label-top': true,
          explain: Util.createInputExplain(
            'enroll.onprem.passcode.tooltip',
            'enroll.onprem.passcode.placeholder',
            'login',
            [vendorName],
            [vendorName]
          ),
          'explain-top': true,
          name: 'passCode',
          input: TextBox,
          type: 'password',
        }),
        FormType.Toolbar({
          noCancelButton: true,
          save: loc('mfa.challenge.verify', 'login'),
        }),
      ],
    };
  },

  Footer: Footer,
});
