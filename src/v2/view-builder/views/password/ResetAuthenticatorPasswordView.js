import { loc } from 'okta';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({

  className: 'password-authenticator',

  title () {
    return loc('password.reset.title.generic', 'login');
  },

  save () {
    return loc('password.reset', 'login');
  },

  getPasswordPolicy () { 
    return this.options.appState.get('currentAuthenticator').settings;
  },

});

export default EnrollAuthenticatorPasswordView.extend({ Body });
