import { BaseForm } from '../../internals';
import BaseAuthenticatorView from 'v2/view-builder/components/BaseAuthenticatorView';
import Util from 'util/Util';

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

    // OKTA-791813 - custom idp redirect fails during OV enrollment within Android OV webview
    // in some situations the OV enrollment redirect-idp contains more than 1 remediation and therefore will
    // be converted to a `challenge-authenticator` remediation rather than the usual `success-redirect`. In
    // these situations a button needs to be rendered regardless
    if (Util.isAndroidOVEnrollment()) {
      this.$('.o-form-button-bar').hide();
      const currentViewState = this.options.appState.getCurrentViewState();
      this.add(createButton({
        className: 'button button-primary',
        title: loc('oform.verify', 'login'),      // TODO: check with design to determine best button title (how would a customer change it)
        id: 'launch-enrollment-ov',
        click: () => {
          Util.redirectWithFormGet(currentViewState.href);
        }
      }));
    }

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
