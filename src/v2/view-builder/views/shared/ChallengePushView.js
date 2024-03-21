// Common view for OV push and custom push.
import { loc, createButton, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseFormWithPolling } from '../../internals';
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
const Body = BaseFormWithPolling.extend(Object.assign(
  {
    noButtonBar: true,

    title() {
      return this.isOV() ? loc('oie.okta_verify.push.title', 'login') :
        loc('oie.verify.custom_app.title', 'login', [this.options.appState.getAuthenticatorDisplayName()]);
    },

    initialize() {
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      // 'hasSavingState' would be true by default.
      // Setting it to false when auth key is okta_verify or custom_app with autochallenge schema
      // So that 'o-form-saving' css class is not added while polling and checkbox remains enabled.
      if ((this.isOV() || this.isCustomApp()) && this.isAutoChallengeSupported()) {
        this.hasSavingState = false;
      }
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

    render() {
      BaseFormWithPolling.prototype.render.apply(this, arguments);

      const checkbox = this.$el.find('[data-se="o-form-fieldset-autoChallenge"]');

      if (!this.isAutoChallengeSupported()) {
        checkbox.length && checkbox.hide();
      } else if (this.isOV() || this.isCustomApp()) {
        // Move checkbox below the button
        // Checkbox is rendered by BaseForm using remediation response and
        // hence by default always gets added above buttons.
        checkbox.length && this.$el.find('.o-form-fieldset-container').append(checkbox);
      }
    },

    postRender() {
      BaseFormWithPolling.prototype.postRender.apply(this, arguments);

      const className = this.isOV() ?
        'okta-verify-push-challenge' : ' custom-app-push-challenge';
      this.$el.addClass(className);
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
      BaseFormWithPolling.prototype.remove.apply(this, arguments);
      this.stopPoll();
    },

    isOV() {
      return this.options.appState.get('authenticatorKey') === AUTHENTICATOR_KEY.OV;
    },

    isCustomApp() {
      return this.options.appState.get('authenticatorKey') === AUTHENTICATOR_KEY.CUSTOM_APP;
    },

    isAutoChallengeSupported() {
      return (this.options.appState.getSchemaByName('autoChallenge') !== null &&
        this.options.appState.getSchemaByName('autoChallenge') !== undefined);
    }
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
