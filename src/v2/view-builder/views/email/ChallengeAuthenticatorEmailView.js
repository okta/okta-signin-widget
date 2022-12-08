import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';
import { getCheckYourEmailTitle, getEnterCodeLink } from './AuthenticatorEmailViewUtil';
import { $ } from 'okta';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const Body = BaseAuthenticatorEmailForm.extend(
  Object.assign({
    resendEmailAction: 'currentAuthenticatorEnrollment-resend',

    events: {
      'click .enter-auth-code-instead-link': 'showAuthCodeEntry',
    },

    initialize() {
      BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);

      const { email } =
        this.options.currentViewState.relatesTo?.value?.profile || {};

      const useEmailMagicLinkValue = this.isUseEmailMagicLink();

      if (useEmailMagicLinkValue) {
        this.add(getEnterCodeLink(), {
          prepend: true,
          selector: '.o-form-error-container',
        });
      } 

      this.add(getCheckYourEmailTitle(), {
        prepend: true,
        selector: '.o-form-error-container',
        options: { email, useEmailMagicLinkValue },
      });
    },

    postRender() {
      BaseAuthenticatorEmailForm.prototype.postRender.apply(this, arguments);
      if (this.isUseEmailMagicLink()) {
        // Use jQuery fn to wait until the dom is ready
        $(() => {
          this.showCodeEntryField(false);
          this.togglePrimaryButton(false);
        });
      }
    },

    isUseEmailMagicLink() {
      const useEmailMagicLink = this.options.appState.get('currentAuthenticatorEnrollment')?.
        contextualData?.useEmailMagicLink;
      return useEmailMagicLink !== undefined ? useEmailMagicLink : true;
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
