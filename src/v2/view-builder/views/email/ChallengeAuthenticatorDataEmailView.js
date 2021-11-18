import { loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseAuthenticatorEmailView from './BaseAuthenticatorEmailView';

const BaseAuthenticatorEmailForm = BaseAuthenticatorEmailView.prototype.Body;

const SubtitleView = View.extend({
  template: hbs`
    <div class="okta-form-subtitle" data-se="o-form-explain">
      {{i18n
        code="oie.email.verify.subtitle"
        bundle="login"
        arguments="email"
        $1="<span class='strong no-translate'>$1</span>"
      }}
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

export default BaseAuthenticatorEmailView.extend({
  Body,
});
