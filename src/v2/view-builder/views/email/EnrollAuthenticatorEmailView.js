import { loc, $ } from 'okta';
import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';
import { getCheckYourEmailTitle, getEnterCodeLink } from './AuthenticatorEmailViewUtil';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const Body = BaseAuthenticatorEmailForm.extend(
  Object.assign({
    resendEmailAction: 'currentAuthenticator-resend',

    events: {
      'click .enter-auth-code-instead-link': 'showAuthCodeEntry',
    },

    initialize() {
      BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);

      const email = this.options.appState.get('user')?.identifier || {};

      const useEmailMagicLinkValue = this.isUseEmailMagicLink();

      if (useEmailMagicLinkValue) {
        this.add(getEnterCodeLink(), {
          prepend: true,
          selector: '.o-form-error-container',
        });
  
        this.add(getCheckYourEmailTitle(), {
          prepend: true,
          selector: '.o-form-error-container',
          options: { email, useEmailMagicLinkValue },
        });
      } else {
        this.subtitle = loc('oie.email.enroll.subtitle', 'login');
      }
    },

    postRender() {
      BaseAuthenticatorEmailForm.prototype.postRender.apply(this, arguments);
      if (this.isUseEmailMagicLink()) {
        $(() => {
          this.showCodeEntryField(false);
          this.togglePrimaryButton(false);
        });
      }
    },

    isUseEmailMagicLink() {
      return !!this.options.appState.get('currentAuthenticator')?.
        contextualData?.useEmailMagicLink;
    },

    showAuthCodeEntry() {
      this.togglePrimaryButton(true);
      this.showCodeEntryField(true);
      this.removeEnterAuthCodeInsteadLink();
    },

    showCodeEntryField(show = true) {
      const $textField = this.$el.find('.o-form-fieldset-container');
      $textField.toggle(show);
    },

    removeEnterAuthCodeInsteadLink() {
      this.$el.find('.enter-auth-code-instead-link').remove();
    },
    togglePrimaryButton(state) {
      this.$el.find('.button.button-primary').toggle(state);
    }
  })
);

export default BaseAuthenticatorEmailView.extend({
  Body,
});
