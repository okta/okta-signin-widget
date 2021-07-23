import { View, loc } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

// Courage doesn't support HTML, hence creating a subtitle here.
const CheckYourEmailTitle = View.extend({
  className: 'okta-form-subtitle',
  attributes: {
    'data-se': 'o-form-explain',
  },
  template: hbs`
    {{i18n code="oie.email.verify.alternate.sentText" bundle="login" arguments="email" $1="<span class='strong'>$1</span>"}}
  `,

  getTemplateData() {
    const { email } = this.options;
    return {
          email: email || loc('oie.email.verify.alternate.sentText.email', 'login'),
    };
  },
});

const Body = BaseAuthenticatorEmailForm.extend(Object.assign({

  resendEmailAction: 'currentAuthenticatorEnrollment-resend',

  initialize() {
    BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);

    const { email } = this.options.currentViewState.relatesTo?.value?.profile || {};

    this.add(CheckYourEmailTitle, {
      prepend: true,
      selector: '.o-form-error-container',
      options: {
        email,
      }
    });
  },
}));

export default BaseAuthenticatorEmailView.extend({
  Body,
});
