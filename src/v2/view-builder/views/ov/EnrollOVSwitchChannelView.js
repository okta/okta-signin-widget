import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';
import { isMobileDevice } from '../../../../util/BrowserFeatures';

const Body = BaseForm.extend({
  title () {
    return isMobileDevice() ? loc('oie.enroll.okta_verify.select.channel.mobile.title', 'login'):
      loc('oie.enroll.okta_verify.select.channel.title', 'login');
  },
  getUISchema () {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const description = {
      View: loc('oie.enroll.okta_verify.select.channel.description', 'login'),
      selector: '.o-form-fieldset-container',
    };
    return [description, ...schemas];
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
