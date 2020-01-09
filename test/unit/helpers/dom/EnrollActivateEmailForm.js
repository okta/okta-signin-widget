define(['./Form'], function (Form) {

  return Form.extend({

    enrollEmailActivateContent: function () {
      return this.el('enroll-activate-email-content').trimmedText();
    },

    setVerificationCode: function (val) {
      var field = this.input('passCode');
      field.val(val);
      field.trigger('change');
    },

    clickResend: function () {
      var resendLinkBtn = this.$('a.email-activate-send-again-btn');
      resendLinkBtn.click();
    },

  });
});
