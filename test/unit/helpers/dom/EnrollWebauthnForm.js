define(['./Form'], function (Form) {

  return Form.extend({

    enrollInstructions: function () {
      return this.$('.webauthn-enroll-instructions p');
    },

    enrollEdgeInstructions: function () {
      return this.$('.webauthn-edge-text p');
    },

    enrollSpinningIcon: function () {
      return this.el('webauthn-waiting');
    },

    backLink: function () {
      return this.el('back-link');
    },

    errorHtml: function () {
      return this.el('o-form-error-html').find('strong');
    }
  });

});
