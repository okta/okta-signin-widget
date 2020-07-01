import { loc } from 'okta';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';
import BaseForm from '../../internals/BaseForm';

const Body = EnrollAuthenticatorPasswordView.prototype.Body.extend({

  className: 'password-authenticator',

  title () {
    return loc('oie.password.expired.title', 'login');
  },

  save () {
    return loc('oie.password.expired.primaryButton', 'login');
  },

  getPasswordPolicy () { 
    return this.options.appState.get('recoveryFactor').settings;
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
