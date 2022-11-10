import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import TextBox from './TextBox.js';

const toggleTemplate = _Handlebars2.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function (container, depth0, helpers, partials, data) {
    return "<span class=\"password-toggle\"><span class=\"eyeicon visibility-16 button-show\"></span><span class=\"eyeicon visibility-off-16 button-hide\"></span></span>";
  },
  "useData": true
});

const toggleTimeout = 30000;
var PasswordBox = TextBox.extend({
  initialize: function () {
    if (this.__showPasswordToggle()) {
      this.events['click .password-toggle .button-show'] = '__showPassword';
      this.events['click .password-toggle .button-hide'] = '__hidePassword';
    }

    this.delegateEvents();
  },
  postRender: function () {
    if (this.isEditMode() && this.__showPasswordToggle()) {
      this.$el.append(toggleTemplate);
      this.$el.find('input[type="password"]').addClass('password-with-toggle');
    }

    TextBox.prototype.postRender.apply(this, arguments);
  },
  __showPasswordToggle: function () {
    return this.options.params && this.options.params.showPasswordToggle;
  },
  __showPassword: function () {
    // turn off the spellcheck if the user decides to switch to regular input
    // in order to prevent sending passwords to third party spellcheckers
    this.$('input').attr('spellcheck', false);
    TextBox.prototype.changeType.apply(this, ['text']);
    this.$('.password-toggle .button-show').hide();
    this.$('.password-toggle .button-hide').show();
    this.passwordToggleTimer = oktaUnderscore.delay(() => {
      this.__hidePassword();
    }, toggleTimeout);
  },
  __hidePassword: function () {
    TextBox.prototype.changeType.apply(this, ['password']);
    this.$('.password-toggle .button-show').show();
    this.$('.password-toggle .button-hide').hide(); // clear timeout

    if (this.passwordToggleTimer) {
      clearTimeout(this.passwordToggleTimer);
    }
  }
});

export { PasswordBox as default };
