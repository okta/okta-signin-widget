define(['okta', './Dom'], function (Okta, Dom) {

  var { _, $ } = Okta;
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

    explain: function (field) {
      var $container = this.inputWrap(field).parent();
      var $explain = $container.find('.o-form-explain');
      return $explain;
    },

    error: function (field) {
      // container holds input and error description
      var $container = this.inputWrap(field).parent();
      var errorId = $container.attr('aria-describedby');
      if (!errorId) {
        throw new Error('Expected "aria-describedby" attribute for the error container on field: ' + field);
      }
      var $error = $container.find('.o-form-input-error');
      if ($error.length !== 1) {
        throw new Error('"o-form-input-error": Expected 1, got ' + $error.length + ' for field: ' + field);
      }    

      if ($error.attr('id') !== errorId) {
        throw new Error('"o-form-input-error" element should have an ID matching the "aria-describedby" attribute of the container. For field: ' + field);
      }

      // Validate accessibility on error
      if (!$error.attr('role')) {
        throw new Error('No "role" attribute for error on field: ' + field);
      }
      if ($error.attr('role') !== 'alert') {
        throw new Error(`"role" should be "alert" (not  "${$error.attr('role')}" for error on field: ${field}`);
      }

      var $icon = $error.children().first();
      if (!$icon.is('.icon')) {
        throw new Error(`First child of error element for field "${field}" should be an icon.`);
      }

      // Validate accessibility on icon
      if (!$icon.attr('role')) {
        throw new Error('No "role" attribute for error icon on field: ' + field);
      }
  
      if ($icon.attr('role') !== 'img') {
        throw new Error(`"role" should be "img" (not  "${$icon.attr('role')}" for error icon on field: ${field}`);
      }

      if (!$icon.attr('aria-label')) {
        throw new Error('No "aria-label" attribute for error icon on field: ' + field);
      }

      // Check for missing i18n value 
      if ($icon.attr('aria-label').indexOf('L10N') >= 0) {
        throw new Error(`Missing i18n property for error icon on field: ${field}: "${$icon.attr('aria-label')}"`);
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

    tooltipApi: function (field) {
      var element,
          formInput = this.inputWrap(field);

      if (formInput.length) {
        element = formInput.find('.input-tooltip')[0];
      } else {
        element = this.el(field);
      }

      return $(element).qtip('api');
    },

    tooltipText: function (field) {
      var api,
          tooltipText;

      api = this.tooltipApi(field);
      tooltipText = api ? api.show().tooltip.text() : undefined;

      // Remove the tooltip from the DOM to
      // prevent elements from lingering around.
      api.tooltip.remove();

      return tooltipText;
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
      return this.$('.okta-form-infobox-error').length > 0;
    },

    errorBox: function () {
      return this.el('o-form-error-container').find('.infobox-error');
    },

    errorMessage: function () {
      return this.$('.okta-form-infobox-error p').text().trim();
    },

    hasFieldErrors: function (field) {
      return this.inputWrap(field).next('.okta-form-input-error').length > 0;
    },

    fieldErrorMessage: function (field) {
      return this.inputWrap(field).next('.okta-form-input-error').text().trim();
    },

    accessibilityText: function () {
      return this.$('.accessibility-text').text().trim();
    },

    warningMessage: function () {
      return this.$('.okta-form-infobox-warning p').text().trim();
    },

    hasWarningMessage: function () {
      return this.$('.okta-form-infobox-warning').length > 0;
    }

  });

});
