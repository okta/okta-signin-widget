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
define(['okta', 'q', 'views/mfa-verify/PassCodeForm'], function (Okta, Q, PassCodeForm) {

  var subtitleTpl = Okta.Handlebars.compile('({{subtitle}})');
  var _ = Okta._;
  var API_RATE_LIMIT = 30000; //milliseconds

  return PassCodeForm.extend({
    className: 'factor-verify-passcode',
    initialize: function () {
      // for FACTOR_REQUIRED with email magic link we dont need to show otp code input field and verify button
      var form = this;
      this.title = this.model.get('factorLabel');
      //TODO: OKTA-211618 Temp fix for demo. FACTOR_REQUIRED after sign up is missing the profile object in API response
      var email = this.model.get('email') || this.options.appState.get('lastAuthResponse')._embedded.user.profile.login;
      this.subtitle = subtitleTpl({ subtitle: email});
      this.add(Okta.createButton({
        attributes: { 'data-se': 'email-send-code' },
        className: 'button ' + 'email-request-button',
        title: Okta.loc('mfa.sendEmail', 'login'),
        click: function () {
          form.clearErrors();
          this.disable();
          this.options.title = Okta.loc('mfa.sent', 'login');
          this.render();
          this.model.save()
            .then(_.bind(function () {
              return Q.delay(API_RATE_LIMIT);
            }, this))
            .then(_.bind(function () {
              this.options.title = Okta.loc('mfa.resendEmail', 'login');
              this.enable();
              this.render();
            }, this));
        }
      }));
    }
  });
});
