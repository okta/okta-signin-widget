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
/* eslint complexity: [2, 7] */
define(['okta', 'q', 'views/shared/TextBox'], function (Okta, Q, TextBox) {
  var _ = Okta._;

  function addEnterCodeField (form) {
    form.clearErrors();
    form.addInput({
      label: false,
      'label-top': true,
      placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
      className: 'o-form-fieldset o-form-label-top auth-passcode',
      name: 'answer',
      input: TextBox,
      type: 'tel'
    });

    form.className = 'mfa-verify-passcode';

  }

  function addVerifyCodeButton (form) {
    form.add(Okta.createButton({
      attributes: { 'data-se': 'enter-code', 'type': 'submit' },
      className: 'button button-primary verify-code-button',
      title: Okta.loc('mfa.challenge.verify', 'login'),
      click: function () {
        form.clearErrors();
        this.model.save();
      }
    }));
  }

  function addEnterCodeButton (form) {
    form.add(Okta.createButton({
      attributes: { 'data-se': 'enter-code' },
      className: 'button enter-code-button',
      title: Okta.loc('mfa.challenge.orEnterCode', 'login'),
      click: function () {
        form.clearErrors();
        this.render();
        form.subtitle = '';
        form.title = Okta.loc('mfa.emailVerification.otc.finish', 'login');
        addEnterCodeField(form);
        addVerifyCodeButton(form);
        form.render();
        this.remove();
      }
    }));
  }


  return Okta.Form.extend({
    layout: 'o-form-theme',
    className: 'mfa-verify-idxpipeline',
    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
    autoSave: true,
    noCancelButton: true,
    initialize: function () {

      var form = this;
      this.title = Okta.loc('mfa.mailVerification.title', 'login');

      var email = this.model.get('email') || this.options.appState.get('lastAuthResponse')._embedded.user.profile.login;
      this.subtitle = Okta.loc('mfa.emailVerification.subtitle', 'login', [email]);
      this.add(Okta.createButton({
        attributes: { 'data-se': 'email-send-code' },
        className: 'button email-request-button',
        title: Okta.loc('mfa.sendEmail', 'login'),
        click: function () {
          form.clearErrors();
          this.disable();
          this.options.title = Okta.loc('mfa.sent', 'login');
          this.render();
          this.model.save()
            .then(_.bind(function () {
              form.subtitle = Okta.loc('mfa.emailVerification.checkEmail', 'login');
              form.render();
              this.$el.remove();
              this.remove();
              addEnterCodeButton(form);
            }, this));
        }
      }));



    }
  });
});
