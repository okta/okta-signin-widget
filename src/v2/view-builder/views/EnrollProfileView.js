import { loc } from 'okta';
import { BaseForm, BaseFooter, BaseView } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';

const Body = BaseForm.extend({
  title () {
    return loc('registration.form.title', 'login');
  },

  save () {
    return loc('registration.form.submit', 'login');
  },

  saveForm () {
    this.settings.preSubmit(this.model.attributes,
      () => BaseForm.prototype.saveForm.apply(this, arguments),
      (error) => this.model.trigger('error', this.model, {
        responseJSON: error,
      })
    );
  }
});

const Footer = BaseFooter.extend({
  links () {
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
  createModelClass (currentViewState, optionUiSchemaConfig, settings) {
    let ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);

    settings.parseSchema(currentViewState.uiSchema,
      (schema) => {
        currentViewState.uiSchema = schema;
        ModelClass = BaseView.prototype.createModelClass.apply(this, currentViewState, optionUiSchemaConfig);
      },
      (error) => {
        ModelClass = ModelClass.extend({
          props: { error: {...error, type: 'object'}, ...ModelClass.prototype.props},
        });
      }
    );
    return ModelClass;
  },
  postRender () {
    BaseView.prototype.postRender.apply(this, arguments);

    const modelError = this.model.props.error;

    if (modelError) {
      this.model.trigger('error', this.model, {
        responseJSON: modelError,
      });
    }
  }
});
