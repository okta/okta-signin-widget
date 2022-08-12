import hbs from 'handlebars-inline-precompile';
import { View } from 'okta';

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
          {{i18n code="oie.email.verify.alternate.show.verificationCode.text"}}
      </button>
    `,
});

export function getCheckYourEmailTitle() {
  return CheckYourEmailTitle;
}

export function getEnterCodeLink() {
  return EnterCodeLink;
}