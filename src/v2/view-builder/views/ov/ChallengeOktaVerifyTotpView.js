import { loc, createCallout } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const OV_UV_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.oktaverify.method.totp.verify.enable.biometrics';

const Body = BaseForm.extend(
  {
    className: 'okta-verify-totp-challenge',

    modelEvents: {
      'error': '_checkGlobalError'
    },

    title() {
      return loc('oie.okta_verify.totp.title', 'login');
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },

    _checkGlobalError(model, convertedErrors) {
      console.log('My error');
      console.log(model);
      console.log(convertedErrors);
      /*const errorSummaryKeys = convertedErrors?.responseJSON?.errorSummaryKeys;
      if (errorSummaryKeys && errorSummaryKeys.includes(OV_UV_ENABLE_BIOMETRIC_SERVER_KEY)) {
        // this means we are in change pin, so we should clear out answer input
        this.model.set('credentials.totp', '');
        console.log('WE DID IT');
        //this.render();
      }*/
    },

    showMessages() {
      // Override showMessages to display error in cases like reject totp when UV required
      // Borrowed this logic from TerminalView
      const messagesObjs = this.options.appState.get('messages');
      if (messagesObjs && Array.isArray(messagesObjs.value)) {
        this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');

        messagesObjs.value.forEach(messagesObj => {
          if (messagesObj?.class === 'ERROR') {
            if (this.options.appState.containsMessageWithI18nKey(OV_UV_ENABLE_BIOMETRIC_SERVER_KEY)) {
              // add a title for OV enable biometrics message during verification
              const options = {
                type: 'error',
                className: 'okta-verify-uv-callout-content',
                title: loc('oie.authenticator.app.method.push.verify.enable.biometrics.title', 'login'),
                subtitle: loc('oie.authenticator.app.method.push.verify.enable.biometrics.description', 'login'),
                bullets: [
                  loc('oie.authenticator.app.method.push.verify.enable.biometrics.point1', 'login'),
                  loc('oie.authenticator.app.method.push.verify.enable.biometrics.point2', 'login'),
                  loc('oie.authenticator.app.method.push.verify.enable.biometrics.point3', 'login')
                ],
              };
              this.add(createCallout(options), '.o-form-error-container');
            }
          }
        });
      }
    },
  },
);

export default BaseAuthenticatorView.extend({
  Body,
});
