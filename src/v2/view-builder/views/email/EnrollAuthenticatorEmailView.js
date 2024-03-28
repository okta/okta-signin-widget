import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';
import { getCheckYourEmailTitle, getEnterCodeLink, getCheckYourEmailEnrollTitle } from './AuthenticatorEmailViewUtil';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const Body = BaseAuthenticatorEmailForm.extend(
  Object.assign({
    resendEmailAction: 'currentAuthenticator-resend',

    initialize() {
      BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);

      const email = this.options.appState.get('user')?.profile?.email || this.options.appState.get('user')?.identifier
       || {};

      const useEmailMagicLinkValue = this.isUseEmailMagicLink();

      if (useEmailMagicLinkValue !== undefined) {
        
        this.noButtonBar = true;
        this.events['click .enter-auth-code-instead-link'] = 'showAuthCodeEntry';

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
      } else {
        this.add(getCheckYourEmailEnrollTitle(), {
          prepend: true,
          selector: '.o-form-error-container',
        });
      }
    },

    postRender() {
      BaseAuthenticatorEmailForm.prototype.postRender.apply(this, arguments);
      if (this.isUseEmailMagicLink() !== undefined) {
        if (this.isUseEmailMagicLink()) {
          this.showCodeEntryField(false);
        } else {
          this.noButtonBar = false;
        }
      }
    },

    isUseEmailMagicLink() {
      return this.options.appState.get('currentAuthenticator')?.
        contextualData?.useEmailMagicLink;
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
