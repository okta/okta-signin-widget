import { View } from 'okta';
import BaseForm from './BaseForm';
import BaseModel from './BaseModel';
import HeaderView from './HeaderView';

export default View.extend({

  Header: HeaderView,

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
      formName: this.options.remediationValue.name,
    });

    // Add Views
    this.add(this.Header, { selector: '.siw-main-header' });
    this.add(this.Body, {
      selector : '.siw-main-body',
      options: {
        model,
      },
    });
    this.add(this.Footer, { selector : '.siw-main-footer' });
  },

  createModelClass () {
    return BaseModel.create(this.options.remediationValue);
  }

});
