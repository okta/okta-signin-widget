define(['./Form'], function (Form) {

  var PHONE_FIELD = 'phoneNumber';
  var CODE_FIELD = 'passCode';
  var COUNTRIES_FIELD = 'countryCode';

  return Form.extend({

    countriesList: function () {
      return this.selectOptions(COUNTRIES_FIELD);
    },

    selectedCountry: function () {
      return this.selectedOption(COUNTRIES_FIELD);
    },

    selectCountry: function (countryCode) {
      return this.selectOption(COUNTRIES_FIELD, countryCode);
    },

    hasCountriesList: function () {
      return this.inputWrap(COUNTRIES_FIELD).find('.chzn-container').length > 0;
    },

    phoneNumberField: function () {
      return this.input(PHONE_FIELD);
    },

    phonePrefixText: function () {
      return this.inlineLabel(PHONE_FIELD).trimmedText();
    },

    sendCodeButton: function () {
      return this.el('sms-request-button').filter(':visible');
    },

    divider: function () {
      return this.$('.form-divider');
    },

    codeField: function () {
      return this.input(CODE_FIELD);
    },

    getCodeFieldAutocomplete: function () {
      return this.autocomplete(CODE_FIELD);
    },

    backLink: function () {
      return this.el('back-link');
    },

    setPhoneNumber: function (val) {
      var field = this.phoneNumberField();
      field.val(val);
      field.trigger('change');
    },

    setCode: function (val) {
      var field = this.codeField();
      field.val(val);
      field.trigger('change');
    }

  });

});
