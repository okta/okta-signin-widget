import { loc } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'google-authenticator-challenge',

    title() {
      return loc('oie.verify.google_authenticator.otp.title', 'login');
    },

    subtitle() {
      return loc('oie.verify.google_authenticator.otp.description', 'login');
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
