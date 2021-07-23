import { loc, createCallout } from 'okta';
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

    isErrorCalloutCustomized(convertedErrors) {
      const errorSummaryKeys = convertedErrors?.responseJSON?.errorSummaryKeys;
      if (errorSummaryKeys && errorSummaryKeys.includes(OV_UV_ENABLE_BIOMETRIC_SERVER_KEY)) {
        return true;
      }
      return false;
    },

    showCustomErrorCallout() {
      BaseForm.prototype.showCustomErrorCallout.apply(this, arguments);
      this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');
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
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
