import { loc } from 'okta';
import { BaseForm } from '../../internals';
import AuthenticatorFooter from '../../components/AuthenticatorFooter';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { getForgotPasswordLink } from '../../utils/LinksUtil';


const Body = BaseForm.extend({

  title: function() {
    return loc('oie.password.challenge.title', 'login');
  },

  save: function() {
    return loc('mfa.challenge.verify', 'login');
  },
});

const Footer = AuthenticatorFooter.extend({
  links: function() {
    let links = AuthenticatorFooter.prototype.links.apply(this, arguments);

    links = getForgotPasswordLink(this.options.appState, this.options.settings).concat(links);

    return links;
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
