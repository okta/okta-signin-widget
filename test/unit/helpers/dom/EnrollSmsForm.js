import Form from './Form';
import Dom from './Dom';
const PHONE_FIELD = 'phoneNumber';
const CODE_FIELD = 'passCode';
const COUNTRIES_FIELD = 'countryCode';
export default Form.extend({
  countriesList: function() {
    return this.selectOptions(COUNTRIES_FIELD);
  },

  selectedCountry: function() {
    return this.selectedOption(COUNTRIES_FIELD);
  },

  selectCountry: function(countryCode) {
    return this.selectOption(COUNTRIES_FIELD, countryCode);
  },

  hasCountriesList: function() {
    return this.inputWrap(COUNTRIES_FIELD).find('select > option').length > 0;
  },

  countryDropdown: function() {
    return this.inputWrap(COUNTRIES_FIELD).find('select');
  },

  phoneNumberField: function() {
    return this.input(PHONE_FIELD);
  },

  getPhoneNumberAutocomplete: function() {
    return this.autocomplete(PHONE_FIELD);
  },

  phonePrefixText: function() {
    return this.inlineLabel(PHONE_FIELD).trimmedText();
  },

  sendCodeButton: function() {
    const smsButtons = this.el('sms-request-button');
    for (let i = 0; i < smsButtons.length; i++) {
      if (Dom.isVisible(this.$(smsButtons[i]))) {
        return smsButtons[i];
      }
    }
  },

  divider: function() {
    return this.$('.form-divider');
  },

  codeField: function() {
    return this.input(CODE_FIELD);
  },

  getCodeFieldAutocomplete: function() {
    return this.autocomplete(CODE_FIELD);
  },

  backLink: function() {
    return this.el('back-link');
  },

  setPhoneNumber: function(val) {
    const field = this.phoneNumberField();

    field.val(val);
    field.trigger('change');
  },

  setCode: function(val) {
    const field = this.codeField();

    field.val(val);
    field.trigger('change');
  },

  hasBoldTextInWarningMessage: function() {
    return this.$('.okta-form-infobox-warning b').length > 0;
  },

  getBoldTextInWarningMessage: function() {
    return this.$('.okta-form-infobox-warning b').text().trim();
  },
});
