import { loc } from '@okta/courage';
import { BaseIdPAuthenticatorBody, BaseIdpAuthenticatorView} from './BaseIdpAuthenticator';

const Body = BaseIdPAuthenticatorBody.extend({

  title() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return loc('oie.idp.enroll.title', 'login', [displayName]);
  },

  subtitle() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return loc('oie.idp.enroll.description', 'login', [displayName]);
  },

  save() {
    return loc('mfa.enroll', 'login');
  },

});

export default BaseIdpAuthenticatorView.extend({
  Body,
});
