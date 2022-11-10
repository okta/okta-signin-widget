import { loc } from '@okta/courage';
import { BaseFooter } from '../../internals';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({
  className: 'password-authenticator',
  subtitle() {
    if (this.options.settings.get('brandName')) {
      return loc('password.expiring.subtitle.specific', 'login', [this.options.settings.get('brandName')]);
    }
  },
  title() {
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

  save() {
    return loc('password.expired.submit', 'login');
  },
  showMessages() {
    // if brandName is configured and messages is present, render as subtitle with brandName in context
    if (this.options.settings.get('brandName')) {
      return null;
    }
    // else if brandName is not set, render messages object sent from server as text
    EnrollAuthenticatorPasswordView.prototype.Body.prototype.showMessages.apply(this, arguments);
  },
});

const Footer = BaseFooter.extend({
  links() {
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
