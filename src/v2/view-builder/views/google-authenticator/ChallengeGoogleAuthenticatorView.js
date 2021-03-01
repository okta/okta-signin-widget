import { loc } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'google-authenticator-challenge',

    title () {
      return loc('oie.verify.google_authenticator.otp.title', 'login');
    },

    subtitle () {
      return loc('oie.verify.google_authenticator.otp.description', 'login');
    },

    save () {
      return loc('mfa.challenge.verify', 'login');
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorVerifyFooter,
});
