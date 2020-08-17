import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title: function () {
    if (this.isPasswordRecoveryFlow())  {
      return loc('password.reset.title.generic', 'login');
    }
    return loc('mfa.factors.dropdown.title', 'login');
  },
  subtitle: function () {
    if (this.isPasswordRecoveryFlow())  {
      return loc('password.reset.verification', 'login');
    }
    return loc('verify.choices.description', 'login');
  },
  isPasswordRecoveryFlow () {
    const recoveryFactor = this.options.appState.get('recoveryFactor');
    return recoveryFactor?.factorType === 'password';
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});

