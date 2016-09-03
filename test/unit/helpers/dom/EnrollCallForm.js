define(['./EnrollSmsForm'], function (SmsForm) {

  var PHONE_EXTENSION_FIELD = 'phoneExtension';

  return SmsForm.extend({

    //Override
    sendCodeButton: function () {
      return this.el('call-request-button').filter(':visible');
    },

    phoneExtensionField: function () {
      return this.input(PHONE_EXTENSION_FIELD);
    },

    setPhoneExtension: function (val) {
      var field = this.phoneExtensionField();
      field.val(val);
      field.trigger('change');
    }

  });

});
