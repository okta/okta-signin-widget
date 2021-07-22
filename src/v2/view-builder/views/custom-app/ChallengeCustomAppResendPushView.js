import { loc } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'custom-app-verify-resend-push',

    title() {
      return loc('oie.verify.custom_app.title', 'login', [this.options.appState.getAuthenticatorDisplayName()]);
    },

    save() {
      return loc('oie.custom_app.push.resend', 'login');
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
