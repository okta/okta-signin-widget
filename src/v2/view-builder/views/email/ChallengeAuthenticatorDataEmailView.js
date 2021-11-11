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

    postRender() {
      BaseAuthenticatorEmailForm.prototype.postRender.apply(this, arguments);
      const userEmail = this.options.appState.get('currentAuthenticatorEnrollment')?.profile?.email;
      const subtitleText = loc('oie.email.verify.subtitle', 'login', [userEmail]);
      this.add(`<div class="okta-form-subtitle" data-se="o-form-explain">${subtitleText}</div>`, {
        prepend: true,
        selector: '.o-form-info-container',
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
