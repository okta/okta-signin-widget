import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';

const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    className: 'okta-verify-totp-challenge',

    title () {
      return loc('oie.okta_verify.totp.title', 'login');
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