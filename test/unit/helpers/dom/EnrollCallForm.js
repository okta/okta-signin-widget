import $ from 'jquery';
import SmsForm from './EnrollSmsForm';
import Dom from '../dom/Dom';

const PHONE_EXTENSION_FIELD = 'phoneExtension';
export default SmsForm.extend({
  //Override
  sendCodeButton: function() {
    return this.el('call-request-button').filter((_, el) => Dom.isVisible($(el))).eq(0);
  },

  phoneExtensionField: function() {
    return this.input(PHONE_EXTENSION_FIELD);
  },

  setPhoneExtension: function(val) {
    const field = this.phoneExtensionField();

    field.val(val);
    field.trigger('change');
  },
});
