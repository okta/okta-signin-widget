import Form from './Form';
const NEW_PASSWORD_FIELD = 'newPassword';
const CONFIRM_PASSWORD_FIELD = 'confirmPassword';
export default Form.extend({
  passwordRequirementsHtmlList: function () {
    return this.el('password-requirements-html');
  },

  passwordRequirementsHtmlHeader: function () {
    return this.passwordRequirementsHtmlList().find('.password-requirements--header');
  },

  passwordRequirementsHtmlListItems: function () {
    return this.passwordRequirementsHtmlList().find('.password-requirements--list-item');
  },

  newPasswordField: function () {
    return this.input(NEW_PASSWORD_FIELD);
  },

  confirmPasswordField: function () {
    return this.input(CONFIRM_PASSWORD_FIELD);
  },

  setNewPassword: function (val) {
    const field = this.newPasswordField();

    field.val(val);
    field.trigger('change');
  },

  setConfirmPassword: function (val) {
    const field = this.confirmPasswordField();

    field.val(val);
    field.trigger('change');
  },

  newPassFieldError: function () {
    return this.error(NEW_PASSWORD_FIELD);
  },

  confirmPassFieldError: function () {
    return this.error(CONFIRM_PASSWORD_FIELD);
  },

  signoutLink: function () {
    return this.el('signout-link');
  },
});
