import { loc } from '@okta/courage';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({

  className: 'password-authenticator',

  title() {
    const title = this.options.settings.get('brandName')?
      loc('password.reset.title.specific', 'login', [this.options.settings.get('brandName')]):
      loc('password.reset.title.generic', 'login');
    return title;
  },

  save() {
    return loc('password.reset', 'login');
  },

});

export default EnrollAuthenticatorPasswordView.extend({ Body });
