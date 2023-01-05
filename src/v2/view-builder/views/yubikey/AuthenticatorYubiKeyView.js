import { loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const ExampleView = View.extend({
  template: hbs`<div aria-hidden="true" class="yubikey-demo"></div>`,
});

const Body = BaseForm.extend({
  title() {
    return this.options.appState.isAuthenticatorChallenge()
      ? loc('oie.yubikey.challenge.title', 'login')
      : loc('oie.yubikey.enroll.title', 'login');
  },

  subtitle() {
    return loc('oie.yubikey.description', 'login');
  },

  save() {
    return loc('mfa.challenge.verify', 'login');
  },

  getUISchema() {
    const schema = BaseForm.prototype.getUISchema.apply(this, arguments);
    schema.unshift({
      View: ExampleView,
      selector: '.o-form-fieldset-container',
    });
    return schema;
  },

});

export default BaseAuthenticatorView.extend({
  Body,
});
