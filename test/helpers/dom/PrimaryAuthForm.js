define(['jquery', 'underscore', './Form'], function ($, _, Form) {

  var USERNAME_FIELD = 'username';
  var PASSWORD_FIELD = 'password';
  var REMEMBER_ME_FIELD = 'remember';
  var REMEMBER_ME_LABEL = 'label[data-se-for-name="remember"]';
  var SECURITY_BEACON = 'security-beacon';
  var CLASS_SELECTOR = '.primary-auth';

  return Form.extend({

    isPrimaryAuth: function () {
      return this.$(CLASS_SELECTOR).length === 1;
    },

    primaryAuthForm: function () {
      return this.$(CLASS_SELECTOR + ' form');
    },

    usernameField: function () {
      return this.input(USERNAME_FIELD);
    },

    usernameErrorField: function () {
      return this.error(USERNAME_FIELD);
    },

    getUsernameFieldAutocomplete: function () {
      return this.autocomplete(USERNAME_FIELD);
    },

    passwordField: function () {
      return this.input(PASSWORD_FIELD);
    },

    passwordErrorField: function () {
      return this.error(PASSWORD_FIELD);
    },

    getPasswordFieldAutocomplete: function () {
      return this.autocomplete(PASSWORD_FIELD);
    },

    rememberMeCheckbox: function () {
      return this.checkbox(REMEMBER_ME_FIELD);
    },

    rememberMeLabelText: function () {
      return this.checkboxLabelText(REMEMBER_ME_FIELD);
    },

    rememberMeCheckboxStatus: function () {
      var isChecked = this.$(REMEMBER_ME_LABEL).hasClass('checked');
      return isChecked ? 'checked' : 'unchecked';
    },

    passwordJammer: function () {
      return this.$('.password-jammer');
    },

    usernameTooltipText: function () {
      return this.tooltipText(USERNAME_FIELD);
    },

    passwordTooltipText: function () {
      return this.tooltipText(PASSWORD_FIELD);
    },

    securityImageTooltipText: function () {
      return this.tooltipText(SECURITY_BEACON);
    },

    securityBeacon: function () {
      return this.el(SECURITY_BEACON);
    },

    editingUsername: function (val) {
      var field = this.usernameField();
      field.val(val);
      field.trigger('change');
      return field;
    },

    setUsername: function (val) {
      this.editingUsername(val).trigger('focusout');
    },

    setPassword: function (val) {
      var field = this.passwordField();
      field.val(val);
      field.trigger('change');
    },

    setRememberMe: function (val) {
      var field = this.rememberMeCheckbox();
      field.prop('checked', val);
      field.trigger('change');
    },

    helpFooter: function () {
      return this.$('.js-help');
    },

    helpFooterLabel: function () {
      return this.helpFooter().text();
    },

    helpLink: function () {
      return this.$('.js-help-link');
    },

    helpLinkLabel: function () {
      return this.helpLink().text();
    },

    helpLinkHref: function () {
      return this.helpLink().attr('href');
    },

    forgotPasswordLink: function () {
      return this.$('.js-forgot-password');
    },

    forgotPasswordLabel: function () {
      return this.forgotPasswordLink().text();
    },

    forgotPasswordLinkVisible: function () {
      return this.forgotPasswordLink().is(':visible');
    },

    unlockLink: function () {
      return this.$('.js-unlock');
    },

    unlockLabel: function () {
      return this.unlockLink().text();
    },

    unlockLinkVisible: function () {
      return this.unlockLink().is(':visible');
    },

    customLinks: function () {
      return _.map(this.$('a.js-custom'), function (el) {
        var $el = $(el);
        return {
          text: $el.text(),
          href: $el.attr('href')
        };
      });
    },

    socialAuthContainer: function () {
      return this.$('.social-auth');
    },

    hasSocialAuthDivider: function () {
      return this.$('.auth-divider').length === 1;
    },

    socialAuthButton: function (idp) {
      return this.el('social-auth-' + idp + '-button');
    },

    facebookButton: function () {
      return this.socialAuthButton('facebook');
    },

    googleButton: function () {
      return this.socialAuthButton('google');
    },

    linkedInButton: function () {
      return this.socialAuthButton('linkedin');
    },

    socialAuthButtons: function () {
      return this.$('.social-auth-button');
    }

  });

});
