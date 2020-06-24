import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const recoveryLinkAction = 'factor-recover';

const Body = BaseForm.extend({

  title: function () {
    return loc('factor.password', 'login');
  },

  save: function () {
    return loc('mfa.challenge.verify', 'login');
  },
});

const Footer = AuthenticatorVerifyFooter.extend({
  links: function () {
    let links = AuthenticatorVerifyFooter.prototype.links.apply(this, arguments);

    if (this.options.appState.getActionByPath(recoveryLinkAction)) {
      links = [
        {
          'type': 'link',
          'label': loc('forgotpassword', 'login'),
          'name': 'forgot-password',
          'actionPath': recoveryLinkAction,
        }
      ].concat(links);
    }

    return links;
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
