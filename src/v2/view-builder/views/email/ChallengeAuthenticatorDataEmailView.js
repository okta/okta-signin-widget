import { loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorView.prototype.Body;

const SubtitleView = View.extend({
  template: hbs`
    <div class="okta-form-subtitle" data-se="o-form-explain">
      {{#if email}}
        {{#if secondaryEmail}}
          {{i18n
            code="oie.email.verify.subtitle.text.with.email.and.secondary.email"
            bundle="login"
            arguments="email;secondaryEmail"
            $1="<span class='strong no-translate'>$1</span>"
            $2="<span class='strong no-translate'>$2</span>"
          }}
        {{else}}
          {{i18n
            code="oie.email.verify.subtitle.text.with.email"
            bundle="login"
            arguments="email"
            $1="<span class='strong no-translate'>$1</span>"
          }}
        {{/if}}
      {{else}}
        {{i18n
          code="oie.email.verify.subtitle.text.without.email"
          bundle="login"
        }}
      {{/if}}
    </div>
  `,

  getTemplateData() {
    const email = this.options.appState.get('currentAuthenticatorEnrollment')?.profile?.email;
    const secondaryEmail = this.options.appState.get('currentAuthenticatorEnrollment')?.profile?.secondaryEmail;
    return {
      email,
      secondaryEmail
    };
  },
});

const Body = BaseAuthenticatorEmailForm.extend(
  {
    title() {
      return loc('oie.email.challenge.mfa.title', 'login');
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
