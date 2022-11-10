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

import { loc, createButton, Form } from '@okta/courage';
import TextBox from 'v1/views/shared/TextBox';

function addInlineTotp(form) {
  form.addDivider();
  form.addInput({
    label: loc('mfa.challenge.enterCode.placeholder', 'login'),
    'label-top': true,
    className: 'o-form-fieldset o-form-label-top inline-input auth-passcode',
    name: 'answer',
    input: TextBox,
    type: 'tel',
  });
  form.add(
    createButton({
      attributes: { 'data-se': 'inline-totp-verify' },
      className: 'button inline-totp-verify margin-top-30',
      title: loc('mfa.challenge.verify', 'login'),
      click: function() {
        form.clearErrors();
        if (!form.isValid()) {
          return;
        }
        form.model.manageTransaction(function(transaction, setTransaction) {
          // This is the case where we enter the TOTP code and verify while there is an
          // active Push request (or polling) running. We need to invoke previous() on authClient
          // and then call model.save(). If not, we would still be in MFA_CHALLENGE state and
          // verify would result in a wrong request (push verify instead of a TOTP verify).
          if (transaction.status === 'MFA_CHALLENGE' && transaction.prev) {
            form.options.appState.set('trapMfaRequiredResponse', true);
            return transaction.prev().then(function(trans) {
              setTransaction(trans);
              form.model.save();
            });
          } else {
            // Push is not active and we enter the code to verify.
            form.model.save();
          }
        });
      },
    })
  );
  form.at(1).focus();
}

export default Form.extend({
  autoSave: true,
  noButtonBar: true,
  scrollOnError: false,
  layout: 'o-form-theme',

  className: 'mfa-verify-totp-inline',

  attributes: { 'data-se': 'factor-inline-totp' },

  initialize: function() {
    const form = this;

    this.listenTo(this.model, 'error', function() {
      this.clearErrors();
    });
    this.add(
      createButton({
        className: 'link',
        attributes: { 'data-se': 'inline-totp-add' },
        title: loc('mfa.challenge.orEnterCode', 'login'),
        click: function() {
          this.remove();
          addInlineTotp(form);
        },
      })
    );
  },
});
