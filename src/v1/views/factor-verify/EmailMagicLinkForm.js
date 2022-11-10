/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
/* eslint complexity: [2, 7] */
import { Form, createButton, loc } from '@okta/courage';
import Q from 'q';
import Enums from 'util/Enums';
export default Form.extend({
  layout: 'o-form-theme',
  className: 'factor-verify-magiclink',
  autoSave: true,
  noCancelButton: true,
  initialize: function() {
    const form = this;
    // for FACTOR_REQUIRED with email magic link we dont need to show otp code input field and verify button

    this.title = this.model.get('factorLabel');
    //TODO: OKTA-211618 Temp fix for demo. FACTOR_REQUIRED after sign up is missing the profile object in API response

    const email = this.model.get('email') || this.options.appState.get('lastAuthResponse')._embedded.user.profile.login;

    this.subtitle = '(' + email + ')';
    this.add(
      createButton({
        attributes: { 'data-se': 'email-send-code' },
        className: 'button email-request-button',
        title: loc('mfa.sendEmail', 'login'),
        click: function() {
          form.clearErrors();
          this.disable();
          this.options.title = loc('mfa.sent', 'login');
          this.render();
          this.model
            .save()
            .then(() => {
              return Q.delay(Enums.API_RATE_LIMIT);
            })
            .then(() => {
              this.options.title = loc('mfa.resendEmail', 'login');
              this.enable();
              this.render();
            });
        },
      })
    );
  },
});
