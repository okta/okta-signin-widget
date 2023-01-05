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

import { _, Form, loc } from '@okta/courage';
export default Form.extend({
  className: 'mfa-verify-question',
  autoSave: true,
  noCancelButton: true,
  save: _.partial(loc, 'mfa.challenge.verify', 'login'),
  scrollOnError: false,
  layout: 'o-form-theme',
  attributes: { 'data-se': 'factor-question' },

  initialize: function() {
    this.title = this.model.get('factorLabel');

    this.addInput({
      label: this.model.get('securityQuestion'),
      'label-top': true,
      placeholder: loc('mfa.challenge.answer.placeholder', 'login'),
      className: 'auth-passcode',
      name: 'answer',
      type: 'password',
      params: {
        showPasswordToggle: true,
      },
    });

    if (this.options.appState.get('allowRememberDevice')) {
      this.addInput({
        label: false,
        'label-top': true,
        placeholder: this.options.appState.get('rememberDeviceLabel'),
        className: 'margin-btm-0',
        name: 'rememberDevice',
        type: 'checkbox',
      });
    }
  },
});
