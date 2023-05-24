import SmsForm from './EnrollSmsForm';
import Dom from './Dom';
const PHONE_EXTENSION_FIELD = 'phoneExtension';
export default SmsForm.extend({
  //Override
  sendCodeButton: function() {
    const callRequestButtons = this.el('call-request-button');
    for (let i = 0; i < callRequestButtons.length; i++) {
      if (Dom.isVisible(this.$(callRequestButtons[i]))) {
        return callRequestButtons[i];
      }
    }
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
