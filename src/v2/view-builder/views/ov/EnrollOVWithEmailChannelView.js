import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const Body = BaseForm.extend({
  title: loc('oie.enroll.okta_verify.enroll.channel.email.title', 'login'),
  save: loc('oie.enroll.okta_verify.setupLink', 'login'),
  getUISchema () {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const description = {
      View: loc('oie.enroll.okta_verify.select.channel.email.description', 'login'),
      selector: '.o-form-fieldset-container',
    };
    schemas.push(description);
    return schemas;
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
