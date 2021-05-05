import { loc, createCallout } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import PIVHeader from './PIVHeader';

const Body = BaseForm.extend({

  className: 'piv-cac-card',
  modelEvents: {
    request: 'startAuthentication',
    error: 'stopAuthentication',
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.model.set('useRedirect', true);
    this.addInstructions();
  },

  title() {
    return loc('piv.cac.title', 'login');
  },

  save() {
    return loc('retry', 'login');
  },

  addInstructions() {
    this.add(
      `<div class='piv-verify-text'>
        <p>${loc('piv.cac.card.insert', 'login')}</p>
        <div data-se='piv-waiting' class='okta-waiting-spinner'></div>
      </div>`
    );
  },
  
  startAuthentication: function() {
    this.$('.okta-waiting-spinner').show();
    this.$('.o-form-button-bar').hide();
  },

  stopAuthentication: function() {
    this.$('.okta-waiting-spinner').hide();
    this.$('.o-form-button-bar').show();
  },

  showMessages() {
    // PIV error messages are not form errors
    // Parse and display them here.
    // TODO: OKTA-383470
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
});

export default BaseAuthenticatorView.extend({
  Header: PIVHeader,
  Body,
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    const messages = this.options.appState.get('messages') || {};
    // if piv view has errors, show errors and stop authentication.
    // otherwise trigger authentication on page load
    if (Array.isArray(messages.value)) {
      this.form.stopAuthentication();
    } else {
      this.form.startAuthentication();
      this.form.trigger('save', this.model);
    }
  },
});
