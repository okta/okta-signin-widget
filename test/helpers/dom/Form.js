define(['jquery', 'underscore', './Dom'], function ($, _, Dom) {

  return Dom.extend({

    titleText: function () {
      return this.el('o-form-head').trimmedText();
    },

    subtitleText: function () {
      return this.el('o-form-explain').trimmedText();
    },

    subtitle: function () {
      return this.el('o-form-explain');
    },

    inputWrap: function (field) {
      return this.el('o-form-input-' + field);
    },

    input: function (field) {
      return this.inputWrap(field).find('input');
    },

    inlineLabel: function (field) {
      return this.inputWrap(field).find('.o-form-label-inline');
    },

    select: function (field) {
      return this.inputWrap(field).find('select');
    },

    autocomplete: function (field) {
      return this.input(field).attr('autocomplete');
    },

    selectOptions: function (field) {
      return _.map(this.select(field).find('option'), function (el) {
        return {
          val: el.value,
          text: $.trim(el.innerHTML)
        };
      });
    },

    selectedOption: function (field) {
      return this.inputWrap(field).find('.chzn-single span').trimmedText();
    },

    selectOption: function (field, val) {
      var $select = this.select(field);
      $select.val(val);
      $select.trigger('liszt:updated');
      $select.trigger('change');
    },

    error: function (field) {
      var $error = this.inputWrap(field).next();
      if (!$error.is('.o-form-input-error')) {
        throw new Error('No error for field: ' + field);
      }
      return $error;
    },

    checkbox: function (field) {
      return this.inputWrap(field).find(':checkbox');
    },

    checkboxLabel: function (field) {
      return this.inputWrap(field).find('label');
    },

    checkboxLabelText: function (field) {
      return this.checkboxLabel(field).trimmedText();
    },

    labelText: function (field) {
      return this.inputWrap(field).closest('[data-se="o-form-fieldset"]').find('label').trimmedText();
    },

    tooltipText: function (field) {
      var api,
          element,
          formInput = this.inputWrap(field);

      if (formInput.length) {
        element = formInput.find('.input-tooltip')[0];
      } else {
        element = this.el(field);
      }

      api = $(element).qtip('api');
      return api ? api.show().tooltip.text() : undefined;
    },

    button: function (selector) {
      return this.$(selector + '.button');
    },

    submitButton: function () {
      return $('[data-type="save"]');
    },

    submitButtonText: function () {
      return this.submitButton().val();
    },

    submit: function () {
      this.submitButton().click();
    },

    hasErrors: function () {
      return this.el('o-form-error-container').children().length > 0;
    },

    errorBox: function () {
      return this.el('o-form-error-container').find('.infobox-error');
    },

    errorMessage: function () {
      return this.$('.okta-form-infobox-error p').text().trim();
    }

  });

});
