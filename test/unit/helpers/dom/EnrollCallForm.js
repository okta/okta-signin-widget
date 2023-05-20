import SmsForm from './EnrollSmsForm';
const PHONE_EXTENSION_FIELD = 'phoneExtension';
export default SmsForm.extend({
  //Override
  sendCodeButton: function () {
    //return this.el('call-request-button').filter(':visible');

    const callRequestButtons = this.el('call-request-button');
    for (let i = 0; i < callRequestButtons.length; i++) {
      if (callRequestButtons[i].style._length === 0) {
        return callRequestButtons[i];
      }
    }
  },

  phoneExtensionField: function () {
    return this.input(PHONE_EXTENSION_FIELD);
  },

  setPhoneExtension: function (val) {
    const field = this.phoneExtensionField();

    field.val(val);
    field.trigger('change');
  },
});
