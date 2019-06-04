define(['./Form'], function (Form) {

  var USERNAME_FIELD = 'username';
  var USERNAME_LABEL = 'label[for="account-recovery-username"]';
  var SMS_BUTTON_SELECTOR = '.sms-button';
  var SMS_HINT_SELECTOR = '.sms-hint';
  var CALL_BUTTON_SELECTOR = '.call-button';
  var MOBILE_RECOVERY_HINT_SELECTOR = '.mobile-recovery-hint';
  var CANT_ACCESS_EMAIL_SELECTOR = '.js-contact-support';
  var EMAIL_SENT_BACK_BTN = 'back-button';
  var SEND_EMAIL_LINK_SELECTOR = '.send-email-link';
  var EMAIL_BUTTON_SELECTOR = '.email-button';

  return Form.extend({

    usernameField: function () {
      return this.input(USERNAME_FIELD);
    },

    usernameLabel: function () {
      return this.$(USERNAME_LABEL);
    },

    usernameExplain: function () {
      return this.explain(USERNAME_FIELD);
    },

    getUsernameAutocomplete: function () {
      return this.autocomplete(USERNAME_FIELD);
    },

    usernameErrorField: function () {
      return this.error(USERNAME_FIELD);
    },

    usernameTooltipText: function () {
      return this.tooltipText(USERNAME_FIELD);
    },

    setUsername: function (val) {
      var field = this.usernameField();
      field.val(val);
      field.trigger('change');
    },

    hasSmsButton: function () {
      return this.button(SMS_BUTTON_SELECTOR).length > 0;
    },

    smsHintText: function () {
      return this.$(SMS_HINT_SELECTOR).trimmedText();
    },

    hasSmsHint: function () {
      return this.$(SMS_HINT_SELECTOR).is(':visible');
    },

    sendSms: function () {
      this.button(SMS_BUTTON_SELECTOR).click();
    },

    mobileRecoveryHintText: function () {
      return this.$(MOBILE_RECOVERY_HINT_SELECTOR).trimmedText();
    },

    hasMobileRecoveryHint: function () {
      return this.$(MOBILE_RECOVERY_HINT_SELECTOR).is(':visible');
    },

    hasCallButton: function () {
      return this.button(CALL_BUTTON_SELECTOR).length > 0;
    },

    makeCall: function () {
      this.button(CALL_BUTTON_SELECTOR).click();
    },

    hasEmailButton: function () {
      return this.button(EMAIL_BUTTON_SELECTOR).length > 0;
    },

    sendEmail: function () {
      return this.button(EMAIL_BUTTON_SELECTOR).click();
    },

    goBack: function () {
      this.$('.js-back').click();
    },

    // Email Send Confirmation view

    getEmailSentConfirmationText: function () {
      return this.$('p').text();
    },

    backToLoginButton: function () {
      return this.el(EMAIL_SENT_BACK_BTN);
    },

    goBackToLogin: function () {
      this.backToLoginButton().click();
    },

    hasCantAccessEmailLink: function () {
      return this.$(CANT_ACCESS_EMAIL_SELECTOR).is(':visible');
    },

    clickCantAccessEmail: function () {
      this.$(CANT_ACCESS_EMAIL_SELECTOR).click();
    },

    contactSupport: function () {
      return this.$('.contact-support');
    },

    contactSupportText: function () {
      return this.contactSupport().trimmedText();
    },

    sendEmailLink: function () {
      return this.$(SEND_EMAIL_LINK_SELECTOR);
    },

    hasSendEmailLink: function () {
      return this.sendEmailLink().is(':visible');
    },

    clickSendEmailLink: function () {
      this.sendEmailLink().click();
    },

    pressEnter: function () {
      this.$('form.o-form').submit();
    }

  });

});
