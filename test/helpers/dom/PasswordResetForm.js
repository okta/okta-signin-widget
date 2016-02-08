define(['./Form'], function (Form) {

  var NEW_PASSWORD_FIELD = 'newPassword';
  var CONFIRM_PASSWORD_FIELD = 'confirmPassword';

  return Form.extend({

    newPasswordField: function () {
      return this.input(NEW_PASSWORD_FIELD);
    },

    confirmPasswordField: function () {
      return this.input(CONFIRM_PASSWORD_FIELD);
    },

    setNewPassword: function (val) {
      var field = this.newPasswordField();
      field.val(val);
      field.trigger('change');
    },

    setConfirmPassword: function (val) {
      var field = this.confirmPasswordField();
      field.val(val);
      field.trigger('change');
    },

    newPassFieldError: function () {
      return this.error(NEW_PASSWORD_FIELD);
    },

    confirmPassFieldError: function () {
      return this.error(CONFIRM_PASSWORD_FIELD);
    },

    passwordJammer: function () {
      return this.$('.password-jammer');
    },

    signoutLink: function () {
      return this.el('signout-link');
    }

  });

});
