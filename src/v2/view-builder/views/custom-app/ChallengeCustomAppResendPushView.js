import { loc, createCallout } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.custom_app.method.push.verify.enable.biometrics';

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
      let options = {};
      if (this.options.appState.containsMessageWithI18nKey(CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY)) {
        // add a title, subtitle, and bullet-points for 
        // Custom App enable biometrics message during verification
        options.content = null;
        options.className = 'okta-verify-uv-callout-content';
        options.title = loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.title',
          'login', [this.options.appState.getAuthenticatorDisplayName()]);
        options.subtitle =
        loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.description', 'login');
        options.type = 'error';
        options.bullets = [
          loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.point1', 'login'),
          loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.point2',
            'login', [this.options.appState.getAuthenticatorDisplayName()]),
          loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.point3',
            'login', [this.options.appState.getAuthenticatorDisplayName()])
        ];
        options = createCallout(options);
      }
      BaseForm.prototype.showMessages.call(this, options);
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
