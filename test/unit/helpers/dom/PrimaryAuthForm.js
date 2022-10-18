import { _, $ } from 'okta';
import Form from './Form';
const USERNAME_FIELD = 'username';
const USERNAME_LABEL = 'label[for="okta-signin-username"]';
const PASSWORD_FIELD = 'password';
const PASSWORD_LABEL = 'label[for="okta-signin-password"]';
const REMEMBER_ME_FIELD = 'remember';
const REMEMBER_ME_LABEL = 'label[data-se-for-name="remember"]';
const SECURITY_BEACON = 'security-beacon';
const CLASS_SELECTOR = '.primary-auth';
const SIGN_IN_BUTTON = '.button.button-primary';
export default Form.extend({
  isPrimaryAuth: function() {
    return this.$(CLASS_SELECTOR).length === 1;
  },

  primaryAuthForm: function() {
    return this.$(CLASS_SELECTOR + ' form');
  },

  usernameField: function() {
    return this.input(USERNAME_FIELD);
  },

  usernameLabel: function() {
    return this.$(USERNAME_LABEL);
  },

  usernameExplain: function() {
    return this.explain(USERNAME_FIELD);
  },

  usernameErrorField: function() {
    return this.error(USERNAME_FIELD);
  },

  getUsernameFieldAutocomplete: function() {
    return this.autocomplete(USERNAME_FIELD);
  },

  passwordField: function() {
    return this.input(PASSWORD_FIELD);
  },

  passwordLabel: function() {
    return this.$(PASSWORD_LABEL);
  },

  passwordExplain: function() {
    return this.explain(PASSWORD_FIELD);
  },

  passwordErrorField: function() {
    return this.error(PASSWORD_FIELD);
  },

  getPasswordFieldAutocomplete: function() {
    return this.autocomplete(PASSWORD_FIELD);
  },

  signInButton: function() {
    return this.$(SIGN_IN_BUTTON);
  },

  rememberMeCheckbox: function() {
    return this.checkbox(REMEMBER_ME_FIELD);
  },

  rememberMeLabelText: function() {
    return this.checkboxLabelText(REMEMBER_ME_FIELD);
  },

  rememberMeCheckboxStatus: function() {
    const isChecked = this.$(REMEMBER_ME_LABEL).hasClass('checked');

    return isChecked ? 'checked' : 'unchecked';
  },

  usernameTooltipText: function() {
    return this.tooltipText(USERNAME_FIELD);
  },

  passwordTooltipText: function() {
    return this.tooltipText(PASSWORD_FIELD);
  },

  securityImageTooltipText: function() {
    return this.tooltipText(SECURITY_BEACON);
  },

  isSecurityImageTooltipDestroyed: function() {
    const api = this.tooltipApi(SECURITY_BEACON);

    return api ? api.destroyed : true;
  },

  securityBeacon: function() {
    return this.el(SECURITY_BEACON);
  },

  securityBeaconContainer: function() {
    return this.$('.beacon-container');
  },

  editingUsername: function(val) {
    const field = this.usernameField();

    field.val(val);
    field.trigger('change');
    return field;
  },

  setUsername: function(val) {
    this.editingUsername(val).trigger('focusout');
  },

  setPassword: function(val) {
    const field = this.passwordField();

    field.val(val);
    field.trigger('change');
  },

  setRememberMe: function(val) {
    const field = this.rememberMeCheckbox();

    field.prop('checked', val);
    field.trigger('change');
  },

  helpFooter: function() {
    return this.$('.js-help');
  },

  helpFooterLabel: function() {
    return this.helpFooter().text();
  },

  backLinkFooter: function() {
    return this.$('.footer-back-link');
  },

  helpLink: function() {
    return this.$('.js-help-link');
  },

  helpLinkLabel: function() {
    return this.helpLink().text();
  },

  helpLinkHref: function() {
    return this.helpLink().attr('href');
  },

  forgotPasswordLink: function() {
    return this.$('.js-forgot-password');
  },

  forgotPasswordLabel: function() {
    return this.forgotPasswordLink().text();
  },

  forgotPasswordLinkVisible: function() {
    return this.forgotPasswordLink().is(':visible');
  },

  unlockLink: function() {
    return this.$('.js-unlock');
  },

  unlockLabel: function() {
    return this.unlockLink().text();
  },

  unlockLinkVisible: function() {
    return this.unlockLink().is(':visible');
  },

  customLinks: function() {
    return _.map(this.$('a.js-custom'), function(el) {
      const $el = $(el);
      const link = {
        text: $el.text(),
        href: $el.attr('href'),
        rel: $el.attr('rel'),
      };

      if ($el.attr('target')) {
        link.target = $el.attr('target');
      }
      return link;
    });
  },

  primaryAuthContainer: function() {
    return this.$('.primary-auth-container');
  },

  hasSocialAuthDivider: function() {
    return this.$('.auth-divider').length === 1;
  },

  socialAuthButton: function(idp) {
    return this.el('social-auth-' + idp + '-button');
  },

  facebookButton: function() {
    return this.socialAuthButton('facebook');
  },

  googleButton: function() {
    return this.socialAuthButton('google');
  },

  appleButton: function() {
    return this.socialAuthButton('apple');
  },

  linkedInButton: function() {
    return this.socialAuthButton('linkedin');
  },

  microsoftButton: function() {
    return this.socialAuthButton('microsoft');
  },

  socialAuthButtons: function() {
    return this.$('.social-auth-button');
  },

  linksAppearDisabled: function() {
    return this.$('a.link.o-form-disabled').length === this.$('a.link').length;
  },

  inputsDisabled: function() {
    return (
      this.usernameField().is(':disabled') &&
      this.passwordField().is(':disabled') &&
      this.rememberMeCheckbox().is(':disabled')
    );
  },

  isDisabled: function() {
    return this.inputsDisabled() && this.linksAppearDisabled();
  },

  isUsernameDisabled: function() {
    return this.usernameField().is(':disabled');
  },

  additionalAuthButton: function() {
    return this.$('.default-custom-button');
  },

  pivButton: function() {
    return this.$('.piv-button');
  },

  authDivider: function() {
    return this.$('.auth-divider');
  },

  registrationContainer: function() {
    return this.$('.registration-container');
  },

  registrationLabel: function() {
    return this.$('.registration-container .content-container .registration-label');
  },

  registrationLink: function() {
    return this.$('.registration-container .content-container .registration-link');
  },

  passwordToggleContainer: function() {
    return this.$('.password-toggle');
  },

  passwordToggleShowContainer: function() {
    return this.$('.password-toggle span.button-show');
  },

  passwordToggleHideContainer: function() {
    return this.$('.password-toggle span.button-hide');
  },
});
