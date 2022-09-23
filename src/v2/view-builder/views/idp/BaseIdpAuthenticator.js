import { BaseForm } from '../../internals';
import BaseAuthenticatorView from 'v2/view-builder/components/BaseAuthenticatorView';

export const BaseIdPAuthenticatorBody =  BaseForm.extend({
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.model.set('useRedirect', true);
    this.add('<div class="okta-waiting-spinner"></div>');
  }
});

export const BaseIdpAuthenticatorView = BaseAuthenticatorView.extend({
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    // get the error messages
    const messages = this.options.appState.get('messages') || {};
    // In case of failure, don't auto-redirect which will result in infinite redirects.
    // so catch the error and render to the user.
    if (this.settings.get('features.skipIdpFactorVerificationBtn') && !Array.isArray(messages.value)) {
      this.$('.o-form-button-bar').hide();
      this.$('.okta-waiting-spinner').show();
      this.form.trigger('save', this.model);
    } else {
      this.$('.okta-waiting-spinner').hide();
      this.$('.o-form-button-bar').show();
    }
  }
});
