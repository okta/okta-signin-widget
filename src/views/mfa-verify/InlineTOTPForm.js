/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
          if (transaction.status === 'MFA_CHALLENGE' && transaction.previous) {
            transaction.previous().then(function (trans) {
              form.model.save();
              setTransaction(trans);
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
