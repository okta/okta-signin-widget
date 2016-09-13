define(['./Form', 'helpers/util/Expect'], function (Form, Expect) {

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

    hasSharedSecret: function () {
      return this.sharedSecretFieldValue() !== '';
    },

    countryCodeSelect: function () {
      return this.inputWrap(COUNTRY_CODE_SELECTOR).find('.chzn-container');
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
      return this.inputWrap(DROPDOWN).find('.chzn-container');
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
    },

    waitForManual: function (resolveValue) {
      return Expect.wait(this.hasSharedSecret.bind(this), resolveValue);
    },

    waitForSms: function (resolveValue) {
      var condition = function () {
        var field = this.phoneNumberField();
        return !this.hasSharedSecret() && field.length === 1 && field.is(':visible');
      }.bind(this);
      return Expect.wait(condition, resolveValue);
    },

    waitForEmail: function (resolveValue) {
      var condition = function () {
        return !this.hasSharedSecret() && this.phoneNumberField().is(':not(:visible)');
      }.bind(this);
      return Expect.wait(condition, resolveValue);
    }

  });

});
