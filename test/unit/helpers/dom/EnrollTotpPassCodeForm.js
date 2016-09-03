define(['./Form'], function (Form) {

  var CODE_FIELD = 'passCode';
  var PASSCODE_FORM = 'step-sendcode';

  return Form.extend({

    form: function () {
      return this.el(PASSCODE_FORM);
    },

    codeField: function () {
      return this.input(CODE_FIELD);
    },

    setCode: function (val) {
      var field = this.codeField();
      field.val(val);
      field.trigger('change');
    },

    backLink: function () {
      return this.el('back-link');
    }

  });

});
