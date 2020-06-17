import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';
import { addSwitchAuthenticatorLink } from '../../utils/AuthenticatorUtil';

const RECOVERY_LINK_ACTION = 'currentAuthenticatorEnrollment-recover';

const Body = BaseForm.extend({

  title: function () {
    return loc('oie.challenge.password.title', 'login');
  },

  save: function () {
    return loc('oie.verify.button', 'login');
  },
});

const Footer = BaseFooter.extend({
  links: function () {
    // recovery link
    var links = [];

    if (this.options.appState.getActionByPath(RECOVERY_LINK_ACTION)) {
      links.push({
        'type': 'link',
        'label': loc('oie.forgot.password', 'login'),
        'name': 'forgot-password',
        'actionPath': RECOVERY_LINK_ACTION,
      });
    }

    addSwitchAuthenticatorLink(this.options.appState, links);

    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer,
});
