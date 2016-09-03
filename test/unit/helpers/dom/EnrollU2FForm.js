define(['./Form'], function (Form) {

  return Form.extend({

    enrollInstructions: function () {
      return this.$('.u2f-instructions ol');
    },

    enrollWaitingText: function () {
      return this.$('.u2f-enroll-text');
    },

    enrollDeviceImages: function () {
      return this.el('u2f-devices');
    },

    enrollSpinningIcon: function () {
      return this.el('u2f-waiting');
    },

    backLink: function () {
      return this.el('back-link');
    }
  });

});
