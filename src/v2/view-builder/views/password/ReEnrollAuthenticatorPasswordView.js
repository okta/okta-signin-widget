import { loc } from 'okta';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({

  className: 'password-authenticator',

  title () {
    return loc('password.expired.title.generic', 'login');
  },

  save () {
    return loc('password.expired.submit', 'login');
  },

  getPasswordPolicy () {
    return this.options.appState.get('recoveryAuthenticator').settings;
  },

});

export default EnrollAuthenticatorPasswordView.extend({ Body });
