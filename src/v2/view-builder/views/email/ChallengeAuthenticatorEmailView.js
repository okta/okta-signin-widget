import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';
import { getCheckYourEmailTitle, getEnterCodeLink } from './AuthenticatorEmailViewUtil';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const Body = BaseAuthenticatorEmailForm.extend(
  Object.assign({
    noButtonBar: true,
    resendEmailAction: 'currentAuthenticatorEnrollment-resend',

    events: {
      'click .enter-auth-code-instead-link': 'showAuthCodeEntry',
    },

    initialize() {
      BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);

      const { email, secondaryEmail } =
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
        options: { email, secondaryEmail, useEmailMagicLinkValue },
      });
    },

    postRender() {
      BaseAuthenticatorEmailForm.prototype.postRender.apply(this, arguments);
      if (this.isUseEmailMagicLink()) {
        this.showCodeEntryField(false);
      } else {
        this.noButtonBar = false;
      }
    },

    isUseEmailMagicLink() {
      const useEmailMagicLink = this.options.appState.get('currentAuthenticatorEnrollment')?.
        contextualData?.useEmailMagicLink;
      return useEmailMagicLink !== undefined ? useEmailMagicLink : true;
    },

    showAuthCodeEntry() {
      this.noButtonBar = false;
      this.render();

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
  })
);

export default BaseAuthenticatorEmailView.extend({
  Body,
});
