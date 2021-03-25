import Form from './Form';
const USERNAME_FIELD = 'username';
const USERNAME_LABEL = 'label[for="account-recovery-username"]';
const SMS_BUTTON_SELECTOR = '.sms-button';
const SMS_HINT_SELECTOR = '.sms-hint';
const CALL_BUTTON_SELECTOR = '.call-button';
const MOBILE_RECOVERY_HINT_SELECTOR = '.mobile-recovery-hint';
const CANT_ACCESS_EMAIL_SELECTOR = '.js-contact-support';
const EMAIL_SENT_BACK_BTN = 'back-button';
const SEND_EMAIL_LINK_SELECTOR = '.send-email-link';
const EMAIL_BUTTON_SELECTOR = '.email-button';
export default Form.extend({
  usernameField: function() {
    return this.input(USERNAME_FIELD);
  },

  usernameLabel: function() {
    return this.$(USERNAME_LABEL);
  },

  usernameExplain: function() {
    return this.explain(USERNAME_FIELD);
  },

  getUsernameAutocomplete: function() {
    return this.autocomplete(USERNAME_FIELD);
  },

  usernameErrorField: function() {
    return this.error(USERNAME_FIELD);
  },

  usernameTooltipText: function() {
    return this.tooltipText(USERNAME_FIELD);
  },

  setUsername: function(val) {
    const field = this.usernameField();

    field.val(val);
    field.trigger('change');
  },

  hasSmsButton: function() {
    return this.button(SMS_BUTTON_SELECTOR).length > 0;
  },

  smsHintText: function() {
    return this.$(SMS_HINT_SELECTOR).trimmedText();
  },

  hasSmsHint: function() {
    return Form.isVisible(this.$(SMS_HINT_SELECTOR));
  },

  sendSms: function() {
    this.button(SMS_BUTTON_SELECTOR).click();
  },

  mobileRecoveryHintText: function() {
    return this.$(MOBILE_RECOVERY_HINT_SELECTOR).trimmedText();
  },

  hasMobileRecoveryHint: function() {
    return Form.isVisible(this.$(MOBILE_RECOVERY_HINT_SELECTOR));
  },

  hasCallButton: function() {
    return this.button(CALL_BUTTON_SELECTOR).length > 0;
  },

  makeCall: function() {
    this.button(CALL_BUTTON_SELECTOR).click();
  },

  hasEmailButton: function() {
    return this.button(EMAIL_BUTTON_SELECTOR).length > 0;
  },

  sendEmail: function() {
    return this.button(EMAIL_BUTTON_SELECTOR).click();
  },

  goBack: function() {
    this.$('.js-back').click();
  },

  // Email Send Confirmation view

  getEmailSentConfirmationText: function() {
    return this.$('p').text();
  },

  backToLoginButton: function() {
    return this.el(EMAIL_SENT_BACK_BTN);
  },

  goBackToLogin: function() {
    this.backToLoginButton().click();
  },

  hasCantAccessEmailLink: function() {
    return Form.isVisible(this.$(CANT_ACCESS_EMAIL_SELECTOR));
  },

  clickCantAccessEmail: function() {
    this.$(CANT_ACCESS_EMAIL_SELECTOR).click();
  },

  contactSupport: function() {
    return this.$('.contact-support');
  },

  contactSupportText: function() {
    return this.contactSupport().trimmedText();
  },

  sendEmailLink: function() {
    return this.$(SEND_EMAIL_LINK_SELECTOR);
  },

  hasSendEmailLink: function() {
    return this.sendEmailLink().css('visibility') === 'visible';
  },

  clickSendEmailLink: function() {
    this.sendEmailLink().click();
  },

  pressEnter: function() {
    this.$('form.o-form').submit();
  },
});
