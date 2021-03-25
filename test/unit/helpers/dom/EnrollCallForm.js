import SmsForm from './EnrollSmsForm';
const PHONE_EXTENSION_FIELD = 'phoneExtension';
export default SmsForm.extend({
  //Override
  sendCodeButton: function() {
    return this.el('call-request-button').filter(':visible');
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
