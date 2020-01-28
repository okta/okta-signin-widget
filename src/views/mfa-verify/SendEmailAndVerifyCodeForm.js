/*!
 * Copyright (c) 2015-2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define([
  'okta',
  'views/shared/TextBox',
  'views/ResendEmailView'
], function (Okta, TextBox,  ResendEmailView) {

  const _ = Okta._;
  const createEmailMaskElement = function () {
    const email = this.model.get('email');
    const emailTpl = Okta.tpl('<span class="mask-email">{{email}}</span>');
    return {factorEmail: emailTpl({email})};
  };

  const VerifyEmailCodeForm = Okta.Form.extend({
    layout: 'o-form-theme',
    className: 'mfa-verify-email',
    title: _.partial(Okta.loc, 'mfa.email.title', 'login'),
    noButtonBar: false,
    autoSave: true,
    noCancelButton: true,
    attributes: {
      'data-se': 'factor-email',
    },
    save: function () {
      return this.state.get('isEmailChallengeStatus')
        ? Okta.loc('mfa.challenge.verify', 'login')
        : Okta.loc('send.email.code.save', 'login');
    },

    events: Object.assign({}, Okta.Form.prototype.events, {
      submit: function (e) {
        e.preventDefault();
        this.clearErrors();

        if (this.state.get('isEmailChallengeStatus')) {
          if (this.isValid()) {
            this.model.save();
          }
        } else {
          this.model.set('answer', '');
          this.model.save()
            .then(() => {
              this.state.set('isEmailChallengeStatus', true);
              this.removeChildren();
              this.render();
            });
        }
      }
    }),

    initialize: function () {
      Okta.Form.prototype.initialize.apply(this, arguments);

      this.state.set('isEmailChallengeStatus', false);
    },

    postRender: function () {
      Okta.Form.prototype.postRender.apply(this, arguments);

      if (this.state.get('isEmailChallengeStatus')) {
        this.add(Okta.View.extend({
          className: 'mfa-email-sent-content',
          attributes: {
            'data-se': 'mfa-email-sent-content',
          },
          // Why use `{{{` for the description?
          // - factorEmail is actually an HTML fragment which
          //   is created via another handlebar template and used for bold the email address.
          template: '{{{i18n code="check.email.and.enter.code.description" bundle="login" arguments="factorEmail"}}}',
          getTemplateData: createEmailMaskElement,
        }));

        this.add(ResendEmailView);

        this.addInput({
          label: Okta.loc('email.code.label', 'login'),
          'label-top': true,
          name: 'answer',
          input: TextBox,
          wide: true,
          type: 'tel'
        });
        if (this.options.appState.get('allowRememberDevice')) {
          this.addInput({
            label: false,
            'label-top': true,
            placeholder: this.options.appState.get('rememberDeviceLabel'),
            className: 'margin-btm-0',
            name: 'rememberDevice',
            type: 'checkbox'
          });
        }
      } else {
        this.add(Okta.View.extend({
          attributes: {
            'data-se': 'mfa-send-email-content'
          },
          className: 'mfa-send-email-content',
          template: '{{{i18n code="mfa.email.send.description" bundle="login" arguments="factorEmail"}}}',
          getTemplateData: createEmailMaskElement,
        }));
      }
    },
  });

  return VerifyEmailCodeForm;

});
