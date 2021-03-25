import Form from './Form';
const SMS_LINK_SENT_VIEW = 'sent-sms-activation-link';
const EMAIL_LINK_SENT_VIEW = 'sent-email-activation-link';
export default Form.extend({
  smsSentMsg: function() {
    return this.el(SMS_LINK_SENT_VIEW);
  },

  emailSentMsg: function() {
    return this.el(EMAIL_LINK_SENT_VIEW);
  },

  getMsgText: function() {
    return this.$('p').text();
  },

  backLink: function() {
    return this.el('back-link');
  },
});
