import { View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

// Courage doesn't support HTML, hence creating a subtitle here.
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
        $1="<span class='strong'>$1</span>"
      }}
    {{/if}}
    {{i18n 
      code="oie.email.verify.alternate.instructions" 
      bundle="login" 
    }}
  `,

  getTemplateData() {
    const { email } = this.options;
    return { email };
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
    noButtonBar: true,
    resendEmailAction: 'currentAuthenticatorEnrollment-resend',

    events: {
      'click .enter-auth-code-instead-link': 'showAuthCodeEntry',
    },

    initialize() {
      BaseAuthenticatorEmailForm.prototype.initialize.apply(this, arguments);

      const { email } =
        this.options.currentViewState.relatesTo?.value?.profile || {};

      this.add(EnterCodeLink, {
        prepend: true,
        selector: '.o-form-error-container',
      });

      this.add(CheckYourEmailTitle, {
        prepend: true,
        selector: '.o-form-error-container',
        options: { email },
      });
    },

    postRender() {
      this.showCodeEntryField(false);
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
