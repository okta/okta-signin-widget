import { loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { getPasswordComplexityDescriptionForHtmlList } from '../../utils/FactorUtil';

const Body = BaseForm.extend({
  title () {
    return loc('oie.password.enroll.title', 'login');
  },
  save () {
    return loc('oie.next.button', 'login');
  },

  displayPasswordPolicy (policy) {
    if (policy && policy.settings) {
      let listHtml = '';
      const rulesList = getPasswordComplexityDescriptionForHtmlList( policy.settings );
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
    }
  },

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.concat([
      {
        name: 'confirmPassword',
        label: loc('oie.password.confirmPasswordLabel','login'),
        type: 'password',
        'label-top': true,
        params: {
          showPasswordToggle: true
        }
      }
    ]);
  }
});

export default BaseAuthenticatorView.extend({

  Body,

  createModelClass () {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign(
      {
        confirmPassword: {
          type: 'string',
          required: true,
        }
      },
      ModelClass.prototype.local,
    );
    return ModelClass.extend({
      local,
      validate () {
        if (this.get('credentials.passcode') !== this.get('confirmPassword') &&
          this.get('credential.value') !== this.get('confirmPassword')) {
          const errors = {
            'confirmPassword': loc('oie.password.match.error', 'login'),
          };
          return errors;
        }
      }
    });
  }
});

export { Body as PasswordForm };