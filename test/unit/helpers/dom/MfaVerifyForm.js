define(['./Form'], function (Form) {

  var ANSWER_FIELD = 'answer';
  var ANSWER_LABEL = 'label[for="mfa-answer"]';
  var PASSWORD_FIELD = 'password';
  var SHOW_ANSWER_FIELD = 'showAnswer';
  var REMEMBER_DEVICE = 'rememberDevice';
  var AUTO_PUSH = 'autoPush';
  var FACTOR_PUSH = 'factor-push';
  var NUMBER_CHALLENGE_VIEW_CLASS = '.number-challenge-view';

  return Form.extend({

    isDuo: function () {
      return this.el('factor-duo').length === 1;
    },

    isPush: function () {
      return this.el(FACTOR_PUSH).length === 1;
    },

    isSecurityQuestion: function () {
      return this.el('factor-question').length === 1;
    },

    isTOTP: function () {
      return this.el('factor-totp').length === 1;
    },

    isSMS: function () {
      return this.el('factor-sms').length === 1;
    },

    isCall: function () {
      return this.el('factor-call').length === 1;
    },

    isEmail: function () {
      return this.el('factor-email').length === 1;
    },

    isInlineTOTP: function () {
      return this.el('factor-inline-totp').length === 1;
    },

    isPassword: function () {
      return this.el('factor-password').length === 1;
    },

    isCustomFactor: function () {
      return this.el('factor-custom').length === 1;
    },

    answerField: function () {
      return this.input(ANSWER_FIELD);
    },

    answerLabel: function () {
      return this.$(ANSWER_LABEL);
    },

    setAnswer: function (val) {
      var field = this.answerField();
      field.val(val);
      field.trigger('change');
    },

    showAnswerLabelText: function () {
      return this.checkboxLabelText(SHOW_ANSWER_FIELD);
    },

    answerButtonsContainer: function () {
      return this.el('o-form-input-answer').find('.password-toggle');
    },

    showAnswerButton: function () {
      return this.el('o-form-input-answer').find('.button-show');
    },

    hideAnswerButton: function () {
      return this.el('o-form-input-answer').find('.button-hide');
    },

    passwordField: function () {
      return this.input(PASSWORD_FIELD);
    },

    setPassword: function (val) {
      var field = this.passwordField();
      field.val(val);
      field.trigger('change');
    },

    showPasswordLabelText: function () {
      return this.checkboxLabelText(SHOW_ANSWER_FIELD);
    },

    passwordButtonsContainer: function () {
      return this.el('o-form-input-password').find('.password-toggle');
    },

    showPasswordButton: function () {
      return this.el('o-form-input-password').find('.button-show');
    },

    hidePasswordButton: function () {
      return this.el('o-form-input-password').find('.button-hide');
    },

    rememberDeviceCheckbox: function () {
      return this.checkbox(REMEMBER_DEVICE);
    },

    rememberDeviceLabelText: function () {
      return this.checkboxLabelText(REMEMBER_DEVICE);
    },

    isRememberDeviceChecked: function () {
      return this.checkbox(REMEMBER_DEVICE).prop('checked');
    },

    setRememberDevice: function (val) {
      var rememberDevice = this.rememberDeviceCheckbox();
      rememberDevice.prop('checked', val);
      rememberDevice.trigger('change');
    },

    autoPushCheckbox: function () {
      return this.checkbox(AUTO_PUSH);
    },

    autoPushLabelText: function () {
      return this.checkboxLabelText(AUTO_PUSH);
    },

    isAutoPushChecked: function () {
      return this.checkbox(AUTO_PUSH).prop('checked');
    },

    setAutoPush: function (val) {
      var autoPush = this.autoPushCheckbox();
      autoPush.prop('checked', val);
      autoPush.trigger('change');
    },

    isPushSent: function () {
      return this.button('.mfa-verify ').val() === 'Push sent!';
    },

    numberChallengeView: function () {
      return this.el(FACTOR_PUSH).find(NUMBER_CHALLENGE_VIEW_CLASS);
    },

    getChallengeNumber: function () {
      return this.el('challenge-number').text().trim();
    },

    smsSendCode: function () {
      return this.el('sms-send-code');
    },

    makeCall: function () {
      return this.el('make-call');
    },

    inlineTOTPVerify: function () {
      return this.el('inline-totp-verify');
    },

    inlineTOTPVerifyText: function () {
      return this.inlineTOTPVerify().trimmedText();
    },

    inlineTOTPAdd: function () {
      return this.el('inline-totp-add');
    },

    inlineTOTPAddText: function () {
      return this.inlineTOTPAdd().trimmedText();
    },

    iframe: function () {
      return this.$('iframe');
    },

    passCodeErrorField: function () {
      return this.error('answer');
    },

    passwordErrorField: function () {
      return this.error('password');
    },

    getAutocomplete: function () {
      return this.autocomplete(ANSWER_FIELD);
    },

    signoutLink: function ($sandbox) {
      return $sandbox.find('[data-se=signout-link]');
    },

    passwordToggleShowContainer: function () {
      return this.$('.password-toggle span.button-show');
    },

    passwordToggleHideContainer: function () {
      return this.$('.password-toggle span.button-hide');
    }

  });

});
