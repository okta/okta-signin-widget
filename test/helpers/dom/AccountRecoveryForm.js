define(['./Form'], function (Form) {

  var USERNAME_FIELD = 'username';
  var SMS_BUTTON_SELECTOR = '.sms-button';
  var CANT_ACCESS_EMAIL_SELECTOR = '.js-contact-support';
  var EMAIL_SENT_BACK_BTN = 'back-button';

  return Form.extend({

    usernameField: function () {
      return this.input(USERNAME_FIELD);
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

    sendSms: function () {
      this.button(SMS_BUTTON_SELECTOR).click();
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
    }

  });

});
