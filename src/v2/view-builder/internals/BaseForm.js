import { Form, loc } from 'okta' ;
import FormInputFactory from './FormInputFactory';

export default Form.extend({

  layout: 'o-form-theme',
  className: 'ion-form',
  hasSavingState: true,
  autoSave: false,
  noCancelButton: true,
  title: 'Authenticate',
  save: loc('oform.next', 'login'),

  initialize: function () {
    const uiSchemas = this.getUISchema();
    const inputOptions = uiSchemas.map(FormInputFactory.create);

    inputOptions.forEach(input => {
      this.addInputOrView(input);
    });

    this.listenTo(this, 'save', this.saveForm);
  },

  saveForm (model) {
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
    if (input.View) {
      this.add(input.View, {
        options: input.options
      });
    } else {
      this.addInput(input);
    }
  },

});
