import { loc } from 'okta';
import EnrollAuthenticatorDuressPasswordView from './EnrollAuthenticatorDuressPasswordView';

const Body = EnrollAuthenticatorDuressPasswordView.prototype.Body.extend({

  className: 'password-authenticator',

  title() {
    const title = this.options.settings.get('brandName')?
      loc('duresspassword.expired.title.specific', 'login', [this.options.settings.get('brandName')]):
      loc('duresspassword.expired.title.generic', 'login');
    return title;
  },

  save() {
    return loc('duresspassword.expired.submit', 'login');
  },

  getPasswordPolicySettings() {
    return this.options.appState.get('recoveryAuthenticator')?.settings
      || this.options.appState.get('enrollmentAuthenticator')?.settings;
  },

});

export default EnrollAuthenticatorDuressPasswordView.extend({ Body });
