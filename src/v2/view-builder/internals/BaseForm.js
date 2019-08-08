import { Form, loc } from 'okta' ;
import FormInputFactory from './FormInputFactory';

export default Form.extend({

  layout: 'o-form-theme',
  className: 'ion-form',
  hasSavingState: true,
  autoSave: false,
  noCancelButton: true,
  title: '',
  save: loc('oform.next', 'login'),

  initialize: function () {
    const remediationValue = this.options.remediationValue;
    const inputOptions = remediationValue.uiSchema.map(FormInputFactory.create);

    inputOptions.forEach(input => {
      this.addInputOrView(input);
    });

    this.listenTo(this, 'save', (model) => {
      this.options.appState.trigger('saveForm', model);
    });
  },

  addInputOrView (input) {
    if (input.component) {
      this.add(input.component, {
        options: input.options
      });
    } else {
      this.addInput(input);
    }
  }

});
