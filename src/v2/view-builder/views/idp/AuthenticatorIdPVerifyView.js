import { createCallout, loc } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({

  title() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return loc('oie.idp.challenge.title', 'login', [displayName]);
  },

  subtitle() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return loc('oie.idp.challenge.description', 'login', [displayName]);
  },

  showMessages() {
    // IdP Authenticator error messages are not form errors
    // Parse and display them here.
    const messages = this.options.appState.get('messages') || {};
    if (Array.isArray(messages.value)) {
      this.add('<div class="ion-messages-container”></div>', '.o-form-error-container');

      messages
        .value
        .forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj.class === 'ERROR') {
            this.add(createCallout({
              content: msg,
              type: 'error',
            }), '.o-form-error-container');
          } else {
            this.add(`<p>${msg}</p>`, '.ion-messages-container');
          }
        });
    }
  },

  save() {
    return loc('mfa.challenge.verify', 'login');
  },

});

export default BaseAuthenticatorView.extend({
  Body,
});
