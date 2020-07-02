import { loc } from 'okta';
import BaseFooter from '../../internals/BaseFooter';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({
  className: 'password-authenticator',
  title () {
    const daysToExpiry = this.options.appState.get('currentAuthenticator').settings.daysToExpiry;
    return `${loc('oie.password.expiry.warning.title', 'login')}
      ${daysToExpiry} ${loc('oie.password.expiry.warning.time','login')}`;
  },

  save () {
    return loc('oie.password.expired.primaryButton', 'login');
  },

  getPasswordPolicy () { 
    return this.options.appState.get('currentAuthenticator').settings;
  },
});

const Footer = BaseFooter.extend({
  links () {
    const links = [];
    if (this.options.appState.hasRemediationObject('skip')) {
      const skipConfig = this.options.appState.get('remediations').find(remediation => remediation.name === 'skip');
      links.push({
        'type': 'link',
        'label': loc('password.expiring.later', 'login'),
        'name': 'skip',
        'href': skipConfig.href,
      });
    }
    return links;
  }
});

export default EnrollAuthenticatorPasswordView.extend({ Body, Footer });
