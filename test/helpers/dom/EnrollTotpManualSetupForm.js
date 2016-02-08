define(['./Form'], function (Form) {

  var SHARED_SECRET_FIELD = 'sharedSecret';
  var SCAN_BARCODE_LINK = 'goto-link';
  var MANUAL_SETUP_FORM = 'step-manual-setup';
  var DROPDOWN = 'activationType';
  var SMS_OPTION = 'SMS';
  var EMAIL_OPTION = 'EMAIL';
  var MANUAL_OPTION = 'MANUAL';
  var COUNTRY_CODE_SELECTOR = 'countryCode';
  var PHONE_INPUT = 'phoneNumber';
  var NEXT_BUTTON = 'next-button';

  return Form.extend({

    form: function () {
      return this.el(MANUAL_SETUP_FORM);
    },

    sharedSecretField: function () {
      return this.input(SHARED_SECRET_FIELD);
    },

    sharedSecretFieldValue: function () {
      return this.sharedSecretField().val();
    },

    countryCodeSelect: function () {
      return this.select(COUNTRY_CODE_SELECTOR);
    },

    phoneNumberField: function () {
      return this.input(PHONE_INPUT);
    },

    setPhoneNumber: function (val) {
      var field = this.phoneNumberField();
      field.val(val);
      field.trigger('change');
    },

    dropdownElement: function () {
      return this.select(DROPDOWN);
    },

    dropdownOptions: function () {
      this.selectOptions(DROPDOWN);
    },

    selectDropdownOption: function (val) {
      this.selectOption(DROPDOWN, val);
    },

    selectSmsOption: function () {
      this.selectDropdownOption(SMS_OPTION);
    },

    selectEmailOption: function () {
      this.selectDropdownOption(EMAIL_OPTION);
    },

    selectManualOption: function () {
      this.selectDropdownOption(MANUAL_OPTION);
    },

    nextButton: function () {
      return this.el(NEXT_BUTTON);
    },

    nextButtonClick: function () {
      return this.nextButton().click();
    },

    gotoScanBarcodeLink: function () {
      return this.el(SCAN_BARCODE_LINK);
    },

    gotoScanBarcode: function () {
      this.gotoScanBarcodeLink().click();
    },

    backLink: function () {
      return this.el('back-link');
    }

  });

});
