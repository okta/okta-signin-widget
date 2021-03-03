import { loc } from 'okta';
import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const Body = BaseAuthenticatorEmailForm.extend(Object.assign({

  resendEmailAction: 'currentAuthenticator-resend',

  subtitle () {
    return loc('oie.email.enroll.subtitle', 'login');
  },
}));

export default BaseAuthenticatorEmailView.extend({
  Body,
});
