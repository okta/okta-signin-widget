define(['./Form'], function (Form) {

  var FIRSTNAME_FIELD = 'firstname';
  var LASTNAME_FIELD = 'lastname';
  var EMAIL_FIELD = 'email';
  var PASSWORD_FIELD = 'password';

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

    emailField: function () {
      return this.input(EMAIL_FIELD);
    },

    emailErrorField: function () {
      return this.error(EMAIL_FIELD);
    },

    passwordField: function () {
      return this.input(PASSWORD_FIELD);
    },

    passwordErrorField: function () {
      return this.error(PASSWORD_FIELD);
    }
  });

});
