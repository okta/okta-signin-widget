import { View } from 'okta';
import BaseForm from './BaseForm';
import BaseModel from './BaseModel';

export default View.extend({

  Header: '',

  Body: BaseForm,

  Footer: '',

  className: 'siw-main-view',

  template: '<div class="siw-main-header"></div>' +
      '<div class="siw-main-body"></div>' +
      '<div class="siw-main-footer"></div>',

  initialize () {
    // Create Model
    const IonModel = this.createModelClass();
    const model = new IonModel ({
      formName: this.options.currentViewState.name,
    });

    // Add Views
    this.add(this.Header, { selector : '.siw-main-header' });
    this.add(this.Body, {
      selector : '.siw-main-body',
      options: {
        model,
      },
    });
    this.add(this.Footer, { selector : '.siw-main-footer' });
  },

  createModelClass () {
    return BaseModel.create(this.options.currentViewState);
  }

});
