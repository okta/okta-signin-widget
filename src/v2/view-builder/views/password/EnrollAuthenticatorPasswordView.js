import { loc, View } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { getPasswordComplexityDescriptionForHtmlList } from '../../utils/FactorUtil';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const Body = BaseForm.extend({
  title () {
    return loc('oie.password.enroll.title', 'login');
  },
  save () {
    return loc('oie.next.button', 'login');
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    const policy = this.getPasswordPolicy();
    this.displayPasswordPolicy(policy);
  },

  displayPasswordPolicy (policy) {
    if (policy) {
      const rulesList = getPasswordComplexityDescriptionForHtmlList( policy );
      this.add(
        View.extend({
          tagName: 'section',
          template:
            `<div class="password-authenticator--heading">
              {{i18n code="password.complexity.requirements.header" bundle="login"}}
            </div>
            <ul class="password-authenticator--list">
              {{#each rulesList}}<li>{{this}}</li>{{/each}}
            </ul>`,
          getTemplateData: () => ({ rulesList }),
          attributes: {
            'data-se': 'password-authenticator--rules'
          }
        }),
        {
          prepend: true,
          selector: '.o-form-fieldset-container',
        }
      );
    }
  },

  getPasswordPolicy () {
    // This will be overridden by password expired and password will expire soon
    // scenarios since the policies could be different for those.
    return this.options.appState.get('currentAuthenticator').settings;
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
  Footer: AuthenticatorEnrollFooter,

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
