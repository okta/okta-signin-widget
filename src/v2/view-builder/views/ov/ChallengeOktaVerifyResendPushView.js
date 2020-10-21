import { loc, createCallout } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'okta-verify-resend-push',

    title () {
      return loc('oie.okta_verify.push.title', 'login');
    },

    save () {
      return loc('oie.okta_verify.push.send', 'login');
    },

    showMessages () {
      // override showMessages to display error in cases like reject push
      // or timeout. Borrowed this logic from TerminalView.
      const messagesObjs = this.options.appState.get('messages');
      if (messagesObjs && Array.isArray(messagesObjs.value)) {
        this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');

        messagesObjs.value.forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj?.class === 'ERROR') {
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
  },
));

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorVerifyFooter,
});
