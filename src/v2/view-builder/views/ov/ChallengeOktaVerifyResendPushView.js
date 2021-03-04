import { loc, createCallout } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const OV_NMC_FORCE_UPGRAGE_SERVER_KEY = 'idx.authenticator.app.method.push.force.upgrade.number_challenge';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'okta-verify-resend-push',

    title () {
      return loc('oie.okta_verify.push.title', 'login');
    },

    save () {
      return loc('oie.okta_verify.push.resend', 'login');
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
            const options = {
              content: msg,
              type: 'error',
            };
            if (this.options.appState.containsMessageWithI18nKey(OV_NMC_FORCE_UPGRAGE_SERVER_KEY)) {
              // account for error customization
              options.content = loc('oie.numberchallenge.force.upgrade', 'login');
              // add a title for OV force upgrade
              options.title = loc('oie.numberchallenge.force.upgrade.title', 'login');
            }
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
