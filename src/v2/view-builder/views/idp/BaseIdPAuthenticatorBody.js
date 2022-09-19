import { BaseForm } from '../../internals';

export default BaseForm.extend({

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.model.set('useRedirect', true);
    this.add('<div class="okta-waiting-spinner"></div>');
  },

  postRender: function() {
    BaseForm.prototype.postRender.apply(this, arguments);
    // get the error messages
    const messages = this.options.appState.get('messages') || {};
    if (this.settings.get('features.skipIdpFactorVerificationBtn')) {
      // In case of failure, don't auto-redirect which will result in infinite redirects.
      // so catch the error and render to the user.
      if (Array.isArray(messages.value)) {
        this.$('.okta-waiting-spinner').hide();
        this.$('.o-form-button-bar').show();
      } else {
        this.$('.o-form-button-bar').hide();
        this.$('.okta-waiting-spinner').show();
        this.saveForm(this.model);
      }
    } else {
      this.$('.okta-waiting-spinner').hide();
      this.$('.o-form-button-bar').show();
    }
  }
});
