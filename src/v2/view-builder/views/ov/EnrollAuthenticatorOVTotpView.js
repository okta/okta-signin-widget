import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const Body = BaseForm.extend({
  title: loc('oie.okta_verify.enroll.title', 'login'),
  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    uiSchemas.push({
      View: `
      <img src="${this.options.appState.get('currentAuthenticator').contextualData.qrcode.href}"></img>
      Totp shared secret - ${this.options.appState.get('currentAuthenticator').contextualData.sharedSecret}
      `,
    });
    return uiSchemas;
  },
  save: loc('mfa.challenge.verify', 'login')
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
