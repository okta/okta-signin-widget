import { createCallout, loc } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({

  title () {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return this.options.isChallenge
      ? loc('oie.idp.challenge.title', 'login', [displayName])
      : loc('oie.idp.enroll.title', 'login', [displayName]);
  },

  subtitle () {
    const displayName = this.options.appState.getAuthenticatorDisplayName();
    return this.options.isChallenge
      ? loc('oie.idp.challenge.description', 'login', [displayName])
      : loc('oie.idp.enroll.description', 'login', [displayName]);
  },

  showMessages () {
    // IdP Authenticator error messages are not form errors
    // Parse and display them here.
    const messages = this.options.appState.get('messages') || {};
    if (Array.isArray(messages.value)) {
      this.add('<div class="ion-messages-container”></div>', '.o-form-error-container');

      messages
        .value
        .forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj.class === 'ERROR') {
            this.add(createCallout({
              content: msg,
              type: 'error',
            }), '.o-form-error-container');
          } else {
            this.add(`<p>${msg}</p>`, '.ion-messages-container');
          }
        });
    }
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

    // The IdP Authenticator doesn't have a traditional enroll/challenge form.
    // We need to infer it based on if currentAuthenticatorEnrollment is included in the response
    const currentAuthenticatorEnrollment = this.options.appState.get('currentAuthenticatorEnrollment');
    this.options.isChallenge = !!currentAuthenticatorEnrollment;
  },
  Body,
});
