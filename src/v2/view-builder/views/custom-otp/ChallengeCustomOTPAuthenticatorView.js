import { loc } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'mfa-verify-custom-otp',

    title() {
      return loc('oie.verify.custom_otp.title', 'login', [this._getVendorName()]);
    },

    subtitle() {
      return loc('oie.verify.custom_otp.descriptionWithVendor', 'login', [this._getVendorName()]);
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },

    _getVendorName() {
      return this.options.appState.getAuthenticatorDisplayName() ||
        loc('oie.custom_otp.authenticator.default.vendorName', 'login');
    }
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
