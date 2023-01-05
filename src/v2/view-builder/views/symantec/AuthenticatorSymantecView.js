import { loc } from '@okta/courage';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({

  title() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return this.options.appState.isAuthenticatorChallenge()
      ? loc('oie.symantecVip.challenge.title', 'login', [displayName])
      : loc('oie.symantecVip.enroll.title', 'login', [displayName]);
  },

  subtitle() {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return this.options.appState.isAuthenticatorChallenge()
      ? loc('oie.symantecVip.challenge.description', 'login', [displayName])
      : loc('oie.symantecVip.enroll.description', 'login', [displayName]);
  },

  save() {
    return this.options.appState.isAuthenticatorChallenge()
      ? loc('mfa.challenge.verify', 'login')
      : loc('mfa.enroll', 'login');
  },

});

export default BaseAuthenticatorView.extend({
  Body,
});
