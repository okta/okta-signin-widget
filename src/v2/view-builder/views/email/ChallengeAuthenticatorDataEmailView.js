import { loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorView.prototype.Body;

const SubtitleView = View.extend({
  template: hbs`
    <div class="okta-form-subtitle" data-se="o-form-explain">
      {{#if email}}
        {{i18n
          code="oie.email.verify.subtitleWithEmailAddress"
          bundle="login"
          arguments="email"
          $1="<span class='strong no-translate'>$1</span>"
        }}
      {{else}}
        {{i18n
          code="oie.email.verify.subtitleWithoutEmailAddress"
          bundle="login"
          $1="<span class='strong'>$1</span>"
        }}
      {{/if}}
    </div>
  `,

  getTemplateData() {
    const email = this.options.appState.get('currentAuthenticatorEnrollment')?.profile?.email;
    return {
      email,
    };
  },
});

const Body = BaseAuthenticatorEmailForm.extend(
  {
    title() {
      return loc('oie.email.mfa.title', 'login');
    },

    save() {
      return loc('oie.email.verify.primaryButton', 'login');
    },

    postRender() {
      BaseAuthenticatorEmailForm.prototype.postRender.apply(this, arguments);
      this.add(SubtitleView, {
        prepend: true,
        selector: '.o-form-info-container',
      });
    },

    getUISchema() {
      // Prevent from displaying radio buttons on the UI
      const uiSchemas = BaseAuthenticatorEmailForm.prototype.getUISchema.apply(this, arguments);
      return uiSchemas.filter(schema => schema.name !== 'authenticator.methodType');
    },
  },
);

export default BaseAuthenticatorView.extend({
  Body,
});
