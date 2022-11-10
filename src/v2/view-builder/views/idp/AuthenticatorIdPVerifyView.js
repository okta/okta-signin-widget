import { loc } from '@okta/courage';
import { BaseIdPAuthenticatorBody, BaseIdpAuthenticatorView} from './BaseIdpAuthenticator';

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

export default BaseIdpAuthenticatorView.extend({
  Body
});
