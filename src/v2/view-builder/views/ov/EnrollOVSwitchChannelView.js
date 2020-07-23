import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const Body = BaseForm.extend({
  title: loc('oie.enroll.okta_verify.select.channel.title', 'login'),
  getUISchema () {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const description = {
      View: loc('oie.enroll.okta_verify.select.channel.description', 'login'),
      selector: '.o-form-fieldset-container',
    };
    schemas.forEach((schema) => {
      if (schema.name === 'authenticator.channel') {
        schema.options = schema.options.filter((item) => {
          return ['email', 'sms'].includes(item.value);
        });
      }
    });
    return [description, ...schemas];
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
