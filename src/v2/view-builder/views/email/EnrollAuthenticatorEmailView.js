import { loc } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { View } from 'okta';
import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const CheckYourEmailTitle = View.extend({
  className: 'okta-form-subtitle',
  attributes: {
    'data-se': 'o-form-explain',
  },
  template: hbs`
    {{#if email}}
      {{i18n 
          code="oie.email.verify.alternate.magicLinkToEmailAddress" 
          bundle="login" 
          arguments="email" 
          $1="<span class='strong'>$1</span>"
      }}
    {{else}}
      {{i18n 
        code="oie.email.verify.alternate.magicLinkToYourEmail" 
        bundle="login"
      }}
    {{/if}}
    
    {{#if useEmailMagicLinkValue}}
      {{i18n 
        code="oie.email.verify.alternate.instructions" 
        bundle="login" 
      }}
    {{else}}
      {{i18n 
        code="oie.email.verify.alternate.verificationCode.instructions" 
        bundle="login" 
      }}
    {{/if}}
  `,

  getTemplateData() {
    return this.options;
  },
});

const EnterCodeLink = View.extend({
  template: hbs`
    <button 
      class="button-link enter-auth-code-instead-link"
    >
        {{i18n code="oie.email.verify.alternate.showCodeTextField"}}
    </button>
  `,
});

const Body = BaseAuthenticatorEmailForm.extend(
  Object.assign({
    resendEmailAction: 'currentAuthenticator-resend',

    initialize() {
      BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);

      const { email } =
        this.options.currentViewState.relatesTo?.value?.profile || {};

      const useEmailMagicLinkValue = this.isUseEmailMagicLink();

      if (useEmailMagicLinkValue !== undefined) {
        
        this.noButtonBar = true;
        this.events['click .enter-auth-code-instead-link'] = 'showAuthCodeEntry';

        if (useEmailMagicLinkValue) {
          this.add(EnterCodeLink, {
            prepend: true,
            selector: '.o-form-error-container',
          });
        } 
  
        this.add(CheckYourEmailTitle, {
          prepend: true,
          selector: '.o-form-error-container',
          options: { email, useEmailMagicLinkValue },
        });
      } else {
        this.subtitle = loc('oie.email.enroll.subtitle', 'login');
      }
    },

    postRender() {
      if (this.isUseEmailMagicLink() !== undefined) {
        BaseAuthenticatorEmailForm.prototype.postRender.apply(this, arguments);
        if (this.isUseEmailMagicLink()) {
          this.showCodeEntryField(false);
        } else {
          this.noButtonBar = false;
        }
      }
    },

    isUseEmailMagicLink() {
      return this.options.appState.get('currentAuthenticator')?.
      contextualData?.useEmailMagicLink;;
    },

    showAuthCodeEntry() {
      this.noButtonBar = false;
      this.render();

      this.showCodeEntryField(true);
      this.showEnterAuthCodeInsteadLink(false);
    },

    showCodeEntryField(show = true) {
      const $textField = this.$el.find('.o-form-fieldset-container');
      $textField.toggle(show);
    },

    showEnterAuthCodeInsteadLink(show = true) {
      const $enterAuthCodeInsteadLink = this.$el.find(
        '.enter-auth-code-instead-link'
      );
      $enterAuthCodeInsteadLink.toggle(show);
    },
  })
);

export default BaseAuthenticatorEmailView.extend({
  Body,
});
