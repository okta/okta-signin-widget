import Form from './Form';
export default Form.extend({
  enrollEmailActivateContent: function() {
    return this.el('enroll-activate-email-content').trimmedText();
  },

  setVerificationCode: function(val) {
    const field = this.input('passCode');

    field.val(val);
    field.trigger('change');
  },

  getResendEmailView: function() {
    return this.$('.resend-email-infobox');
  },

  getResendEmailMessage: function() {
    return this.$('.resend-email-infobox:not(.hide) .infobox p');
  },

  getResendButton: function() {
    return this.$('.resend-email-infobox:not(.hide) a.resend-email-btn');
  },

  clickResend: function() {
    const resendLinkBtn = this.getResendButton();

    resendLinkBtn.click();
  },
});
