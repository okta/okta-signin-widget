import Form from './Form';
const FIRSTNAME_FIELD = 'firstName';
const LASTNAME_FIELD = 'lastName';
const USERNAME_FIELD = 'userName';
const EMAIL_FIELD = 'email';
const PASSWORD_FIELD = 'password';
const REFERRER_FIELD = 'referrer';
export default Form.extend({
  firstnameField: function() {
    return this.input(FIRSTNAME_FIELD);
  },

  firstnameErrorField: function() {
    return this.error(FIRSTNAME_FIELD);
  },

  setFirstname: function(val) {
    const field = this.firstnameField();

    field.val(val);
    field.trigger('change');
  },

  lastnameField: function() {
    return this.input(LASTNAME_FIELD);
  },

  lastnameErrorField: function() {
    return this.error(LASTNAME_FIELD);
  },

  setLastname: function(val) {
    const field = this.lastnameField();

    field.val(val);
    field.trigger('change');
  },

  referrerField: function() {
    return this.input(REFERRER_FIELD);
  },

  referrerErrorField: function() {
    return this.error(REFERRER_FIELD);
  },

  setReferrer: function(val) {
    const field = this.referrerField();

    field.val(val);
    field.trigger('change');
  },

  userNameField: function() {
    return this.input(USERNAME_FIELD);
  },

  userNameErrorField: function() {
    return this.error(USERNAME_FIELD);
  },

  emailField: function() {
    return this.input(EMAIL_FIELD);
  },

  emailErrorField: function() {
    return this.error(EMAIL_FIELD);
  },

  setUserName: function(val) {
    const field = this.userNameField();

    field.val(val);
    field.trigger('change');
  },

  setEmail: function(val) {
    const field = this.emailField();

    field.val(val);
    field.trigger('change');
  },

  passwordField: function() {
    return this.input(PASSWORD_FIELD);
  },

  passwordErrorField: function() {
    return this.error(PASSWORD_FIELD);
  },

  requiredFieldLabel: function() {
    return this.$('.required-fields-label').text();
  },

  fieldPlaceholder: function(fieldName) {
    return this.$('.okta-form-input-field input[name="' + fieldName + '"]').attr('placeholder');
  },

  getFieldByName: function(fieldName) {
    return this.$('.okta-form-input-field input[name="' + fieldName + '"]');
  },

  setPassword: function(val) {
    const field = this.passwordField();

    field.val(val);
    field.trigger('change');
    field.trigger('input');
  },

  focusOutPassword: function() {
    const field = this.passwordField();

    field.trigger('focusout');
  },

  hasPasswordComplexityUnsatisfied: function(index) {
    return (
      this.$('.subschema-' + index).hasClass('subschema-unsatisfied') &&
      !this.$('.subschema-' + index).hasClass('subschema-satisfied') &&
      this.$('.subschema-' + index).hasClass('subschema-error')
    );
  },

  hasPasswordComplexitySatisfied: function(index) {
    return (
      this.$('.subschema-' + index).hasClass('subschema-satisfied') &&
      !this.$('.subschema-' + index).hasClass('subschema-unsatisfied') &&
      !this.$('.subschema-' + index).hasClass('subschema-error')
    );
  },

  isPasswordComplexitySectionHidden: function(index) {
    return this.$('.subschema-' + index + '>p').hasClass('default-schema');
  },

  passwordContainsUsernameError: function() {
    return this.$('.subschema-4').hasClass('subschema-error');
  },
});
