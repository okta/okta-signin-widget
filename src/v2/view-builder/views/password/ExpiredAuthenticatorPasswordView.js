import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import { default as EnrollAuthenticatorPasswordView, PasswordForm } from './EnrollAuthenticatorPasswordView';

const Body = PasswordForm.extend({

  className: 'password-authenticator',

  title () {
    return loc('oie.password.expired.title', 'login');
  },

  save () {
    return loc('oie.password.expired.primaryButton', 'login');
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    const passwordPolicy = this.options.appState.get('recoveryFactor');
    this.displayPasswordPolicy(passwordPolicy);
  },

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);

    return uiSchemas.concat([
      {
        name: 'confirmPassword',
        label: loc('oie.password.expired.confirmPasswordLabel','login'),
        type: 'password',
        'label-top': true,
        params: {
          showPasswordToggle: true
        }
      }
    ]);
  },

});

export default EnrollAuthenticatorPasswordView.extend({ Body });
