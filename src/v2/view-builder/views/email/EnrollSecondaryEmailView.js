import { _, loc } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({

  className: 'secondary-email-enroll',

  title() {
    return loc('oie.secondemail.enroll.title', 'login');
  },

  subtitle() {
    return loc('oie.secondemail.enroll.subtitle', 'login');
  },

  save() {
    return loc('oie.secondemail.button', 'login');
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const description = {
      View: loc('oie.secondemail.enroll.field.explain', 'login'),
      selector: '.o-form-fieldset-container',
    };
    uiSchemas.push(description);
    return uiSchemas;
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
  },
});

export default BaseAuthenticatorView.extend({
  Body
});
