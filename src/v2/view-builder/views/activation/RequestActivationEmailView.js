import { BaseForm, BaseView } from '../../internals';
import { loc, createCallout } from 'okta';

const Body = BaseForm.extend({

  title() {
    return loc('oie.activation.request.email.title.expire', 'login');
  },

  save() {
    return loc('oie.activation.request.email.button', 'login');
  },

  showMessages() {
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

export default BaseView.extend({
  Body
});