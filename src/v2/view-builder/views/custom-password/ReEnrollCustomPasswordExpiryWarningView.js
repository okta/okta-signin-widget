import { createButton, loc, _ } from '@okta/courage';
import { BaseView, BaseForm, BaseFooter } from '../../internals';
import Util from '../../../../util/Util';

const Body = BaseForm.extend({
  className: 'password-authenticator',
  subtitle() {
    return this.settings.get('brandName') ? loc('password.expiring.soon.subtitle.specific', 'login', 
      [this.settings.get('brandName')]) : loc('password.expiring.soon.subtitle.generic', 'login');
  },
  title() {
    const passwordPolicy = this.options.appState.get('currentAuthenticator')?.settings;
    const daysToExpiry = passwordPolicy.daysToExpiry;

    if (daysToExpiry > 0) {
      return loc('password.expiring.title', 'login', [daysToExpiry]);
    } else if (daysToExpiry === 0) {
      return loc('password.expiring.today', 'login');
    } else {
      return loc('password.expiring.soon', 'login');
    }
  },
  noSubmitButton: true,
  initialize() {
    const { customExpiredPasswordName, customExpiredPasswordURL } = this.options.currentViewState;
    this.add(createButton({
      className: 'button button-primary button-wide',
      title: _.partial(loc, 'password.expired.custom.submit', 'login', [customExpiredPasswordName]),
      click: () => {
        Util.redirect(customExpiredPasswordURL);
      },
    }));
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

export default BaseView.extend({ Body, Footer });
