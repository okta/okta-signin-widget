import { loc, Model, _ } from '@okta/courage';
import { BaseForm, BaseFooter, BaseView, createIdpButtons } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import { getPasswordComplexityDescriptionForHtmlList } from '../utils/AuthenticatorUtil';
import { generatePasswordPolicyHtml } from './password/PasswordPolicyUtil';
import signInWithIdps from './signin/SignInWithIdps';

const Body = BaseForm.extend({
  title() {
    if (this.options.appState.getCurrentViewState().href.endsWith('idp/idx/enroll/update')) {
      const attributes = this.options.appState.attributes;
      if (attributes?.uiDisplay?.label) {
        return loc('oie.registration.form.customize.label', 'login', [attributes.uiDisplay.label]);
      } else {
        return loc('oie.primaryauth.submit', 'login');
      }
    }
    return loc('oie.registration.form.title', 'login');

  },

  save() {
    if (this.options.appState.getCurrentViewState().href.endsWith('idp/idx/enroll/update')) {
      const attributes = this.options.appState.attributes;
      if (attributes?.uiDisplay?.buttonLabel) {
        return loc('oie.registration.form.customize.buttonLabel', 'login', [attributes.uiDisplay.buttonLabel]);
      } else {
        return loc('oie.registration.form.update.submit', 'login');
      }
    }
    return loc('oie.registration.form.submit', 'login');

  },
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.model.set('userProfile.email', this.options.appState.get('lastIdentifier'));
  },
  saveForm() {
    // SIW customization hook for registration
    this.settings.preRegistrationSubmit(this.model.toJSON(),
      (postData) => {
        this.model.attributes = {...this.model.attributes, ...this.model.parse(postData)};
        BaseForm.prototype.saveForm.call(this, this.model);
      },
      (error) => this.model.trigger('error', this.model, {
        responseJSON: error,
      })
    );
  },
  triggerAfterError(model, error) {
    // render errors to view
    const hasErrors = error?.responseJSON?.errorCauses
      && Array.isArray(error.responseJSON.errorCauses);

    if (hasErrors) {
      error.responseJSON.errorCauses.forEach((err) => {
        // only do this for invalid password for password with SSR
        if (err.errorKey?.includes('password.passwordRequirementsNotMet')) {
          err.errorSummary = loc('registration.error.password.passwordRequirementsNotMet', 'login');
        } 
      });
    }

    this.options.appState.trigger('afterError', error);
  },
});

const Footer = BaseFooter.extend({
  links() {
    const links = [];
    if (this.options.appState.hasRemediationObject(RemediationForms.SELECT_IDENTIFY)) {
      links.push({
        'type': 'link',
        'label': loc('haveaccount', 'login'),
        'name': 'back',
        'actionPath': RemediationForms.SELECT_IDENTIFY,
      });
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer,
  createModelClass(currentViewState, optionUiSchemaConfig, settings) {
    const currentSchema = JSON.parse(JSON.stringify((currentViewState.uiSchema)));
    let ModelClass = BaseView.prototype.createModelClass.apply(this, arguments, currentViewState);

    ModelClass = ModelClass.extend({
      toJSON: function() {
        const modelJSON = Model.prototype.toJSON.call(this, arguments, currentViewState);
        // delete optional attributes if they are empty and not required
        if(modelJSON.userProfile) {
          const uiSchema = currentViewState.uiSchema;
          const userProfile = modelJSON.userProfile;
          _.each(userProfile, (value, name) => {
            if (_.isEmpty(value)) {
              const uiSchemaProperty = uiSchema.find(schema => schema.name === `userProfile.${name}`);
              if (!_.isUndefined(uiSchemaProperty) && !uiSchemaProperty.required) {
                delete userProfile[name];
              }
            }
          });
        }
        return modelJSON;
      }
    });

    settings.parseRegistrationSchema(currentSchema,
      (schema) => {
        if (!_.isEqual(schema, currentViewState.uiSchema)) {
          currentViewState.uiSchema = schema;
          ModelClass = BaseView.prototype.createModelClass.call(this, currentViewState, optionUiSchemaConfig);
        }
      },
      (error) => {
        ModelClass = ModelClass.extend({
          local: {
            parseSchemaError: {
              value: error,
              type: 'object',
            },
            ...ModelClass.prototype.local
          },
        });
      }
    );
    return ModelClass;
  },
  postRender() {
    BaseView.prototype.postRender.apply(this, arguments);

    const modelError = this.model.get('parseSchemaError');

    if (modelError) {
      this.model.trigger('error', this.model, {
        responseJSON: modelError,
      });
    }

    // Prompt for password w/ SSR if enabled (credentials object in remediation)
    this.renderPasswordPolicySettings();

    const idpButtons = createIdpButtons(this.options);
    if (Array.isArray(idpButtons) && idpButtons.length) {
      this._addIdpView(idpButtons);
    }
    
  },
  renderPasswordPolicySettings() {
    // retrieve password policy from "credentials" object in remediation
    const currentViewState = this.options.currentViewState.value;
    const credentials = currentViewState.filter((obj) => { return obj.name === 'credentials'; })[0];

    // if "passcode" is present in "credentials", render password rules
    const form = credentials?.form?.value;
    if (form && form.filter((obj) => { return obj.name === 'passcode'; })) {
      generatePasswordPolicyHtml(this,
        getPasswordComplexityDescriptionForHtmlList(credentials?.relatesTo?.value?.settings),
        false);
    }
  },

  _addIdpView(idpButtons) {
    // We check the 'idpDisplay' option config to determine whether to render the idp buttons 
    // above or below the login fields
    const idpDisplay = this.options.settings.get('idpDisplay');
    const isPrimaryIdpDisplay = idpDisplay && idpDisplay.toUpperCase() === 'PRIMARY';

    this.add(signInWithIdps, {
      prepend: isPrimaryIdpDisplay,
      selector: isPrimaryIdpDisplay ? '.o-form-fieldset-container' : '.o-form-button-bar',
      options: {
        idpButtons,
        isPrimaryIdpDisplay
      }
    });
  },
});
