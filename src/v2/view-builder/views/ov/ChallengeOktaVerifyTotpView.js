import { loc, createCallout } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const OV_UV_ENABLE_BIOMETRIC_SERVER_KEY = 'oie.authenticator.oktaverify.method.totp.verify.enable.biometrics';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'okta-verify-totp-challenge',

    title() {
      return loc('oie.okta_verify.totp.title', 'login');
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },

    showCustomFormErrorCallout(error) {
      const errorSummaryKeys = error?.responseJSON?.errorSummaryKeys;
      let options;
      if (errorSummaryKeys && errorSummaryKeys.includes(OV_UV_ENABLE_BIOMETRIC_SERVER_KEY)) {
        options = {
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
        this.showMessages(createCallout(options));
        return true;
      }
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
