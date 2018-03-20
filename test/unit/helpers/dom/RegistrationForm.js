define(['./Form'], function (Form) {

  var FIRSTNAME_FIELD = 'firstName';
  var LASTNAME_FIELD = 'lastName';
  var EMAIL_FIELD = 'userName';
  var PASSWORD_FIELD = 'password';
  var REFRRER_FIELD = 'referrer';

  return Form.extend({

    firstnameField: function () {
      return this.input(FIRSTNAME_FIELD);
    },

    firstnameErrorField: function () {
      return this.error(FIRSTNAME_FIELD);
    },

    setFirstname: function (val) {
      var field = this.firstnameField();
      field.val(val);
      field.trigger('change');
    },

    lastnameField: function () {
      return this.input(LASTNAME_FIELD);
    },
    
    lastnameErrorField: function () {
      return this.error(LASTNAME_FIELD);
    },

    setLastname: function (val) {
      var field = this.lastnameField();
      field.val(val);
      field.trigger('change');
    },

    referrerField: function () {
      return this.input(REFRRER_FIELD);
    },

    referrerErrorField: function () {
      return this.error(REFRRER_FIELD);
    },

    setReferrer: function (val) {
      var field = this.referrerField();
      field.val(val);
      field.trigger('change');
    },

    emailField: function () {
      return this.input(EMAIL_FIELD);
    },

    emailErrorField: function () {
      return this.error(EMAIL_FIELD);
    },

    setEmail: function (val) {
      var field = this.emailField();
      field.val(val);
      field.trigger('change');
    },

    passwordField: function () {
      return this.input(PASSWORD_FIELD);
    },

    passwordErrorField: function () {
      return this.error(PASSWORD_FIELD);
    },

    requiredFieldLabel: function () {
      return this.$('.required-fields-label').text();
    },

    fieldPlaceholder: function(fieldName) {
      return this.$('.okta-form-input-field input[name="'+fieldName+'"]').attr('placeholder');
    },

    getFieldByName: function(fieldName) {
      return this.$('.okta-form-input-field input[name="'+fieldName+'"]');
    },

    setPassword: function (val) {
      var field = this.passwordField();
      field.val(val);
      field.trigger('change');
      field.trigger('input');
    },

    focusOutPassword: function () {
      var field = this.passwordField();
      field.trigger('focusout');
    },

    hasPasswordComplexityUnsatisfied: function (index) {
      return this.$('.subschema-' + index).hasClass('subschema-unsatisfied') &&
             !this.$('.subschema-' + index).hasClass('subschema-satisfied') &&
             this.$('.subschema-' + index).hasClass('subschema-error');
    },

    hasPasswordComplexitySatisfied: function (index) {
      return this.$('.subschema-' + index).hasClass('subschema-satisfied') &&
             !this.$('.subschema-' + index).hasClass('subschema-unsatisfied') &&
             !this.$('.subschema-' + index).hasClass('subschema-error');
    },

    isPasswordComplexitySectionHidden: function (index) {
      return this.$('.subschema-'+index+'>p').hasClass('default-schema');
    },

    passwordContainsUsernameError: function () {
      return this.$('.subschema-4').hasClass('subschema-error');
    }

  });

});
