import Form from './Form';
const ANSWER_FIELD = 'answer';
const ANSWER_LABEL = 'label[for="mfa-answer"]';
const PASSWORD_FIELD = 'password';
const SHOW_ANSWER_FIELD = 'showAnswer';
const REMEMBER_DEVICE = 'rememberDevice';
const AUTO_PUSH = 'autoPush';
const FACTOR_PUSH = 'factor-push';
const NUMBER_CHALLENGE_VIEW_CLASS = '.number-challenge-view';
export default Form.extend({
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

  accessibilityText: function () {
    return this.$('.accessibility-text').trimmedText();
  },

  answerField: function () {
    return this.input(ANSWER_FIELD);
  },

  answerLabel: function () {
    return this.$(ANSWER_LABEL);
  },

  setAnswer: function (val) {
    const field = this.answerField();

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
    const field = this.passwordField();

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
    const rememberDevice = this.rememberDeviceCheckbox();

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
    const autoPush = this.autoPushCheckbox();

    autoPush.prop('checked', val);
    autoPush.trigger('change');
  },

  isPushSent: function () {
    const buttonText = 'Push sent!';
    return this.button('.mfa-verify ').val() === buttonText
      && this.accessibilityText() === buttonText;
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
  },

  factorPageCustomLink: function ($sandbox) {
    return $sandbox.find('.js-factor-page-custom-link');
  },

  factorPageCustomLinkLabel: function ($sandbox) {
    return this.factorPageCustomLink($sandbox).text();
  },

  factorPageCustomLinkHref: function ($sandbox) {
    return this.factorPageCustomLink($sandbox).attr('href');
  },
});
