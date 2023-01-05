import { loc } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import {
  getPasswordComplexityDescriptionForHtmlList,
  removeRequirementsFromError } from '../../utils/AuthenticatorUtil';
import { generatePasswordPolicyHtml } from './PasswordPolicyUtil';

const Body = BaseForm.extend({
  title() {
    return loc('oie.password.enroll.title', 'login');
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
      generatePasswordPolicyHtml(this, rulesList, true);
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
    const confirmPassword = {
      name: 'confirmPassword',
      label: loc('oie.password.confirmPasswordLabel','login'),
      type: 'password',
      'label-top': true,
      params: {
        showPasswordToggle: this.settings.get('showPasswordToggle'),
      }
    };

    const updatedSchema = [];

    for (let field of uiSchemas) {
      updatedSchema.push(field);
      if (field.name === 'credentials.passcode') {
        updatedSchema.push(confirmPassword);
      }
    }

    return updatedSchema;
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
            'confirmPassword': loc('password.error.match', 'login'),
          };
          return errors;
        } else {
          return null;
        }
      }
    });
  }
});
