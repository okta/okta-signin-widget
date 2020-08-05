import { Form, loc } from 'okta';
import FormInputFactory from './FormInputFactory';

export default Form.extend({

  layout: 'o-form-theme',
  className: 'ion-form',
  hasSavingState: true,
  autoSave: false,
  noCancelButton: true,

  title () {
    return loc('oform.title.authenticate', 'login');
  },

  save: loc('oform.next', 'login'),

  modelEvents: {
    'clearFormError': 'handleClearFormError',
    'error': 'triggerAfterError',
  },

  initialize () {
    const uiSchemas = this.getUISchema();
    const inputOptions = uiSchemas.map(FormInputFactory.create);

    //should be used before adding any other input components
    this.showMessages();

    inputOptions.forEach(input => {
      this.addInputOrView(input);
    });

    this.listenTo(this, 'save', this.saveForm);
  },

  handleClearFormError () {
    if (this.$('.o-form-error-container').hasClass('o-form-has-errors')) {
      this.clearErrors();
    }
  },

  triggerAfterError (model, error) {
    this.options.appState.trigger('afterError', error);
  },

  saveForm (model) {
    //remove any existing warnings or messages before saving form
    this.$el.find('.o-form-error-container').empty();
    this.options.appState.trigger('saveForm', model);
  },

  getUISchema () {
    if (Array.isArray(this.options.currentViewState.uiSchema)) {
      return this.options.currentViewState.uiSchema;
    } else {
      return [];
    }
  },

  addInputOrView (input) {
    if (input.visible === false || input.mutable === false) {
      return;
    }
    if (input.View) {
      this.add(input.View, {
        options: input.options
      });
    } else {
      this.addInput(input);
    }

    if (Array.isArray(input.optionsUiSchemas)) {
      if (this.options.optionUiSchemaConfig[input.name]) {
        const optionUiSchemaIndex = Number(this.options.optionUiSchemaConfig[input.name]);
        const optionUiSchemas = input.optionsUiSchemas[optionUiSchemaIndex] || [];
        optionUiSchemas.forEach(this.addInputOrView.bind(this));
      }
    }
  },

  showMessages () {
    // render messages as text
    const messagesObjs = this.options.appState.get('messages');
    if (messagesObjs?.value.length) {
      const content = messagesObjs.value.map((messagesObj) => {
        return messagesObj.message;
      });
      this.add(`<div class="ion-messages-container">${content.join(' ')}</div>`, '.o-form-error-container');
    }
  },
});
