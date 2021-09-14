import { loc, View } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import {
  getPasswordComplexityDescriptionForHtmlList,
  removeRequirementsFromError } from '../../utils/AuthenticatorUtil';
import hbs from 'handlebars-inline-precompile';

const Body = BaseForm.extend({
  title() {
    return loc('oie.duresspassword.enroll.title', 'login');
  },
  save() {
    return loc('oform.next', 'login');
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    const policy = this.getPasswordPolicySettings();
    this.displayPasswordPolicy(policy);
  },

  displayPasswordPolicy(policy) {
    if (policy) {
      const rulesList = getPasswordComplexityDescriptionForHtmlList( policy );
      this.add(
        View.extend({
          tagName: 'section',
          template:
            hbs`
            </div>
            <a href="https://en.wikipedia.org/wiki/Duress_code" target="_blank">
            {{i18n code="duresspassword.learnmore" bundle="login"}}</a>
            <div>
            <div class="password-authenticator--heading">
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

  triggerAfterError(model, error) {
    error.responseJSON = removeRequirementsFromError(error.responseJSON);
    this.options.appState.trigger('afterError', error);
  },

  getPasswordPolicySettings() {
    // This will be overridden by following scenario since the policies could be different for those.
    // - password reset (`ReEnrollAuthenticatorPasswordView.js`)
    //
    const relatesToObject = this.options.currentViewState.relatesTo;
    return relatesToObject?.value?.settings;
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.concat([
      {
        name: 'confirmPassword',
        label: loc('oie.duresspassword.confirmPasswordLabel','login'),
        type: 'password',
        'label-top': true,
        params: {
          showPasswordToggle: this.settings.get('showPasswordToggle'),
        }
      }
    ]);
  }
});

export default BaseAuthenticatorView.extend({

  Body,

  createModelClass() {
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
      validate() {
        if (this.get('credentials.passcode') !== this.get('confirmPassword') &&
            this.get('credential.value') !== this.get('confirmPassword')) {
          const errors = {
            'confirmPassword': loc('duresspassword.error.match', 'login'),
          };
          return errors;
        } else {
          return null;
        }
      }
    });
  }
});
