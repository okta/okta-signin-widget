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

import { loc } from '@okta/courage';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import FooterSignout from 'v1/views/shared/FooterSignout';
import TextBox from 'v1/views/shared/TextBox';
export default FormController.extend({
  className: 'recovery-question',
  Model: {
    props: {
      answer: ['string', true],
      showAnswer: 'boolean',
    },
    save: function() {
      return this.doTransaction(function(transaction) {
        return transaction.answer({ answer: this.get('answer') });
      });
    },
  },
  Form: {
    autoSave: true,
    save: function() {
      switch (this.options.appState.get('recoveryType')) {
      case 'PASSWORD':
        return loc('password.forgot.question.submit', 'login');
      case 'UNLOCK':
        return loc('account.unlock.question.submit', 'login');
      default:
        return loc('mfa.challenge.verify', 'login');
      }
    },
    title: function() {
      switch (this.options.appState.get('recoveryType')) {
      case 'PASSWORD':
        return loc('password.forgot.question.title', 'login');
      case 'UNLOCK':
        return loc('account.unlock.question.title', 'login');
      default:
        return '';
      }
    },
    formChildren: function() {
      return [
        FormType.Input({
          label: this.options.appState.get('recoveryQuestion'),
          placeholder: loc('mfa.challenge.answer.placeholder', 'login'),
          name: 'answer',
          input: TextBox,
          type: 'password',
          initialize: function() {
            this.listenTo(this.model, 'change:showAnswer', function() {
              const type = this.model.get('showAnswer') ? 'text' : 'password';

              this.getInputs()[0].changeType(type);
            });
          },
        }),
        FormType.Input({
          label: false,
          'label-top': true,
          placeholder: loc('mfa.challenge.answer.showAnswer', 'login'),
          className: 'recovery-question-show margin-btm-0',
          name: 'showAnswer',
          type: 'checkbox',
        }),
      ];
    },
  },
  initialize: function() {
    if (!this.settings.get('features.hideBackToSignInForReset')) {
      this.addFooter(FooterSignout);
    }
  },
});
