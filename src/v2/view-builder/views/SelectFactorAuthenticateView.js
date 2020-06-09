import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title: function () {
    if (this.isPasswordRecoveryFlow())  {
      return loc('password.reset.title.generic', 'login');
    }
    return loc('oie.select.authenticators.verify.title', 'login');
  },
  subtitle: function () {
    if (this.isPasswordRecoveryFlow())  {
      return loc('password.reset.verification', 'login');
    }
    return loc('oie.select.authenticators.verify.subtitle', 'login');
  },
  isPasswordRecoveryFlow () {
    const recoveryFactor = this.options.appState.get('recoveryFactor');
    return recoveryFactor && recoveryFactor.factorType === 'password';
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});

