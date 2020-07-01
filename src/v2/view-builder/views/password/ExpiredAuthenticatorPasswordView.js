import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import EnrollAuthenticatorPasswordView from './EnrollAuthenticatorPasswordView';
import { getPasswordComplexityDescriptionForHtmlList } from '../../utils/FactorUtil';

const Body = BaseForm.extend({

  className: 'password-authenticator',

  title () {
    return loc('oie.password.expired.title', 'login');
  },

  save () {
    return loc('oie.password.expired.primaryButton', 'login');
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    let listHtml = '';
    const { settings } = this.options.appState.get('recoveryFactor');
    const rulesList = getPasswordComplexityDescriptionForHtmlList( settings );
    rulesList.forEach(rule => listHtml += `<li>${rule}</li>`);

    this.add(
      `<section class="password-authenticator__rules">
        <div class="password-authenticator__rules-heading">
          ${loc('password.complexity.requirements.header', 'login')}
        </div>
        <ul class="password-authenticator__rules-list">${listHtml}</ul>
      </section>`,
      {
        prepend: true,
        selector: '.o-form-fieldset-container',
      }
    );
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
