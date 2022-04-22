import BaseView from '../../BaseView.js';
import FormUtil from '../helpers/FormUtil.js';

var ReadModeBar = BaseView.extend({
  el: '<span class="o-form-toggle" data-type="header-btn"></span>',
  formTitle: '',
  modelEvents: {
    'change:__edit__': 'toggle'
  },
  initialize: function () {
    this.addButton();
  },
  addButton: function () {
    if (this.model.get('__edit__')) {
      this.add(FormUtil.createReadFormButton({
        type: 'cancel'
      }));
    } else {
      this.add(FormUtil.createReadFormButton({
        type: 'edit',
        formTitle: this.formTitle,
        className: 'disable-in-read-only'
      }));
    }
  },
  toggle: function () {
    this.removeChildren();
    this.addButton();
  }
});

export { ReadModeBar as default };
