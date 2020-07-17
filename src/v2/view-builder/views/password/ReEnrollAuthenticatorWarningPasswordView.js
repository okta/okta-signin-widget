import { loc } from 'okta';
import BaseFooter from '../../internals/BaseFooter';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({
  className: 'password-authenticator',
  title () {
    const passwordPolicy = this.getPasswordPolicySettings() || {};
    const daysToExpiry = passwordPolicy.daysToExpiry;

    if (daysToExpiry > 0) {
      return loc('password.expiring.title', 'login', [daysToExpiry]);
    } else if (daysToExpiry === 0) {
      return loc('password.expiring.today', 'login');
    } else {
      return loc('password.expiring.soon', 'login');
    }
  },

  save () {
    return loc('password.expired.submit', 'login');
  },
});

const Footer = BaseFooter.extend({
  links () {
    const links = [];
    if (this.options.appState.hasRemediationObject('skip')) {
      links.push({
        'type': 'link',
        'label': loc('password.expiring.later', 'login'),
        'name': 'skip',
        'actionPath': 'skip',
      });
    }
    return links;
  }
});

export default EnrollAuthenticatorPasswordView.extend({ Body, Footer });
