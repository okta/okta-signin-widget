import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { getForgotPasswordLink } from '../../utils/LinksUtil';


const Body = BaseForm.extend({

  title: function () {
    return loc('oie.password.challenge.title', 'login');
  },

  save: function () {
    return loc('mfa.challenge.verify', 'login');
  },
});

const Footer = AuthenticatorVerifyFooter.extend({
  links: function () {
    let links = AuthenticatorVerifyFooter.prototype.links.apply(this, arguments);

    links = getForgotPasswordLink(this.options.appState, this.options.settings).concat(links);

    return links;
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
