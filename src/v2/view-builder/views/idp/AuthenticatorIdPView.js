import { _, loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';

const Body = BaseForm.extend({

  title () {
    return this.options.isChallenge
      ? loc('oie.idp.challenge.title', 'login', [this.options.displayName])
      : loc('oie.idp.enroll.title', 'login', [this.options.displayName]);
  },

  subtitle () {
    return this.options.isChallenge
      ? loc('oie.idp.challenge.description', 'login', [this.options.displayName])
      : loc('oie.idp.enroll.description', 'login', [this.options.displayName]);
  },

  save () {
    return this.options.isChallenge
      ? loc('mfa.challenge.verify', 'login')
      : loc('mfa.enroll', 'login');
  },

});

export default BaseAuthenticatorView.extend({
  initialize () {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);

    const currentAuthenticator = this.options.appState.get('currentAuthenticator');
    const authenticatorEnrollments = this.options.appState.get('authenticatorEnrollments')?.value || [];
    const existingAuthenticator = _.find(authenticatorEnrollments, { id: currentAuthenticator.id });

    // If the authenticator is already enrolled, we're in a challenge flow as opposed to enrollment
    this.options.isChallenge = existingAuthenticator || false;
    this.options.displayName = currentAuthenticator.displayName;

    this.Footer = this.options.isChallenge
      ? AuthenticatorVerifyFooter
      : AuthenticatorEnrollFooter;
  },
  Body,
});
