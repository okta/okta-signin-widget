define(['./Form'], function (Form) {

  var SMS_LINK_SENT_VIEW = 'sent-sms-activation-link';
  var EMAIL_LINK_SENT_VIEW = 'sent-email-activation-link';

  return Form.extend({

    smsSentMsg: function () {
      return this.el(SMS_LINK_SENT_VIEW);
    },

    emailSentMsg: function () {
      return this.el(EMAIL_LINK_SENT_VIEW);
    },

    getMsgText: function () {
      return this.$('p').text();
    },

    backLink: function () {
      return this.el('back-link');
    }

  });

});
