import { loc } from 'okta';
import EnrollAuthenticatorDuressPasswordView from './EnrollAuthenticatorDuressPasswordView';

const Body = EnrollAuthenticatorDuressPasswordView.prototype.Body.extend({

  className: 'password-authenticator',

  title() {
    const title = this.options.settings.get('brandName')?
      loc('duresspassword.reset.title.specific', 'login', [this.options.settings.get('brandName')]):
      loc('duresspassword.reset.title.generic', 'login');
    return title;
  },

  save() {
    return loc('duresspassword.reset', 'login');
  },

});

export default EnrollAuthenticatorDuressPasswordView.extend({ Body });
