import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';
import BrowserFeatures from '../../../../util/BrowserFeatures';

const Body = BaseForm.extend({
  title () {
    return (BrowserFeatures.isAndroid() || BrowserFeatures.isIOS())
      ? loc('oie.enroll.okta_verify.setup.title', 'login')
      : loc('oie.enroll.okta_verify.select.channel.title', 'login');
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
