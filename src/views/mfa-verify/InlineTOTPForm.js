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

define(['okta'], function (Okta) {

  function addInlineTotp(form) {
    form.addDivider();
    form.addInput({
      label: false,
      'label-top': true,
      placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
      className: 'o-form-fieldset o-form-label-top inline-input auth-passcode',
      name: 'answer',
      type: 'text'
    });
    form.add(Okta.createButton({
      attributes: { 'data-se': 'inline-totp-verify' },
      className: 'button inline-totp-verify',
      title: Okta.loc('mfa.challenge.verify', 'login'),
      click: function () {
        form.model.manageTransaction(function (transaction, setTransaction) {
          // This is the case where we enter the TOTP code and verify while there is an
          // active Push request (or polling) running. We need to invoke previous() on authClient
          // and then call model.save(). If not, we would still be in MFA_CHALLENGE state and
          // verify would result in a wrong request (push verify instead of a TOTP verify).
          if (transaction.status === 'MFA_CHALLENGE' && transaction.prev) {
            return transaction.prev().then(function (trans) {
              setTransaction(trans);
              form.model.save();
            });
          } else {
            // Push is not active and we enter the code to verify.
            form.model.save();
          }
        });
      }
    }));
    form.at(1).focus();
  }

  return Okta.Form.extend({
    autoSave: true,
    noButtonBar: true,
    scrollOnError: false,
    layout: 'o-form-theme',

    className: 'mfa-verify-totp-inline',

    attributes: { 'data-se': 'factor-inline-totp' },

    initialize: function () {
      var form = this;
      this.listenTo(this.model, 'error', function () {
        this.clearErrors();
      });
      this.add(Okta.createButton({
        className: 'link',
        attributes: { 'data-se': 'inline-totp-add' },
        title: Okta.loc('mfa.challenge.orEnterCode', 'login'),
        click: function () {
          this.remove();
          addInlineTotp(form);
        }
      }));
    }
  });

});
