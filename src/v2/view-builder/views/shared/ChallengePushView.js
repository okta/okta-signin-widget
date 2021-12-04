// Common view for OV push and custom push.
import { loc, createButton, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { BaseForm } from '../../internals';
import polling from '../shared/polling';
import { WARNING_TIMEOUT } from '../../utils/Constants';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { AUTHENTICATOR_KEY } from '../../../ion/RemediationConstants';

const warningTemplate = View.extend({
  className: 'okta-form-infobox-warning infobox infobox-warning',
  template: hbs`
    <span class="icon warning-16"></span>
    <p>{{warning}}</p>
  `
});
const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    title() {
      return this.isOV() ? loc('oie.okta_verify.push.title', 'login') :
        loc('oie.verify.custom_app.title', 'login', [this.options.appState.getAuthenticatorDisplayName()]);
    },

    initialize() {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.hasSavingState = !this.isOV();
      this.listenTo(this.model, 'error', this.stopPoll);
      this.addView();
    },

    addView() {
      this.add(createButton({
        className: 'button button-wide button-primary send-push link-button-disabled',
        title: this.isOV() ? loc('oie.okta_verify.push.sent', 'login') : loc('oie.custom_app.push.sent', 'login'),
        click: (e) => {
          e.preventDefault();
        }
      }));
      this.add(
        `<span class='accessibility-text' role='alert'>
        ${this.isOV() ? loc('oie.okta_verify.push.sent', 'login') : loc('oie.custom_app.push.sent', 'login')}</span>`,
      );
    },

    postRender() {
      const className = this.isOV() ?
        'okta-verify-push-challenge' : ' custom-app-push-challenge';
      this.$el.addClass(className);
      // Move checkbox below the button
      if (this.isOV()) {
        const checkbox = this.$el.find('.o-form-fieldset');
        checkbox.length && this.$el.find('.o-form-fieldset-container').append(checkbox);
      }
      this.startPoll();
    },

    startPoll() {
      this.startPolling();
      this.warningTimeout = setTimeout(() => {
        const warningText = this.isOV() ? loc('oktaverify.warning', 'login') :
          loc('oie.custom_app.push.warning', 'login', [this.options.appState.getAuthenticatorDisplayName()]);
        this.showWarning(warningText);
      }, WARNING_TIMEOUT);
    },

    stopPoll() {
      this.stopPolling();
      this.clearWarning();
    },

    showWarning(msg) {
      this.clearWarning();
      this.add(warningTemplate, '.o-form-error-container', {options: {warning: msg}});
    },

    clearWarning() {
      if (this.$('.o-form-error-container div').hasClass('okta-form-infobox-warning')) {
        this.$('.okta-form-infobox-warning').remove();
      }
      clearTimeout(this.warningTimeout);
    },

    remove() {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },

    isOV() {
      return this.options.appState.get('authenticatorKey') === AUTHENTICATOR_KEY.OV;
    },
  },

  polling,
));

const AuthenticatorView = BaseAuthenticatorView.extend({
  Body,
});

export {
  AuthenticatorView as default,
  Body,
};
