import { loc } from 'okta';
import BaseIdPAuthenticatorBody from './BaseIdPAuthenticatorBody';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseIdPAuthenticatorBody.extend({

  title() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return loc('oie.idp.challenge.title', 'login', [displayName]);
  },

  subtitle() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return loc('oie.idp.challenge.description', 'login', [displayName]);
  },

  save() {
    return loc('mfa.challenge.verify', 'login');
  },

});

export default BaseAuthenticatorView.extend({
  Body,
});
