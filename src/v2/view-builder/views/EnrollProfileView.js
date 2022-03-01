import { loc, _ } from 'okta';
import { BaseForm, BaseFooter, BaseView } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';

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
  saveForm() {
    // cleaning up model from empty optional attributes
    this.options.appState.cleanModelState(this.model.attributes);

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
  }
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
    let ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const currentSchema = JSON.parse(JSON.stringify((currentViewState.uiSchema)));

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
  }
});
