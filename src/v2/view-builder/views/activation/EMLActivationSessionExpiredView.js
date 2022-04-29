import { BaseFooter, BaseView } from '../../internals';
import BaseAuthenticatorEmailView from '../../views/email/BaseAuthenticatorEmailView';
import EmailAuthenticatorHeader from '../../components/EmailAuthenticatorHeader';
import { getBackToSignInLink, getSwitchAuthenticatorLink } from '../../utils/LinksUtil';

import { loc } from 'okta';

const Body = BaseAuthenticatorEmailView.prototype.Body.extend({

  title() {
    return loc('idx.eml.activation.session.expired.title', 'login');
  },

  save() {
    return loc('idx.eml.activation.session.expired.button.label', 'login');
  },
});

const Footer = BaseFooter.extend({
  hasBackToSignInLink: false, // override default 'back to sign in' link to replace w/ our own URL
  links: function() {
    // get 'verify with something else' link
    const verifyWithLink = getSwitchAuthenticatorLink(this.options.appState);

    // generate back to sign in link
    // can set URL in value:
    // this.options.settings.set('baseUrl', 'https://www.okta.com/');
    const backToSignIn = getBackToSignInLink(this.options.settings);

    return verifyWithLink.concat(backToSignIn);
  }
});

export default BaseView.extend({
  Header: EmailAuthenticatorHeader,
  Body,
  Footer,
});