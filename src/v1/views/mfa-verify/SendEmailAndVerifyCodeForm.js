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

import { _, Form, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import ResendEmailView from 'v1/views/ResendEmailView';
import TextBox from 'v1/views/shared/TextBox';

const createEmailMaskElement = function() {
  const email = this.model.get('email');
  const emailTpl = hbs('<span class="mask-email">{{email}}</span>');
  return { factorEmail: emailTpl({ email }) };
};

const SendEmailAndVerifyCodeFormVerifyEmailCodeForm = Form.extend({
  layout: 'o-form-theme',
  className: 'mfa-verify-email',
  title: _.partial(loc, 'email.mfa.title', 'login'),
  noButtonBar: false,
  autoSave: true,
  noCancelButton: true,
  attributes: {
    'data-se': 'factor-email',
  },
  save: function() {
    return this.options.appState.get('isMfaChallenge')
      ? loc('mfa.challenge.verify', 'login')
      : loc('email.button.send', 'login');
  },

  events: Object.assign({}, Form.prototype.events, {
    submit: function(e) {
      e.preventDefault();
      this.handleSubmit();
    },
  }),

  handleSubmit() {
    this.clearErrors();
    if (this.options.appState.get('isMfaChallenge')) {
      if (this.isValid()) {
        this.model.save();
      }
    } else {
      // Send email and switch to verification view
      this.model.set('answer', '');
      this.model.save().then(this.renderChallengView.bind(this));
    }
  },

  initialize: function() {
    Form.prototype.initialize.apply(this, arguments);

    // render 'Send Email' page at first place
    this.add(
      View.extend({
        attributes: {
          'data-se': 'mfa-send-email-content',
        },
        className: 'mfa-send-email-content',
        template: hbs('{{{i18n code="email.mfa.description" bundle="login" arguments="factorEmail"}}}'),
        getTemplateData: createEmailMaskElement,
      })
    );
  },

  renderChallengView: function() {
    this.removeChildren();
    this.add(
      View.extend({
        className: 'mfa-email-sent-content',
        attributes: {
          'data-se': 'mfa-email-sent-content',
        },
        // Why use `{{{` for the description?
        // - factorEmail is actually an HTML fragment which
        //   is created via another handlebar template and used for bold the email address.
        template: hbs('{{{i18n code="email.mfa.email.sent.description" bundle="login" arguments="factorEmail"}}}'),
        getTemplateData: createEmailMaskElement,
      })
    );

    this.add(ResendEmailView);

    this.addInput({
      label: loc('email.code.label', 'login'),
      'label-top': true,
      name: 'answer',
      input: TextBox,
      wide: true,
      type: 'tel',
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
    this.render();
  },
});

export default SendEmailAndVerifyCodeFormVerifyEmailCodeForm;
