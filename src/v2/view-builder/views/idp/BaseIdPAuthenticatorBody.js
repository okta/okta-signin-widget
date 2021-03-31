import { createCallout } from 'okta';
import { BaseForm } from '../../internals';

export default BaseForm.extend({

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.model.set('useRedirect', true);
  },

  showMessages() {
    // IdP Authenticator error messages are not form errors
    // Parse and display them here.
    // TODO: OKTA-383470
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
});
