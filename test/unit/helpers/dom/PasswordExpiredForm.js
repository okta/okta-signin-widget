define(['./Form'], function (Form) {

  var OLD_PASS_FIELD = 'oldPassword';
  var NEW_PASS_FIELD = 'newPassword';
  var CONFIRM_PASS_FIELD = 'confirmPassword';

  return Form.extend({
    passwordRequirementsHtmlList: function () {
      return this.el('password-requirements-html');
    },

    passwordRequirementsHtmlHeader: function () {
      return this.passwordRequirementsHtmlList().find('.password-requirements--header');
    },

    passwordRequirementsHtmlListItems: function () {
      return this.passwordRequirementsHtmlList().find('.password-requirements--list-item');
    },

    oldPassField: function () {
      return this.input(OLD_PASS_FIELD);
    },

    oldPassFieldError: function () {
      return this.error(OLD_PASS_FIELD);
    },

    setOldPass: function (val) {
      var field = this.oldPassField();
      field.val(val);
      field.trigger('change');
    },

    newPassField: function () {
      return this.input(NEW_PASS_FIELD);
    },

    newPassFieldError: function () {
      return this.error(NEW_PASS_FIELD);
    },

    setNewPass: function (val) {
      var field = this.newPassField();
      field.val(val);
      field.trigger('change');
    },

    confirmPassField: function () {
      return this.input(CONFIRM_PASS_FIELD);
    },

    confirmPassFieldError: function () {
      return this.error(CONFIRM_PASS_FIELD);
    },

    setConfirmPass: function (val) {
      var field = this.confirmPassField();
      field.val(val);
      field.trigger('change');
    },

    skipLink: function () {
      return this.el('skip-link');
    },

    skip: function () {
      return this.skipLink().click();
    },

    signoutLink: function () {
      return this.el('signout-link');
    },

    signout: function () {
      return this.signoutLink().click();
    },

    customButton: function () {
      return this.el('custom-button');
    },

    customButtonText: function () {
      return this.el('custom-button').trimmedText();
    },

    clickCustomButton: function () {
      this.el('custom-button').click();
    }

  });

});
