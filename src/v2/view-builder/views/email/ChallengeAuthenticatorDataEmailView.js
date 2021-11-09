import { loc } from 'okta';
import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const Body = BaseAuthenticatorEmailForm.extend(
  {
    title() {
      return loc('oie.email.mfa.title', 'login');
    },

    save() {
      return loc('oie.email.verify.primaryButton', 'login');
    },

    initialize() {
      BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);
      const userEmail = this.options.appState.get('authenticatorEnrollments').value[0].profile.email;
      const subtitleText = loc('oie.email.verify.subtitle', 'login');

      this.add(`<div class="okta-form-subtitle" data-se="o-form-explain">${subtitleText}
        <span class="strong no-translate">${userEmail}</span>
      </div>`, {
        prepend: true,
        selector: '.o-form-error-container',
      });
    },

    getUISchema() {
      // Prevent from displaying radio buttons on the UI
      const uiSchemas = BaseAuthenticatorEmailForm.prototype.getUISchema.apply(this, arguments);
      return uiSchemas.filter(schema => schema.name !== 'authenticator.methodType');
    },
  },
);

export default BaseAuthenticatorEmailView.extend({
  Body,
});