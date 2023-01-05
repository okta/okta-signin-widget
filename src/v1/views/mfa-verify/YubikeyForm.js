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
import TextBox from 'v1/views/shared/TextBox';
export default Form.extend({
  className: 'mfa-verify-yubikey',
  autoSave: true,
  noCancelButton: true,
  save: _.partial(loc, 'mfa.challenge.verify', 'login'),
  scrollOnError: false,
  layout: 'o-form-theme',
  attributes: { 'data-se': 'factor-yubikey' },

  initialize: function() {
    const factorName = this.model.get('factorLabel');

    this.title = factorName;
    this.subtitle = loc('factor.totpHard.yubikey.description', 'login');

    this.addInput({
      label: loc('factor.totpHard.yubikey.placeholder', 'login'),
      'label-top': true,
      className: 'o-form-fieldset o-form-label-top auth-passcode',
      name: 'answer',
      input: TextBox,
      inputId: 'mfa-answer',
      type: 'password',
    });

    if (this.options.appState.get('allowRememberDevice')) {
      this.addInput({
        label: false,
        'label-top': true,
        className: 'margin-btm-0',
        placeholder: this.options.appState.get('rememberDeviceLabel'),
        name: 'rememberDevice',
        type: 'checkbox',
      });
    }
  },
});
