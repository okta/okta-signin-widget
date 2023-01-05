import { _, View } from '@okta/courage';
import BaseHeader from './BaseHeader';
import BaseForm from './BaseForm';
import BaseModel from './BaseModel';
import BaseFooter from './BaseFooter';
import hbs from '@okta/handlebars-inline-precompile';
import {getClassNameMapping} from '../../ion/ViewClassNamesFactory';

export default View.extend({

  Header: BaseHeader,

  Body: BaseForm,

  Footer: BaseFooter,

  className() {
    const appState = this.options.appState;

    const formName = appState.get('currentFormName');
    const authenticatorKey = appState.get('authenticatorKey');
    const methodType = appState.get('authenticatorMethodType');
    const isPasswordRecoveryFlow = appState.get('isPasswordRecoveryFlow');

    const additionalClassNames = getClassNameMapping(
      formName,
      authenticatorKey,
      methodType,
      isPasswordRecoveryFlow,
    );

    const classNames = ['siw-main-view'].concat(additionalClassNames);
    return classNames.join(' ');
  },

  template: hbs`
    <div class="siw-main-header"></div>
    <div class="siw-main-body"></div>
    <div class="siw-main-footer"></div>
  `,

  preRender() {
    View.prototype.preRender.apply(this, arguments);
    // Add Views
    if (this.Header !== null) {
      this.add(this.Header, {
        selector: '.siw-main-header',
        options: this.options,
      });
    }
    this.renderForm();
    this.add(this.Footer, {
      selector : '.siw-main-footer',
      options: this.options,
    });
  },

  renderForm() {
    let optionUiSchemaConfig;

    if (this.form) {
      this.form.remove();
      optionUiSchemaConfig = this.form.model.toJSON({verbose: true});
    }

    // Create Model
    const IonModel = this.createModelClass(
      this.options.currentViewState,
      optionUiSchemaConfig,
      this.settings,
    );

    const model = new IonModel ({
      formName: this.options.currentViewState.name,
    });

    if (!optionUiSchemaConfig) {
      optionUiSchemaConfig = model.toJSON({verbose: true});
    }

    this.model = model;
    this.form = this.add(this.Body, {
      selector : '.siw-main-body',
      options: Object.assign(
        {},
        this.options,
        {
          model,
          optionUiSchemaConfig,
        },
      ),
    }).last();

    _.each(model.attributes, (value, key) => {
      if (key.match(/sub_schema_local_[^ ]+/)) {
        // in order to render different sub-schema
        this.listenTo(model, `change:${key}`, () => {
          this.renderForm();
        });
      }
    });
  },

  createModelClass(currentViewState, optionUiSchemaConfig = {}) {
    return BaseModel.create(currentViewState, optionUiSchemaConfig);
  },

});
