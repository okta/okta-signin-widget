import Expect from 'helpers/util/Expect';
import Form from './Form';
const SHARED_SECRET_INFO = 'secret-key-instructions';
const SCAN_BARCODE_LINK = 'goto-link';
const MANUAL_SETUP_FORM = 'step-manual-setup';
const DROPDOWN = 'activationType';
const SMS_OPTION = 'SMS';
const EMAIL_OPTION = 'EMAIL';
const MANUAL_OPTION = 'MANUAL';
const COUNTRY_CODE_SELECTOR = 'countryCode';
const PHONE_INPUT = 'phoneNumber';
const NEXT_BUTTON = 'next-button';
export default Form.extend({
  form: function() {
    return this.el(MANUAL_SETUP_FORM);
  },

  sharedSecretInfo: function() {
    return this.el(SHARED_SECRET_INFO);
  },

  sharedSecretInfoText: function() {
    return this.sharedSecretInfo().find('.shared-key').trimmedText();
  },

  hasSharedSecret: function() {
    return this.sharedSecretInfoText() !== '';
  },

  countryCodeSelect: function() {
    return this.inputWrap(COUNTRY_CODE_SELECTOR).find('.chzn-container');
  },

  waitForCountryCodeSelect: function(resolveValue) {
    return Expect.wait(
      function() {
        return this.countryCodeSelect().length > 0;
      }.bind(this),
      resolveValue
    );
  },

  phoneNumberField: function() {
    return this.input(PHONE_INPUT);
  },

  setPhoneNumber: function(val) {
    const field = this.phoneNumberField();

    field.val(val);
    field.trigger('change');
  },

  dropdownElement: function() {
    return this.inputWrap(DROPDOWN).find('.chzn-container');
  },

  waitForDropdownElement: function(resolveValue) {
    return Expect.wait(
      function() {
        return this.dropdownElement().length > 0;
      }.bind(this),
      resolveValue
    );
  },

  dropdownOptions: function() {
    this.selectOptions(DROPDOWN);
  },

  selectDropdownOption: function(val) {
    this.selectOption(DROPDOWN, val);
  },

  selectSmsOption: function() {
    this.selectDropdownOption(SMS_OPTION);
  },

  selectEmailOption: function() {
    this.selectDropdownOption(EMAIL_OPTION);
  },

  selectManualOption: function() {
    this.selectDropdownOption(MANUAL_OPTION);
  },

  nextButton: function() {
    return this.el(NEXT_BUTTON);
  },

  nextButtonClick: function() {
    return this.nextButton().click();
  },

  gotoScanBarcodeLink: function() {
    return this.el(SCAN_BARCODE_LINK);
  },

  gotoScanBarcode: function() {
    this.gotoScanBarcodeLink().click();
  },

  backLink: function() {
    return this.el('back-link');
  },

  waitForManual: function(resolveValue) {
    return Expect.wait(this.hasSharedSecret.bind(this), resolveValue);
  },

  waitForSms: function(resolveValue) {
    const condition = function() {
      const field = this.phoneNumberField();

      return !this.hasSharedSecret() && field.length === 1 && Form.isVisible(field);
    }.bind(this);

    return Expect.wait(condition, resolveValue);
  },

  waitForEmail: function(resolveValue) {
    const condition = function() {
      return !this.hasSharedSecret() && this.phoneNumberField().is(':not(:visible)');
    }.bind(this);

    return Expect.wait(condition, resolveValue);
  },
});
