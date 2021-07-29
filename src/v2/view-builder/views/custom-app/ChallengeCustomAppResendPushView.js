import { loc, createCallout } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'custom-app-verify-resend-push',

    title() {
      return loc('oie.verify.custom_app.title', 'login', [this.options.appState.getAuthenticatorDisplayName()]);
    },

    save() {
      return loc('oie.custom_app.push.resend', 'login');
    },

    showMessages() {
      // override showMessages to display error in cases like reject push
      // or timeout. Borrowed this logic from TerminalView.
      const messagesObjs = this.options.appState.get('messages');
      if (messagesObjs && Array.isArray(messagesObjs.value)) {
        this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');

        messagesObjs.value.forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj?.class === 'ERROR') {
            const options = {
              content: msg,
              type: 'error',
            };
            this.add(createCallout(options), '.o-form-error-container');
          } else {
            this.add(`<p>${msg}</p>`, '.ion-messages-container');
          }
        });
      }
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
