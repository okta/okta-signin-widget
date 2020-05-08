import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';
import { addSwitchAuthenticatorLink } from '../../utils/AuthenticatorUtil';

const recoveryLinkAction = 'factor-recover';

const Body = BaseForm.extend({

  title: function () {
    return loc('factor.password', 'login');
  },

  save: function () {
    return loc('mfa.challenge.verify', 'login');
  },
});

const Footer = BaseFooter.extend({
  links: function () {
    // recovery link
    var links = [];

    if (this.options.appState.getActionByPath(recoveryLinkAction)) {
      links.push({
        'type': 'link',
        'label': loc('forgotpassword', 'login'),
        'name': 'forgot-password',
        'actionPath': recoveryLinkAction,
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
