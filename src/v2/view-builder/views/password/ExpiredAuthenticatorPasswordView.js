import { loc } from 'okta';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';
import BaseForm from '../../internals/BaseForm';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({

  className: 'password-authenticator',

  title () {
    return loc('oie.password.expired.title', 'login');
  },

  save () {
    return loc('oie.password.expired.primaryButton', 'login');
  },

  getPasswordPolicy () { 
    return this.options.appState.get('recoveryFactor').settings;
  },

});

export default EnrollAuthenticatorPasswordView.extend({ Body });
