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

  return Okta.Form.extend({
    className: 'mfa-verify-question',
    autoSave: true,
    noCancelButton: true,
    save: Okta.loc('mfa.challenge.verify', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-question' },

    initialize: function () {
      this.title = this.model.get('factorLabel');

      this.addInput({
        label: this.model.get('securityQuestion'),
        'label-top': true,
        placeholder: Okta.loc('mfa.challenge.answer.placeholder', 'login'),
        className: 'auth-passcode',
        name: 'answer',
        type: 'password',
        initialize: function () {
          this.listenTo(this.model, 'change:showAnswer', function () {
            var type = this.model.get('showAnswer') ? 'text' : 'password';
            this.getInputs()[0].changeType(type);
          });
        }
      });

      this.addInput({
        label: false,
        'label-top': true,
        placeholder: Okta.loc('mfa.challenge.answer.showAnswer', 'login'),
        className: 'auth-passcode-show margin-btm-0',
        name: 'showAnswer',
        type: 'checkbox'
      });
    },

    remove: function () {
      this.model.unset('showAnswer');
      return Okta.Form.prototype.remove.apply(this, arguments);
    }

  });

});
