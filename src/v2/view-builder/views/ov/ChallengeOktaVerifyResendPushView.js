import { loc, createCallout } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const OV_NMC_FORCE_UPGRAGE_SERVER_KEY = 'oie.authenticator.app.method.push.force.upgrade.number_challenge';
const OV_UV_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.app.method.push.verify.enable.biometrics';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'okta-verify-resend-push',

    title() {
      return loc('oie.okta_verify.push.title', 'login');
    },

    save() {
      return loc('oie.okta_verify.push.resend', 'login');
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
            if (this.options.appState.containsMessageWithI18nKey(OV_NMC_FORCE_UPGRAGE_SERVER_KEY)) {
              // add a title for OV force upgrade
              options.title = loc('oie.numberchallenge.force.upgrade.title', 'login');
            } else if (this.options.appState.containsMessageWithI18nKey(OV_UV_ENABLE_BIOMETRIC_SERVER_KEY)) {
              // add a title for OV enable biometrics message during verification
              options.content = null;
              options.className = 'okta-verify-uv-callout-content';
              options.title = loc('oie.authenticator.app.method.push.verify.enable.biometrics.title', 'login');
              options.subtitle = loc('oie.authenticator.app.method.push.verify.enable.biometrics.description', 'login');
              options.bullets = [
                loc('oie.authenticator.app.method.push.verify.enable.biometrics.point1', 'login'),
                loc('oie.authenticator.app.method.push.verify.enable.biometrics.point2', 'login'),
                loc('oie.authenticator.app.method.push.verify.enable.biometrics.point3', 'login')
              ];
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
