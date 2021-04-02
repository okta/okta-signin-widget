import { _, $ } from 'okta';
import Dom from './Dom';
export default Dom.extend({
  titleText: function() {
    return this.el('o-form-head').trimmedText();
  },

  subtitleText: function() {
    return this.el('o-form-explain').trimmedText();
  },

  subtitle: function() {
    return this.el('o-form-explain');
  },

  inputWrap: function(field) {
    return this.el('o-form-input-' + field);
  },

  input: function(field) {
    return this.inputWrap(field).find('input');
  },

  inlineLabel: function(field) {
    return this.inputWrap(field).find('.o-form-label-inline');
  },

  select: function(field) {
    return this.inputWrap(field).find('select');
  },

  autocomplete: function(field) {
    return this.input(field).attr('autocomplete');
  },

  selectOptions: function(field) {
    return _.map(this.select(field).find('option'), function(el) {
      return {
        val: el.value,
        text: $.trim(el.innerHTML),
      };
    });
  },

  selectedOption: function(field) {
    return this.inputWrap(field).find('.chzn-single span').trimmedText();
  },

  selectOption: function(field, val) {
    const $select = this.select(field);

    $select.val(val);
    $select.trigger('liszt:updated');
    $select.trigger('change');
  },

  explain: function(field) {
    const $container = this.inputWrap(field).parent();
    const $explain = $container.find('.o-form-explain');

    return $explain;
  },

  error: function(field) {
    // container holds input and error description
    const $container = this.inputWrap(field).parent();
    
    // input field holds reference to error description
    const errorId = $container.find(`[name=${field}]`).attr('aria-describedby');

    if (!errorId) {
      throw new Error('Expected "aria-describedby" attribute for the error container on field: ' + field);
    }
    const $error = $container.find('.o-form-input-error');

    if ($error.length !== 1) {
      throw new Error('"o-form-input-error": Expected 1, got ' + $error.length + ' for field: ' + field);
    }

    if ($error.attr('id') !== errorId) {
      throw new Error(
        '"o-form-input-error" element should have an ID matching the "aria-describedby" attribute of the container. For field: ' +
          field
      );
    }

    // Validate accessibility on error
    if (!$error.attr('role')) {
      throw new Error('No "role" attribute for error on field: ' + field);
    }
    if ($error.attr('role') !== 'alert') {
      throw new Error(`"role" should be "alert" (not  "${$error.attr('role')}" for error on field: ${field}`);
    }

    const $icon = $error.children().first();

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

  checkbox: function(field) {
    return this.inputWrap(field).find(':checkbox');
  },

  checkboxLabel: function(field) {
    return this.inputWrap(field).find('label');
  },

  checkboxLabelText: function(field) {
    return this.checkboxLabel(field).trimmedText();
  },

  labelText: function(field) {
    return this.inputWrap(field).closest('[data-se="o-form-fieldset"]').find('label').trimmedText();
  },

  tooltipApi: function(field) {
    let element;
    const formInput = this.inputWrap(field);

    if (formInput.length) {
      element = formInput.find('.input-tooltip')[0];
    } else {
      element = this.el(field);
    }

    return $(element).qtip('api');
  },

  tooltipText: function(field) {
    let api;
    let tooltipText;

    api = this.tooltipApi(field);
    tooltipText = api ? api.show().tooltip.text() : undefined;

    // Remove the tooltip from the DOM to
    // prevent elements from lingering around.
    api.tooltip.remove();

    return tooltipText;
  },

  button: function(selector) {
    return this.$(selector + '.button');
  },

  submitButton: function() {
    return $('[data-type="save"]');
  },

  submitButtonText: function() {
    return this.submitButton().val();
  },

  submit: function() {
    this.submitButton().click();
  },

  getErrors: function() {
    return this.$('.okta-form-infobox-error');
  },

  hasErrors: function() {
    return this.getErrors().length > 0;
  },

  errorBox: function() {
    return this.el('o-form-error-container').find('.infobox-error');
  },

  errorMessage: function() {
    return this.$('.okta-form-infobox-error p').text().trim();
  },

  hasFieldErrors: function(field) {
    return this.inputWrap(field).next('.okta-form-input-error').length > 0;
  },

  fieldErrorMessage: function(field) {
    return this.inputWrap(field).next('.okta-form-input-error').text().trim();
  },

  accessibilityText: function() {
    return this.$('.accessibility-text').text().trim();
  },

  warningMessage: function() {
    return this.$('.okta-form-infobox-warning p').text().trim();
  },

  hasWarningMessage: function() {
    return this.$('.okta-form-infobox-warning').length > 0;
  },
});
